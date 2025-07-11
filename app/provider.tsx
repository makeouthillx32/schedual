// app/provider.tsx (Original structure restored)
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Session, User } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider, useSessionContext } from "@supabase/auth-helpers-react";
import { setCookie, getCookie } from "@/lib/cookieUtils";
import { usePathname, useRouter } from "next/navigation";
import { Theme } from "@/types/theme"; 
import { defaultThemeId, getThemeById, getAvailableThemeIds } from "@/themes";
import { dynamicFontManager } from "@/lib/dynamicFontManager";
import { transitionTheme, smoothThemeToggle } from "@/utils/themeTransitions";

interface EnhancedThemeContextType {
  themeType: "light" | "dark";
  toggleTheme: (element?: HTMLElement) => Promise<void>;
  themeId: string;
  setThemeId: (id: string, element?: HTMLElement) => Promise<void>;
  getTheme: (id?: string) => Theme;
  getAvailableThemes: () => { id: string; name: string }[];
  previewTheme: (id: string, element?: HTMLElement) => Promise<void>;
  confirmPreview: () => Promise<void>;
  cancelPreview: () => Promise<void>;
  isPreviewMode: boolean;
  isTransitioning: boolean;
}

interface AppContextType {
  user: User | null;
  session: Session | null;
  supabase: any;
  isAuthLoading: boolean;
  signOut: () => Promise<void>;
  theme: EnhancedThemeContextType;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | undefined>(undefined);
const AppContext = createContext<AppContextType | undefined>(undefined);

// Enhanced Theme Provider
function EnhancedThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeType] = useState<"light" | "dark">("light");
  const [themeId, setThemeIdState] = useState<string>(defaultThemeId);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const [originalThemeId, setOriginalThemeId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedThemeType = getCookie("theme-type") || "light";
      const savedThemeId = getCookie("theme-id") || defaultThemeId;
      
      setThemeType(savedThemeType as "light" | "dark");
      setThemeIdState(savedThemeId);
      
      // Apply theme immediately
      document.documentElement.classList.toggle("dark", savedThemeType === "dark");
      applyTheme(savedThemeId);
    }
  }, []);

  const applyTheme = (id: string) => {
    const theme = getThemeById(id);
    if (!theme) return;

    const root = document.documentElement;
    
    // Apply CSS variables
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Load custom fonts if needed
    if (theme.fontFamily && theme.fontFamily !== "system") {
      dynamicFontManager.loadFont(theme.fontFamily);
    }
  };

  const toggleTheme = async (element?: HTMLElement) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const newThemeType = themeType === "light" ? "dark" : "light";
    
    try {
      if (element) {
        await smoothThemeToggle(element);
      }
      
      setThemeType(newThemeType);
      setCookie("theme-type", newThemeType, { path: "/", maxAge: 31536000 });
      document.documentElement.classList.toggle("dark", newThemeType === "dark");
      
    } finally {
      setIsTransitioning(false);
    }
  };

  const setThemeId = async (id: string, element?: HTMLElement) => {
    if (isTransitioning || !getAvailableThemeIds().includes(id)) return;
    
    setIsTransitioning(true);
    
    try {
      if (element) {
        await transitionTheme(element, async () => {
          applyTheme(id);
        });
      } else {
        applyTheme(id);
      }
      
      setThemeIdState(id);
      setCookie("theme-id", id, { path: "/", maxAge: 31536000 });
      
    } finally {
      setIsTransitioning(false);
    }
  };

  const previewTheme = async (id: string, element?: HTMLElement) => {
    if (isTransitioning || isPreviewMode) return;
    
    setIsPreviewMode(true);
    setOriginalThemeId(themeId);
    setPreviewThemeId(id);
    
    if (element) {
      await transitionTheme(element, async () => {
        applyTheme(id);
      });
    } else {
      applyTheme(id);
    }
  };

  const confirmPreview = async () => {
    if (!previewThemeId) return;
    
    setThemeIdState(previewThemeId);
    setCookie("theme-id", previewThemeId, { path: "/", maxAge: 31536000 });
    setIsPreviewMode(false);
    setPreviewThemeId(null);
    setOriginalThemeId(null);
  };

  const cancelPreview = async () => {
    if (!originalThemeId) return;
    
    applyTheme(originalThemeId);
    setIsPreviewMode(false);
    setPreviewThemeId(null);
    setOriginalThemeId(null);
  };

  const getTheme = (id?: string) => {
    const targetId = id || (isPreviewMode ? previewThemeId : themeId) || defaultThemeId;
    return getThemeById(targetId);
  };

  const getAvailableThemes = () => {
    return getAvailableThemeIds().map(id => ({
      id,
      name: getThemeById(id).name
    }));
  };

  const contextValue: EnhancedThemeContextType = {
    themeType,
    toggleTheme,
    themeId: isPreviewMode ? previewThemeId || themeId : themeId,
    setThemeId,
    getTheme,
    getAvailableThemes,
    previewTheme,
    confirmPreview,
    cancelPreview,
    isPreviewMode,
    isTransitioning
  };

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      {children}
    </EnhancedThemeContext.Provider>
  );
}

// Auth Provider
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionContextProvider>
  );
}

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSessionContext();
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  const signOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    await supabase.auth.signOut();
    setUser(null);
    router.push('/sign-in');
  };

  const contextValue: AppContextType = {
    user,
    session,
    supabase: createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
    isAuthLoading: isLoading,
    signOut,
    theme: useEnhancedTheme(),
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Main Providers component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EnhancedThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </EnhancedThemeProvider>
  );
}

// Hooks
export function useEnhancedTheme() {
  const context = useContext(EnhancedThemeContext);
  if (context === undefined) {
    throw new Error("useEnhancedTheme must be used within an EnhancedThemeProvider");
  }
  return context;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}