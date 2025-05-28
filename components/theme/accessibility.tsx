'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useTheme } from '@/app/provider';
import ThemePresetCard from '@/components/theme/_components/ThemePresetCard';
import ThemeToggle from '@/components/theme/_components/ThemeToggle';
import ThemeColorMode from '@/components/theme/_components/ThemeColorMode';

// Import Sass styles
import '@/components/theme/_components/theme.scss';

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
    return <ThemeToggle onClick={toggleOverlay} />;
  }

  return (
    <div 
      ref={overlayRef}
      onClick={handleOutsideClick}
      className="theme-selector"
    >
      <div className="theme-selector__container border border-[hsl(var(--border))] shadow-[var(--shadow-6)] bg-[hsl(var(--card))] rounded-lg">
        {/* Header */}
        <div className="theme-selector__header border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.3] rounded-t-lg">
          <h2 className="theme-selector__title">Accessibility & Theme</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="theme-selector__close border border-[hsl(var(--border))] shadow-[var(--shadow-2)] hover:shadow-[var(--shadow-3)] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all duration-200 rounded-md"
            aria-label="Close overlay"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Controls */}
        <div className="theme-selector__controls border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.2] p-4">
          <div className="border border-[hsl(var(--border))] rounded-lg p-3 bg-[hsl(var(--card))] shadow-[var(--shadow-1)]">
            <ThemeColorMode 
              mode={themeType as 'light' | 'dark'} 
              onToggle={toggleTheme} 
            />
          </div>
          
          <button
            onClick={resetSettings}
            className="theme-selector__control-button border border-[hsl(var(--border))] shadow-[var(--shadow-2)] hover:shadow-[var(--shadow-3)] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition-all duration-200 rounded-md mt-3 px-4 py-2 flex items-center gap-2"
            aria-label="Reset all settings"
          >
            <RefreshCw size={18} />
            <span>Reset All</span>
          </button>
        </div>
        
        {/* Content Area */}
        <div className="theme-selector__content p-4">
          {/* Theme Presets Section */}
          <section className="theme-selector__section border border-[hsl(var(--border))] rounded-lg p-4 bg-[hsl(var(--card))] shadow-[var(--shadow-1)]">
            <h3 className="theme-selector__section-title border-b border-[hsl(var(--border))] pb-3 mb-4 text-lg font-semibold">
              Theme Presets
            </h3>
            
            <div className="space-y-3">
              {themePresets.map(preset => (
                <div key={preset.id} className="border border-[hsl(var(--border))] rounded-md shadow-[var(--shadow-1)] overflow-hidden">
                  <ThemePresetCard
                    id={preset.id}
                    name={preset.name}
                    description={preset.description}
                    previewColor={preset.previewColor}
                    isActive={themeId === preset.id}
                    onApply={setThemeId}
                  />
                </div>
              ))}
              
              {/* Placeholder for more themes */}
              <div className="mt-6 p-4 bg-[hsl(var(--muted))/0.5] border border-[hsl(var(--border))] rounded-lg shadow-[var(--shadow-1)]">
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  More theme presets coming soon. Check back for updates!
                </p>
              </div>
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="theme-selector__footer border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))/0.3] rounded-b-lg p-4">
          <div className="text-center">
            <span className="text-[hsl(var(--muted-foreground))]"> Better accessibility By </span>
            <strong className="theme-selector__brand text-[hsl(var(--primary))] font-bold">unenter</strong>
          </div>
          <p className="theme-selector__keyboard-hint text-center text-sm text-[hsl(var(--muted-foreground))] mt-2 border border-[hsl(var(--border))] bg-[hsl(var(--background))] rounded-md py-2 px-3 shadow-[var(--shadow-1)]">
            Press ESC to close this panel😄
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityOverlay;