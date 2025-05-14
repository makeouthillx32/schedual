// lib/cookieUtils.ts

/**
 * Enhanced cookie utilities for managing browser cookies with better security and reliability
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

/**
 * Set a cookie with enhanced options
 */
export const setCookie = (name: string, value: string, options?: CookieOptions): void => {
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
  if (options?.secure || window.location.protocol === 'https:') {
    cookieString += '; secure';
  }
  
  if (options?.httpOnly) {
    cookieString += '; httpOnly';
  }
  
  // Add SameSite (default: lax)
  cookieString += `; samesite=${options?.sameSite || DEFAULT_SAME_SITE}`;
  
  // Set the cookie
  document.cookie = cookieString;
  console.log(`[Cookie] Set: ${name}`);
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
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
 * Enhanced local storage with expiration support
 */
export const storage = {
  /**
   * Set an item in local storage with optional expiration
   */
  set: <T>(key: string, value: T, expiryInSeconds?: number): void => {
    try {
      const item = {
        value,
        expiry: expiryInSeconds ? Date.now() + expiryInSeconds * 1000 : null
      };
      localStorage.setItem(key, JSON.stringify(item));
      console.log(`[Storage] Set: ${key}`);
    } catch (e) {
      console.error(`[Storage] Error setting ${key}:`, e);
    }
  },
  
  /**
   * Get an item from local storage (checks expiration)
   */
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return defaultValue || null;
      
      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key); // Remove expired item
        console.log(`[Storage] Expired: ${key}`);
        return defaultValue || null;
      }
      
      return item.value;
    } catch (e) {
      console.error(`[Storage] Error getting ${key}:`, e);
      return defaultValue || null;
    }
  },
  
  /**
   * Remove an item from local storage
   */
  remove: (key: string): void => {
    localStorage.removeItem(key);
    console.log(`[Storage] Removed: ${key}`);
  },
  
  /**
   * Check if an item exists and is not expired
   */
  has: (key: string): boolean => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return false;
      
      const item = JSON.parse(itemStr);
      return !item.expiry || Date.now() <= item.expiry;
    } catch {
      return false;
    }
  }
};

// Cache constants
export const CACHE_KEYS = {
  CURRENT_USER: 'currentUser',
  SELECTED_CHAT: 'selectedChat',
  CONVERSATIONS: 'conversations',
  MESSAGES_PREFIX: 'messages_'
};

export const CACHE_EXPIRY = {
  SHORT: 60, // 1 minute
  MEDIUM: 5 * 60, // 5 minutes
  LONG: 60 * 60, // 1 hour
  DAY: 24 * 60 * 60 // 1 day
};