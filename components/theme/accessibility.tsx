'use client';

import React, { useState, useEffect, useRef } from 'react';
// Import Lucide React components
import { X, RefreshCw, FileText, EyeOff, Search, ChevronDown, Globe, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/provider';

interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  previewColor: string;
}

const AccessibilityOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { themeType, toggleTheme, themeId, setThemeId, availableThemes, getTheme } = useTheme();
  
  const [accessibilityPresets, setAccessibilityPresets] = useState<AccessibilityPreset[]>([
    {
      id: 'seizure',
      name: 'Seizure Safe Preset',
      description: 'Clear flashes & reduces color',
      enabled: false
    },
    {
      id: 'vision',
      name: 'Vision Impaired Preset',
      description: 'Enhances website\'s visuals',
      enabled: false
    },
    {
      id: 'adhd',
      name: 'ADHD Friendly Preset',
      description: 'More focus & fewer distractions',
      enabled: false
    }
  ]);
  
  // Generate theme presets from available themes
  const [themePresets, setThemePresets] = useState<ThemePreset[]>([]);
  
  // Effect for ESC key to close overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  useEffect(() => {
    // Load theme presets when component mounts
    const loadedThemes: ThemePreset[] = availableThemes.map(id => {
      const theme = getTheme();
      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
        description: theme.description || `${id} theme preset`,
        previewColor: theme.previewColor
      };
    });
    setThemePresets(loadedThemes);
  }, [availableThemes, getTheme]);

  const resetSettings = () => {
    // Reset theme to default preset
    setThemeId('default');
    
    // Reset dark/light mode based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      if (themeType !== 'dark') toggleTheme();
    } else {
      if (themeType !== 'light') toggleTheme();
    }
    
    // Reset accessibility presets
    setAccessibilityPresets(accessibilityPresets.map(preset => ({ ...preset, enabled: false })));
  };

  const togglePreset = (id: string) => {
    setAccessibilityPresets(accessibilityPresets.map(preset => 
      preset.id === id ? { ...preset, enabled: !preset.enabled } : preset
    ));
  };

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
  };

  // Click outside to close
  const handleOutsideClick = (e: React.MouseEvent) => {
    if (overlayRef.current && e.target === overlayRef.current) {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleOverlay}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-primary-foreground))]"
        aria-label="Open accessibility menu"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
          <path d="M12 7V9"></path>
          <path d="M12 15v2"></path>
          <path d="M9 12H7"></path>
          <path d="M17 12h-2"></path>
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
        </svg>
      </button>
    );
  }

  return (
    <div 
      ref={overlayRef}
      onClick={handleOutsideClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground))/0.5] p-4 overflow-auto"
    >
      <div className="relative max-w-md w-full rounded-[var(--radius)] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with close button - fixed */}
        <div className="bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Accessibility & Theme</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-[hsl(var(--sidebar-primary-foreground))/0.2] rounded-full"
            aria-label="Close overlay"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Controls section - fixed */}
        <div className="bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] px-4 pb-4 flex space-x-3">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-[hsl(var(--sidebar-primary-foreground))/0.2] rounded-md flex-1"
          >
            {themeType === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>{themeType === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={resetSettings}
            className="flex items-center justify-center gap-2 py-2 px-3 bg-[hsl(var(--sidebar-primary-foreground))/0.2] rounded-md flex-1"
          >
            <RefreshCw size={18} />
            <span>Reset All</span>
          </button>
        </div>
        
        {/* Scrollable content area */}
        <div className="bg-[hsl(var(--background))] overflow-y-auto flex-1">
          <div className="p-5">
            {/* Theme Presets Section */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold mb-5 text-[hsl(var(--foreground))]">
                Theme Presets
              </h3>
              
              <div className="space-y-5">
                {themePresets.map(preset => (
                  <div key={preset.id} className="flex items-center border-b border-[hsl(var(--border))] pb-4">
                    <div className="flex-shrink-0 mr-4">
                      <div 
                        className={`w-10 h-10 rounded-full border-2 ${
                          themeId === preset.id 
                            ? 'border-[hsl(var(--sidebar-primary))]' 
                            : 'border-[hsl(var(--border))]'
                        }`}
                        style={{ backgroundColor: preset.previewColor }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium text-[hsl(var(--foreground))]">{preset.name} Preset</h4>
                      <p className="text-[hsl(var(--muted-foreground))] text-sm">{preset.description}</p>
                    </div>
                    <div className="ml-auto pl-2">
                      <button
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          themeId === preset.id
                            ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]'
                            : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]'
                        }`}
                        onClick={() => setThemeId(preset.id)}
                        disabled={themeId === preset.id}
                      >
                        {themeId === preset.id ? 'Active' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Placeholder for more themes */}
              <div className="mt-6 p-4 bg-[hsl(var(--muted))/0.5] rounded-lg">
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  More theme presets coming soon. Check back for updates!
                </p>
              </div>
            </section>
            
            {/* Accessibility Presets Section */}
            <section>
              <h3 className="text-lg font-semibold mb-5 text-[hsl(var(--foreground))]">
                Accessibility Presets
              </h3>
              
              <div className="space-y-5">
                {accessibilityPresets.map(preset => (
                  <div key={preset.id} className="flex items-center border-b border-[hsl(var(--border))] pb-4">
                    <div className="flex-shrink-0 w-14">
                      <div className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-colors ${preset.enabled ? 'bg-[hsl(var(--sidebar-primary))] border-[hsl(var(--sidebar-primary))]' : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))]'}`}>
                        <button
                          type="button"
                          className={`absolute inset-0.5 aspect-square rounded-full bg-white transition ${
                            preset.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                          onClick={() => togglePreset(preset.id)}
                        />
                      </div>
                    </div>
                    <div className="ml-2">
                      <h4 className="font-medium text-[hsl(var(--foreground))]">{preset.name}</h4>
                      <p className="text-[hsl(var(--muted-foreground))] text-sm">{preset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="p-4 bg-[hsl(var(--sidebar-primary))] text-center text-sm text-[hsl(var(--sidebar-primary-foreground))]">
            <span className="mr-1">Theme System By</span>
            <strong className="font-bold">Your Brand Name</strong>
            <p className="text-xs mt-1 opacity-80">Press ESC to close this panel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityOverlay;