// lib/cookieUtils.ts - Enhanced with better debugging and schema-matched caching

/**
 * Enhanced cookie utilities for managing browser cookies with better security and reliability
 * Optimized for your Supabase schema: channels, messages, channel_participants, profiles
 */

// Cookie defaults
const DEFAULT_PATH = '/';
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const DEFAULT_SAME_SITE = 'lax';  // 'strict', 'lax', or 'none'

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
  userId?: string; // Track which user this belongs to
  version?: string; // Schema version for cache invalidation
}

/**
 * Set a cookie with enhanced options
 */
export const setCookie = (name: string, value: string, options?: CookieOptions): void => {
  try {
    // Build the cookie string
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    // Add path (default: /)
    cookieString += `; path=${options?.path || DEFAULT_PATH}`;
    
    // Add expiration if specified
    if (options?.expires) {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    } 
    // Otherwise use max-age if specified or default
    else if (options?.maxAge !== undefined) {
      cookieString += `; max-age=${options.maxAge}`;
    } else {
      cookieString += `; max-age=${DEFAULT_MAX_AGE}`;
    }
    
    // Add domain if specified
    if (options?.domain) {
      cookieString += `; domain=${options.domain}`;
    }
    
    // Add security flags
    if (options?.secure || (typeof window !== 'undefined' && window.location.protocol === 'https:')) {
      cookieString += '; secure';
    }
    
    if (options?.httpOnly) {
      cookieString += '; httpOnly';
    }
    
    // Add SameSite (default: lax)
    cookieString += `; samesite=${options?.sameSite || DEFAULT_SAME_SITE}`;
    
    // Set the cookie
    if (typeof document !== 'undefined') {
      document.cookie = cookieString;
      console.log(`[Cookie] Set: ${name} (${value.length} chars)`);
    }
  } catch (e) {
    console.error(`[Cookie] Error setting ${name}:`, e);
  }
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    
    // Get all cookies and normalize
    const cookies = document.cookie.split(';').map(c => c.trim());
    
    // Find the named cookie
    const encodedName = encodeURIComponent(name);
    const cookie = cookies.find(c => c.startsWith(`${encodedName}=`));
    
    // Return null if not found
    if (!cookie) return null;
    
    // Extract and decode the value
    const value = cookie.split('=')[1];
    try {
      return decodeURIComponent(value);
    } catch (e) {
      console.error(`[Cookie] Error decoding cookie value for ${name}:`, e);
      return value; // Return raw value if decoding fails
    }
  } catch (e) {
    console.error(`[Cookie] Error getting ${name}:`, e);
    return null;
  }
};

/**
 * Remove a cookie
 */
export const removeCookie = (name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): void => {
  // Set expiration to past date to remove
  setCookie(name, '', { 
    ...options,
    expires: new Date(0),
    maxAge: 0
  });
  console.log(`[Cookie] Removed: ${name}`);
};

/**
 * Store JSON data in a cookie (automatically stringifies)
 */
export const setJSONCookie = <T>(name: string, value: T, options?: CookieOptions): void => {
  try {
    const stringValue = JSON.stringify(value);
    setCookie(name, stringValue, options);
  } catch (e) {
    console.error(`[Cookie] Error stringifying JSON for cookie ${name}:`, e);
  }
};

/**
 * Get and parse JSON data from a cookie
 */
export const getJSONCookie = <T>(name: string, defaultValue?: T): T | null => {
  const cookie = getCookie(name);
  if (!cookie) return defaultValue || null;
  
  try {
    return JSON.parse(cookie) as T;
  } catch (e) {
    console.error(`[Cookie] Error parsing JSON from cookie ${name}:`, e);
    removeCookie(name); // Remove invalid cookie
    return defaultValue || null;
  }
};

/**
 * Enhanced local storage with expiration support and multi-storage fallback
 * Optimized for your schema structure
 */
export const storage = {
  /**
   * Set an item with multiple storage fallbacks and user tracking
   */
  set: <T>(key: string, value: T, expiryInSeconds?: number, userId?: string): void => {
    const item: StorageItem<T> = {
      value,
      expiry: expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null,
      timestamp: Date.now(),
      userId,
      version: CACHE_VERSION // Add version for schema changes
    };
    
    const serializedItem = JSON.stringify(item);
    
    try {
      // Primary: localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, serializedItem);
        console.log(`[Storage] ✅ Set in localStorage: ${key} (${serializedItem.length} chars) ${userId ? `for user ${userId.slice(-4)}` : ''}`);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] localStorage failed for ${key}:`, e);
    }
    
    try {
      // Fallback 1: sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, serializedItem);
        console.log(`[Storage] ⚠️ Set in sessionStorage: ${key} (fallback)`);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] sessionStorage failed for ${key}:`, e);
    }
    
    try {
      // Fallback 2: Cookie (for small data only)
      if (serializedItem.length < 3000) { // Cookie size limit ~4KB
        setJSONCookie(key, item, { maxAge: expiryInSeconds || DEFAULT_MAX_AGE });
        console.log(`[Storage] ⚠️ Set in cookie: ${key} (fallback)`);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] Cookie fallback failed for ${key}:`, e);
    }
    
    console.error(`[Storage] ❌ All storage methods failed for ${key}`);
  },
  
  /**
   * Get an item with multi-storage fallback and user validation
   */
  get: <T>(key: string, defaultValue?: T, expectedUserId?: string): T | null => {
    const sources = ['localStorage', 'sessionStorage', 'cookie'] as const;
    
    for (const source of sources) {
      try {
        let itemStr: string | null = null;
        
        switch (source) {
          case 'localStorage':
            if (typeof localStorage !== 'undefined') {
              itemStr = localStorage.getItem(key);
            }
            break;
          case 'sessionStorage':
            if (typeof sessionStorage !== 'undefined') {
              itemStr = sessionStorage.getItem(key);
            }
            break;
          case 'cookie':
            itemStr = getCookie(key);
            if (itemStr) {
              // Cookie might be double-encoded
              try {
                const parsed = JSON.parse(itemStr);
                if (parsed.value !== undefined) {
                  itemStr = itemStr; // Already in correct format
                } else {
                  itemStr = JSON.stringify({ value: parsed, expiry: null, timestamp: Date.now(), version: CACHE_VERSION });
                }
              } catch {
                // Treat as raw value
                itemStr = JSON.stringify({ value: itemStr, expiry: null, timestamp: Date.now(), version: CACHE_VERSION });
              }
            }
            break;
        }
        
        if (!itemStr) continue;
        
        const item: StorageItem<T> = JSON.parse(itemStr);
        
        // Check cache version - invalidate if schema changed
        if (item.version && item.version !== CACHE_VERSION) {
          console.log(`[Storage] 🔄 Cache version mismatch in ${source}: ${key} (${item.version} vs ${CACHE_VERSION})`);
          storage.remove(key); // Remove outdated cache
          continue;
        }
        
        // Check if expired
        if (item.expiry && Date.now() > item.expiry) {
          console.log(`[Storage] ⏰ Expired in ${source}: ${key}`);
          storage.remove(key); // Clean up expired item
          continue;
        }
        
        // Check user ownership if specified
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
  
  /**
   * Remove an item from all storage locations
   */
  remove: (key: string): void => {
    let removedFrom: string[] = [];
    
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        removedFrom.push('localStorage');
      }
    } catch (e) {
      console.warn(`[Storage] Error removing from localStorage: ${key}`, e);
    }
    
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(key);
        removedFrom.push('sessionStorage');
      }
    } catch (e) {
      console.warn(`[Storage] Error removing from sessionStorage: ${key}`, e);
    }
    
    try {
      removeCookie(key);
      removedFrom.push('cookie');
    } catch (e) {
      console.warn(`[Storage] Error removing cookie: ${key}`, e);
    }
    
    console.log(`[Storage] 🗑️ Removed from [${removedFrom.join(', ')}]: ${key}`);
  },
  
  /**
   * Check if an item exists and is not expired in any storage
   */
  has: (key: string, expectedUserId?: string): boolean => {
    const value = storage.get(key, undefined, expectedUserId);
    return value !== null;
  },
  
  /**
   * Get detailed info about where data is stored for debugging
   */
  debug: (key: string): { [source: string]: any } => {
    const result: { [source: string]: any } = {};
    
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(key);
        result.localStorage = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false };
      }
    } catch (e) {
      result.localStorage = { error: e.message };
    }
    
    try {
      if (typeof sessionStorage !== 'undefined') {
        const item = sessionStorage.getItem(key);
        result.sessionStorage = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false };
      }
    } catch (e) {
      result.sessionStorage = { error: e.message };
    }
    
    try {
      const item = getCookie(key);
      result.cookie = item ? { exists: true, size: item.length, preview: item.slice(0, 100) + '...' } : { exists: false };
    } catch (e) {
      result.cookie = { error: e.message };
    }
    
    return result;
  },
  
  /**
   * Clean up expired items across all storage
   */
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
            if (item.expiry && Date.now() > item.expiry) {
              storageObj.removeItem(key);
              cleaned++;
            }
          } catch {
            // Skip invalid items
          }
        }
        
        if (cleaned > 0) {
          console.log(`[Storage] 🧹 Cleaned ${cleaned} expired items from ${name}`);
        }
      } catch (e) {
        console.warn(`[Storage] Error during ${name} cleanup:`, e);
      }
    }
  },

  /**
   * Force refresh cache for conversations after delete/update operations
   */
  invalidateConversations: (userId?: string): void => {
    console.log('[Storage] 🔄 Invalidating conversation caches...');
    
    // Remove all conversation-related caches
    storage.remove(CACHE_KEYS.CONVERSATIONS);
    
    if (userId) {
      storage.remove(CACHE_KEYS.USER_CONVERSATIONS(userId));
    }
    
    // Remove any selected chat cache
    storage.remove(CACHE_KEYS.SELECTED_CHAT);
    
    console.log('[Storage] ✅ Conversation caches invalidated');
  }
};

// Cache version for schema compatibility
const CACHE_VERSION = '1.2.0'; // Update this when schema changes

// Enhanced cache constants matching your Supabase schema
export const CACHE_KEYS = {
  // User authentication
  CURRENT_USER: 'currentUser',
  
  // Conversations (matches channels + channel_participants)
  CONVERSATIONS: 'conversations',
  USER_CONVERSATIONS: (userId: string) => `conversations_${userId}`,
  
  // Messages (matches messages table)
  MESSAGES_PREFIX: 'messages_',
  USER_MESSAGES: (userId: string, channelId: string) => `messages_${userId}_${channelId}`,
  
  // Current selections
  SELECTED_CHAT: 'selectedChat',
  
  // Participants (matches channel_participants table)
  CHANNEL_PARTICIPANTS: (channelId: string) => `participants_${channelId}`,
  
  // Profiles (matches profiles table)
  USER_PROFILES: 'userProfiles',
  
  // Message attachments (matches message_attachments table)
  MESSAGE_ATTACHMENTS: (messageId: string) => `attachments_${messageId}`,
  
  // Read status (matches message_read_status table)
  READ_STATUS: (userId: string) => `readStatus_${userId}`,
};

export const CACHE_EXPIRY = {
  SHORT: 60, // 1 minute - for frequently changing data
  MEDIUM: 5 * 60, // 5 minutes - for conversations and messages
  LONG: 60 * 60, // 1 hour - for user profiles and static data
  DAY: 24 * 60 * 60, // 1 day - for rarely changing data
  WEEK: 7 * 24 * 60 * 60 // 1 week - for very static data
};

// Schema-specific cache helpers
export const cacheHelpers = {
  /**
   * Cache a conversation list with proper user association
   */
  cacheConversations: (conversations: any[], userId: string): void => {
    storage.set(CACHE_KEYS.USER_CONVERSATIONS(userId), conversations, CACHE_EXPIRY.MEDIUM, userId);
    storage.set(CACHE_KEYS.CONVERSATIONS, conversations, CACHE_EXPIRY.MEDIUM); // Fallback
    console.log(`[CacheHelper] 💾 Cached ${conversations.length} conversations for user ${userId.slice(-4)}`);
  },

  /**
   * Get cached conversations with user validation
   */
  getCachedConversations: (userId: string): any[] | null => {
    // Try user-specific cache first
    let conversations = storage.get(CACHE_KEYS.USER_CONVERSATIONS(userId), null, userId);
    
    if (!conversations) {
      // Fallback to generic cache
      conversations = storage.get(CACHE_KEYS.CONVERSATIONS);
    }
    
    if (conversations && Array.isArray(conversations)) {
      console.log(`[CacheHelper] 📦 Retrieved ${conversations.length} conversations from cache`);
      return conversations;
    }
    
    return null;
  },

  /**
   * Cache messages for a specific channel
   */
  cacheMessages: (messages: any[], userId: string, channelId: string): void => {
    storage.set(CACHE_KEYS.USER_MESSAGES(userId, channelId), messages, CACHE_EXPIRY.MEDIUM, userId);
    console.log(`[CacheHelper] 💾 Cached ${messages.length} messages for channel ${channelId.slice(-4)}`);
  },

  /**
   * Get cached messages for a channel
   */
  getCachedMessages: (userId: string, channelId: string): any[] | null => {
    const messages = storage.get(CACHE_KEYS.USER_MESSAGES(userId, channelId), null, userId);
    
    if (messages && Array.isArray(messages)) {
      console.log(`[CacheHelper] 📦 Retrieved ${messages.length} messages from cache`);
      return messages;
    }
    
    return null;
  },

  /**
   * Clear all conversation-related caches after operations like delete
   */
  clearConversationCaches: (userId: string): void => {
    storage.invalidateConversations(userId);
  }
};

// Run cleanup on module load
if (typeof window !== 'undefined') {
  storage.cleanup();
  
  // Set up periodic cleanup (every 10 minutes)
  setInterval(() => {
    storage.cleanup();
  }, 10 * 60 * 1000);
}