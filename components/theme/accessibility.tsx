'use client';

import React, { useState, useEffect } from 'react';
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

  if (!isOpen) {
    return (
      <button 
        onClick={toggleOverlay}
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-[hsl(var(--sidebar-primary))] text-white flex items-center justify-center shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-primary-foreground))]"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground))/0.5]">
      <div className="relative w-full max-w-md mx-4 rounded-[var(--radius)] overflow-hidden">
        {/* Keyboard shortcut reminder */}
        <div className="absolute top-2 right-2 z-10 bg-[hsl(var(--background))] text-[hsl(var(--muted-foreground))] text-xs py-1 px-2 rounded-md opacity-70">
          Press ESC to close
        </div>
        
        {/* Main Blue Section */}
        <div className="bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] p-6 pb-12">
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={toggleOverlay}
              className="p-1 text-[hsl(var(--sidebar-primary-foreground))] hover:bg-[hsl(var(--sidebar-primary))/0.8] rounded-full"
            >
              <X size={24} />
            </button>
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className="flex items-center mr-4 p-1 hover:bg-[hsl(var(--sidebar-primary))/0.8] rounded-full"
                aria-label={themeType === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {themeType === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <Globe size={20} className="mr-2" />
              <span className="font-medium">ENGLISH</span>
              <ChevronDown size={20} className="ml-1" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6">Accessibility & Theme Settings</h2>
          
          <div className="space-y-3">
            <button 
              onClick={resetSettings}
              className="w-full py-3 px-4 bg-[hsl(var(--sidebar-primary-foreground))] text-[hsl(var(--sidebar-primary))] rounded-full flex items-center justify-center font-medium transition-colors shadow-[var(--shadow-sm)]"
            >
              <RefreshCw size={18} className="mr-2" />
              Reset Settings
            </button>
            
            <button className="w-full py-3 px-4 bg-[hsl(var(--sidebar-primary-foreground))] text-[hsl(var(--sidebar-primary))] rounded-full flex items-center justify-center font-medium transition-colors shadow-[var(--shadow-sm)]">
              <FileText size={18} className="mr-2" />
              Statement
            </button>
            
            <button 
              onClick={toggleOverlay}
              className="w-full py-3 px-4 bg-[hsl(var(--sidebar-primary-foreground))] text-[hsl(var(--sidebar-primary))] rounded-full flex items-center justify-center font-medium transition-colors shadow-[var(--shadow-sm)]"
            >
              <EyeOff size={18} className="mr-2" />
              Hide Interface
            </button>
          </div>
          
          <div className="mt-4 relative">
            <div className="flex items-center px-4 py-3 bg-[hsl(var(--sidebar-primary))/0.8] rounded-full border border-[hsl(var(--sidebar-primary-foreground))/0.3]">
              <Search size={18} className="mr-2 text-[hsl(var(--sidebar-primary-foreground))]" />
              <span className="text-[hsl(var(--sidebar-primary-foreground))/0.9]">Need help? Search features...</span>
              <ChevronDown size={18} className="ml-auto text-[hsl(var(--sidebar-primary-foreground))]" />
            </div>
          </div>
        </div>
        
        {/* White Section with unified content */}
        <div className="absolute bottom-0 left-0 right-0 rounded-t-[var(--radius)] bg-[hsl(var(--background))] shadow-[var(--shadow-lg)] max-h-[70vh] overflow-y-auto">
          <div className="p-6">
            {/* Theme Presets Section */}
            <section className="mb-8">
              <h3 className="text-xl font-semibold mb-6 text-[hsl(var(--foreground))]">
                Theme Presets
              </h3>
              
              <div className="space-y-6">
                {themePresets.map(preset => (
                  <div key={preset.id} className="flex items-center border-b border-[hsl(var(--border))] pb-4">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                      <div 
                        className={`w-10 h-10 rounded-full border-2 ${
                          themeId === preset.id 
                            ? 'border-[hsl(var(--sidebar-primary))]' 
                            : 'border-[hsl(var(--border))]'
                        }`}
                        style={{ backgroundColor: preset.previewColor }}
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h4 className="font-medium text-[hsl(var(--foreground))]">{preset.name} Preset</h4>
                      <p className="text-[hsl(var(--muted-foreground))] text-sm">{preset.description}</p>
                    </div>
                    <div className="ml-auto">
                      <button
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
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
            </section>
            
            {/* Accessibility Presets Section */}
            <section>
              <h3 className="text-xl font-semibold mb-6 text-[hsl(var(--foreground))]">
                Accessibility Presets
              </h3>
              
              <div className="space-y-6">
                {accessibilityPresets.map(preset => (
                  <div key={preset.id} className="flex items-center border-b border-[hsl(var(--border))] pb-4">
                    <div className="flex-shrink-0 w-20">
                      <div className={`relative inline-flex h-8 items-center rounded-full border-2 transition-colors ${preset.enabled ? 'bg-[hsl(var(--sidebar-primary))] border-[hsl(var(--sidebar-primary))]' : 'bg-[hsl(var(--muted))] border-[hsl(var(--border))]'}`}>
                        <button
                          type="button"
                          className={`border-2 duration-100 absolute ${preset.enabled ? 'bg-white border-[hsl(var(--sidebar-primary))] translate-x-10' : 'bg-white border-[hsl(var(--border))] translate-x-0'} h-7 w-10 rounded-full transition-transform`}
                          onClick={() => togglePreset(preset.id)}
                        />
                        <span className={`absolute ${preset.enabled ? 'left-2 opacity-0' : 'left-2 opacity-100'} text-xs font-medium transition-opacity`}>
                          OFF
                        </span>
                        <span className={`absolute ${preset.enabled ? 'right-2 opacity-100' : 'right-2 opacity-0'} text-xs font-medium transition-opacity`}>
                          ON
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-[hsl(var(--foreground))]">{preset.name}</h4>
                      <p className="text-[hsl(var(--muted-foreground))] text-sm">{preset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="p-4 bg-[hsl(var(--sidebar-primary))] text-center text-[hsl(var(--sidebar-primary-foreground))]">
            <div className="flex items-center justify-center">
              <span className="mr-2">Theme System By</span>
              <strong className="font-bold">Your Brand Name</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityOverlay;