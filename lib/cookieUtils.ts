// lib/cookieUtils.ts - Enhanced with better debugging and schema-matched caching
const DEFAULT_PATH = '/';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60;
const DEFAULT_SAME_SITE = 'lax';

interface CookieOptions {
  path?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  domain?: string;
}

interface StorageItem<T> {
  value: T;
  expiry: number | null;
  timestamp: number;
  userId?: string;
  version?: string;
}

export const setCookie = (name: string, value: string, options?: CookieOptions): void => {
  try {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    cookieString += `; path=${options?.path || DEFAULT_PATH}`;
    
    if (options?.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    } else if (options?.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    } else {
      cookieString += `; max-age=${DEFAULT_MAX_AGE}`;
    }
    
    if (options?.domain) cookieString += `; domain=${options.domain}`;
    if (options?.secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) cookieString += '; secure';
    if (options?.httpOnly) cookieString += '; httpOnly';
    cookieString += `; samesite=${options?.sameSite || DEFAULT_SAME_SITE}`;
    
    if (typeof document !== 'undefined') {
      document.cookie = cookieString;
      console.log(`[Cookie] Set: ${name} (${value.length} chars)`);
    }
  } catch (e) {
    console.error(`[Cookie] Error setting ${name}:`, e);
  }
};

export const getCookie = (name: string): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';').map(c => c.trim());
    const encodedName = encodeURIComponent(name);
    const cookie = cookies.find(c => c.startsWith(`${encodedName}=`));
    if (!cookie) return null;
    const value = cookie.split('=')[1];
    try {
      return decodeURIComponent(value);
    } catch (e) {
      console.error(`[Cookie] Error decoding cookie value for ${name}:`, e);
      return value;
    }
  } catch (e) {
    console.error(`[Cookie] Error getting ${name}:`, e);
    return null;
  }
};

export const removeCookie = (name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void => {
  setCookie(name, '', { ...options, expires: new Date(0), maxAge: 0 });
  console.log(`[Cookie] Removed: ${name}`);
};

export const setJSONCookie = <T>(name: string, value: T, options?: CookieOptions): void => {
  try {
    const stringValue = JSON.stringify(value);
    setCookie(name, stringValue, options);
  } catch (e) {
    console.error(`[Cookie] Error stringifying JSON for cookie ${name}:`, e);
  }
};

export const getJSONCookie = <T>(name: string, defaultValue?: T): T | null => {
  const cookie = getCookie(name);
  if (!cookie) return defaultValue || null;
  try {
    return JSON.parse(cookie) as T;
  } catch (e) {
    console.error(`[Cookie] Error parsing JSON from cookie ${name}:`, e);
    removeCookie(name);
    return defaultValue || null;
  }
};

const CACHE_VERSION = '1.2.0';

export const storage = {
  set: <T>(key: string, value: T, expiryInSeconds?: number, userId?: string): void => {
    const item: StorageItem<T> = {
      value,
      expiry: expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null,
      timestamp: Date.now(),
      userId,
      version: CACHE_VERSION
    };
    const serializedItem = JSON.stringify(item);
    
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serializedItem);
        console.log(`[Storage] ✅ Set in localStorage: ${key} (${serializedItem.length} chars) ${userId ? `for user ${userId.slice(-4)}` : ''}`);
        return;
      }
    } catch (e) { console.warn(`[Storage] localStorage failed for ${key}:`, e); }
    
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, serializedItem);
        console.log(`[Storage] ⚠️ Set in sessionStorage: ${key} (fallback)`);
        return;
      }
    } catch (e) { console.warn(`[Storage] sessionStorage failed for ${key}:`, e); }
    
    try {
      if (serializedItem.length < 3000) {
        setJSONCookie(key, item, { maxAge: expiryInSeconds || DEFAULT_MAX_AGE });
        console.log(`[Storage] ⚠️ Set in cookie: ${key} (fallback)`);
        return;
      }
    } catch (e) { console.warn(`[Storage] Cookie fallback failed for ${key}:`, e); }
    
    console.error(`[Storage] ❌ All storage methods failed for ${key}`);
  },
  
  get: <T>(key: string, defaultValue?: T, expectedUserId?: string): T | null => {
    const sources = ['localStorage', 'sessionStorage', 'cookie'] as const;
    
    for (const source of sources) {
      try {
        let itemStr: string | null = null;
        
        switch (source) {
          case 'localStorage':
            if (typeof localStorage !== 'undefined') itemStr = localStorage.getItem(key);
            break;
          case 'sessionStorage':
            if (typeof sessionStorage !== 'undefined') itemStr = sessionStorage.getItem(key);
            break;
          case 'cookie':
            itemStr = getCookie(key);
            if (itemStr) {
              try {
                const parsed = JSON.parse(itemStr);
                if (parsed.value !== undefined) {
                  itemStr = itemStr;
                } else {
                  itemStr = JSON.stringify({ value: parsed, expiry: null, timestamp: Date.now(), version: CACHE_VERSION });
                }
              } catch {
                itemStr = JSON.stringify({ value: itemStr, expiry: null, timestamp: Date.now(), version: CACHE_VERSION });
              }
            }
            break;
        }
        
        if (!itemStr) continue;
        const item: StorageItem<T> = JSON.parse(itemStr);
        
        if (item.version && item.version !== CACHE_VERSION) {
          console.log(`[Storage] 🔄 Cache version mismatch in ${source}: ${key} (${item.version} vs ${CACHE_VERSION})`);
          storage.remove(key);
          continue;
        }
        
        if (item.expiry && Date.now() > item.expiry) {
          console.log(`[Storage] ⏰ Expired in ${source}: ${key}`);
          storage.remove(key);
          continue;
        }
        
        if (expectedUserId && item.userId && item.userId !== expectedUserId) {
          console.log(`[Storage] 👤 User mismatch in ${source}: ${key} (expected ${expectedUserId.slice(-4)}, got ${item.userId.slice(-4)})`);
          continue;
        }
        
        console.log(`[Storage] ✅ Retrieved from ${source}: ${key} ${item.userId ? `(user ${item.userId.slice(-4)})` : ''}`);
        return item.value;
      } catch (e) {
        console.warn(`[Storage] Error reading from ${source} for ${key}:`, e);
        continue;
      }
    }
    
    console.log(`[Storage] 🔍 Not found in any storage: ${key}`);
    return defaultValue || null;
  },
  
  remove: (key: string): void => {
    let removedFrom: string[] = [];
    try { if (typeof localStorage !== 'undefined') { localStorage.removeItem(key); removedFrom.push('localStorage'); } } catch (e) { console.warn(`[Storage] Error removing from localStorage: ${key}`, e); }
    try { if (typeof sessionStorage !== 'undefined') { sessionStorage.removeItem(key); removedFrom.push('sessionStorage'); } } catch (e) { console.warn(`[Storage] Error removing from sessionStorage: ${key}`, e); }
    try { removeCookie(key); removedFrom.push('cookie'); } catch (e) { console.warn(`[Storage] Error removing cookie: ${key}`, e); }
    console.log(`[Storage] 🗑️ Removed from [${removedFrom.join(', ')}]: ${key}`);
  },
  
  has: (key: string, expectedUserId?: string): boolean => {
    const value = storage.get(key, undefined, expectedUserId);
    return value !== null;
  },
  
  debug: (key: string): { [source: string]: any } => {
    const result: { [source: string]: any } = {};
    try { if (typeof localStorage !== 'undefined') { const item = localStorage.getItem(key); result.localStorage = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false }; } } catch (e) { result.localStorage = { error: e.message }; }
    try { if (typeof sessionStorage !== 'undefined') { const item = sessionStorage.getItem(key); result.sessionStorage = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false }; } } catch (e) { result.sessionStorage = { error: e.message }; }
    try { const item = getCookie(key); result.cookie = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false }; } catch (e) { result.cookie = { error: e.message }; }
    return result;
  },
  
  cleanup: (): void => {
    const storages = [
      { name: 'localStorage', storage: typeof localStorage !== 'undefined' ? localStorage : null },
      { name: 'sessionStorage', storage: typeof sessionStorage !== 'undefined' ? sessionStorage : null }
    ];
    
    for (const { name, storage: storageObj } of storages) {
      if (!storageObj) continue;
      try {
        const keys = Object.keys(storageObj);
        let cleaned = 0;
        for (const key of keys) {
          try {
            const itemStr = storageObj.getItem(key);
            if (!itemStr) continue;
            const item: StorageItem<any> = JSON.parse(itemStr);
            if (item.expiry && Date.now() > item.expiry) { storageObj.removeItem(key); cleaned++; }
          } catch { }
        }
        if (cleaned > 0) console.log(`[Storage] 🧹 Cleaned ${cleaned} expired items from ${name}`);
      } catch (e) { console.warn(`[Storage] Error during ${name} cleanup:`, e); }
    }
  },

  invalidateConversations: (userId?: string): void => {
    console.log('[Storage] 🔄 Invalidating conversation caches...');
    storage.remove(CACHE_KEYS.CONVERSATIONS);
    if (userId) storage.remove(CACHE_KEYS.USER_CONVERSATIONS(userId));
    storage.remove(CACHE_KEYS.SELECTED_CHAT);
    console.log('[Storage] ✅ Conversation caches invalidated');
  }
};

export const CACHE_KEYS = {
  CURRENT_USER: 'currentUser',
  CONVERSATIONS: 'conversations',
  USER_CONVERSATIONS: (userId: string) => `conversations_${userId}`,
  MESSAGES_PREFIX: 'messages_',
  USER_MESSAGES: (userId: string, channelId: string) => `messages_${userId}_${channelId}`,
  SELECTED_CHAT: 'selectedChat',
  CHANNEL_PARTICIPANTS: (channelId: string) => `participants_${channelId}`,
  USER_PROFILES: 'userProfiles',
  MESSAGE_ATTACHMENTS: (messageId: string) => `attachments_${messageId}`,
  READ_STATUS: (userId: string) => `readStatus_${userId}`,
  // 🎨 THEME CACHE KEYS (RESTORED)
  THEMES: 'themes',
  THEME_FONTS: 'themeFonts',
  USER_THEME: (userId: string) => `userTheme_${userId}`,
  THEME_METADATA: 'themeMetadata',
};

export const CACHE_EXPIRY = {
  SHORT: 60,
  MEDIUM: 5 * 60,
  LONG: 60 * 60,
  DAY: 24 * 60 * 60,
  WEEK: 7 * 24 * 60 * 60
};

export const cacheHelpers = {
  cacheConversations: (conversations: any[], userId: string): void => {
    storage.set(CACHE_KEYS.USER_CONVERSATIONS(userId), conversations, CACHE_EXPIRY.MEDIUM, userId);
    storage.set(CACHE_KEYS.CONVERSATIONS, conversations, CACHE_EXPIRY.MEDIUM);
    console.log(`[CacheHelper] 💾 Cached ${conversations.length} conversations for user ${userId.slice(-4)}`);
  },

  getCachedConversations: (userId: string): any[] | null => {
    let conversations = storage.get(CACHE_KEYS.USER_CONVERSATIONS(userId), null, userId);
    if (!conversations) conversations = storage.get(CACHE_KEYS.CONVERSATIONS);
    if (conversations && Array.isArray(conversations)) {
      console.log(`[CacheHelper] 📦 Retrieved ${conversations.length} conversations from cache`);
      return conversations;
    }
    return null;
  },

  cacheMessages: (messages: any[], userId: string, channelId: string): void => {
    storage.set(CACHE_KEYS.USER_MESSAGES(userId, channelId), messages, CACHE_EXPIRY.MEDIUM, userId);
    console.log(`[CacheHelper] 💾 Cached ${messages.length} messages for channel ${channelId.slice(-4)}`);
  },

  getCachedMessages: (userId: string, channelId: string): any[] | null => {
    const messages = storage.get(CACHE_KEYS.USER_MESSAGES(userId, channelId), null, userId);
    if (messages && Array.isArray(messages)) {
      console.log(`[CacheHelper] 📦 Retrieved ${messages.length} messages from cache`);
      return messages;
    }
    return null;
  },

  clearConversationCaches: (userId: string): void => {
    storage.invalidateConversations(userId);
  },

  // 🎨 THEME CACHE HELPERS (RESTORED)
  cacheThemes: (themes: any[]): void => {
    storage.set(CACHE_KEYS.THEMES, themes, CACHE_EXPIRY.DAY);
    console.log(`[CacheHelper] 🎨 Cached ${themes.length} themes`);
  },

  getCachedThemes: (): any[] | null => {
    const themes = storage.get(CACHE_KEYS.THEMES);
    if (themes && Array.isArray(themes)) {
      console.log(`[CacheHelper] 🎨 Retrieved ${themes.length} themes from cache`);
      return themes;
    }
    return null;
  },

  cacheThemeFonts: (fonts: any[]): void => {
    storage.set(CACHE_KEYS.THEME_FONTS, fonts, CACHE_EXPIRY.DAY);
    console.log(`[CacheHelper] 🔤 Cached ${fonts.length} theme fonts`);
  },

  getCachedThemeFonts: (): any[] | null => {
    const fonts = storage.get(CACHE_KEYS.THEME_FONTS);
    if (fonts && Array.isArray(fonts)) {
      console.log(`[CacheHelper] 🔤 Retrieved ${fonts.length} theme fonts from cache`);
      return fonts;
    }
    return null;
  },

  cacheUserTheme: (userId: string, themeData: any): void => {
    storage.set(CACHE_KEYS.USER_THEME(userId), themeData, CACHE_EXPIRY.WEEK, userId);
    console.log(`[CacheHelper] 🎨 Cached theme for user ${userId.slice(-4)}`);
  },

  getCachedUserTheme: (userId: string): any | null => {
    return storage.get(CACHE_KEYS.USER_THEME(userId), null, userId);
  },

  invalidateThemeCaches: (): void => {
    console.log('[CacheHelper] 🎨 Invalidating theme caches...');
    storage.remove(CACHE_KEYS.THEMES);
    storage.remove(CACHE_KEYS.THEME_FONTS);
    storage.remove(CACHE_KEYS.THEME_METADATA);
    console.log('[CacheHelper] ✅ Theme caches invalidated');
  }
};

if (typeof window !== 'undefined') {
  storage.cleanup();
  setInterval(() => { storage.cleanup(); }, 10 * 60 * 1000);
}

export const getLastPageForRedirect = (): string => {
  const lastPage = getCookie('lastPage');
  if (!lastPage) {
    console.log('[LastPage] No cookie found, redirecting to /');
    return '/';
  }
  const excludedPages = ['/sign-in', '/sign-up', '/forgot-password'];
  if (excludedPages.includes(lastPage)) {
    console.log(`[LastPage] Stored page is auth page (${lastPage}), redirecting to /`);
    return '/';
  }
  if (lastPage.startsWith('/#')) {
    console.log(`[LastPage] Hash route detected (${lastPage}), redirecting to / and preserving hash`);
    return '/';
  }
  console.log(`[LastPage] Using stored page: ${lastPage}`);
  return lastPage;
};

// 🔥 USER ROLE UTILITIES
const VALID_USER_ROLES = ['admin1', 'coachx7', 'client7x', 'user0x'] as const;
type ValidUserRole = typeof VALID_USER_ROLES[number];

export const userRoleCookies = {
  setUserRole: (role: string, userId?: string): boolean => {
    try {
      if (!VALID_USER_ROLES.includes(role as ValidUserRole)) {
        console.warn(`[UserRole] Invalid role attempted: ${role}. Valid roles:`, VALID_USER_ROLES);
        return false;
      }
      setCookie('userRole', role, { maxAge: 30 * 24 * 60 * 60, path: '/', secure: typeof window !== 'undefined' && window.location.protocol === 'https:', sameSite: 'lax' });
      if (userId) setCookie('userRoleUserId', userId, { maxAge: 30 * 24 * 60 * 60, path: '/', secure: typeof window !== 'undefined' && window.location.protocol === 'https:', sameSite: 'lax' });
      console.log(`[UserRole] ✅ Stored role: ${role} ${userId ? `for user ${userId.slice(-4)}` : ''}`);
      return true;
    } catch (error) {
      console.error('[UserRole] Error storing role:', error);
      return false;
    }
  },

  getUserRole: (expectedUserId?: string): ValidUserRole | null => {
    try {
      const role = getCookie('userRole');
      const storedUserId = getCookie('userRoleUserId');
      if (!role || !VALID_USER_ROLES.includes(role as ValidUserRole)) {
        if (role) {
          console.warn(`[UserRole] Invalid stored role: ${role}`);
          userRoleCookies.clearUserRole();
        }
        return null;
      }
      if (expectedUserId && storedUserId && storedUserId !== expectedUserId) {
        console.warn(`[UserRole] User ID mismatch. Expected: ${expectedUserId.slice(-4)}, Stored: ${storedUserId.slice(-4)}`);
        userRoleCookies.clearUserRole();
        return null;
      }
      console.log(`[UserRole] ✅ Retrieved role: ${role} ${storedUserId ? `for user ${storedUserId.slice(-4)}` : ''}`);
      return role as ValidUserRole;
    } catch (error) {
      console.error('[UserRole] Error retrieving role:', error);
      return null;
    }
  },

  isRoleValidForUser: (userId: string): boolean => {
    const storedUserId = getCookie('userRoleUserId');
    return storedUserId === userId;
  },

  clearUserRole: (): void => {
    try {
      removeCookie('userRole');
      removeCookie('userRoleUserId');
      console.log('[UserRole] 🗑️ Cleared user role cookies');
    } catch (error) {
      console.error('[UserRole] Error clearing role:', error);
    }
  },

  updateRoleIfChanged: (newRole: string, userId?: string): boolean => {
    const currentRole = userRoleCookies.getUserRole(userId);
    if (currentRole !== newRole) {
      console.log(`[UserRole] 🔄 Role changed: ${currentRole} → ${newRole}`);
      return userRoleCookies.setUserRole(newRole, userId);
    }
    return true;
  },

  getRoleWithFallback: async (userId: string, apiEndpoint: string): Promise<ValidUserRole> => {
    const cachedRole = userRoleCookies.getUserRole(userId);
    if (cachedRole) return cachedRole;
    try {
      console.log('[UserRole] 🌐 Fetching role from API...');
      const response = await fetch(apiEndpoint);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      const role = data.role;
      if (role && VALID_USER_ROLES.includes(role)) {
        userRoleCookies.setUserRole(role, userId);
        return role as ValidUserRole;
      } else {
        throw new Error(`Invalid role from API: ${role}`);
      }
    } catch (error) {
      console.error('[UserRole] API fallback failed:', error);
      const defaultRole = 'user0x' as ValidUserRole;
      console.log(`[UserRole] ⚠️ Using default role: ${defaultRole}`);
      return defaultRole;
    }
  }
};

export const USER_ROLE_CACHE_KEYS = {
  ROLE: 'userRole',
  ROLE_USER_ID: 'userRoleUserId',
  ROLE_TIMESTAMP: 'userRoleTimestamp',
  USER_PROFILE: (userId: string) => `profile_${userId}`,
  USER_PERMISSIONS: (userId: string) => `permissions_${userId}`
};

export const profileCache = {
  setProfile: (userId: string, profileData: any): void => {
    storage.set(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId), profileData, CACHE_EXPIRY.LONG, userId);
    if (profileData.role) userRoleCookies.setUserRole(profileData.role, userId);
  },

  getProfile: (userId: string): any | null => {
    return storage.get(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId), null, userId);
  },

  setPermissions: (userId: string, permissions: any): void => {
    storage.set(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId), permissions, CACHE_EXPIRY.MEDIUM, userId);
  },

  getPermissions: (userId: string): any | null => {
    return storage.get(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId), null, userId);
  },

  clearUserCaches: (userId: string): void => {
    storage.remove(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId));
    storage.remove(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId));
    userRoleCookies.clearUserRole();
    console.log(`[ProfileCache] 🗑️ Cleared caches for user ${userId.slice(-4)}`);
  }
};

export const roleDebug = {
  getDebugInfo: (userId?: string): any => {
    return {
      cookies: { userRole: getCookie('userRole'), userRoleUserId: getCookie('userRoleUserId'), themeId: getCookie('themeId'), lastPage: getCookie('lastPage') },
      storage: userId ? { profile: storage.debug(USER_ROLE_CACHE_KEYS.USER_PROFILE(userId)), permissions: storage.debug(USER_ROLE_CACHE_KEYS.USER_PERMISSIONS(userId)) } : null,
      validation: { validRoles: VALID_USER_ROLES, isRoleValid: userId ? userRoleCookies.isRoleValidForUser(userId) : 'N/A' }
    };
  },

  logDebugInfo: (userId?: string): void => {
    const info = roleDebug.getDebugInfo(userId);
    console.group('[RoleDebug] Complete Debug Information');
    console.log('Cookies:', info.cookies);
    console.log('Storage:', info.storage);
    console.log('Validation:', info.validation);
    console.groupEnd();
  }
};