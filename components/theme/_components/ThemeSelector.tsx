// components/theme/_components/ThemeSelector.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useTheme } from '@/app/provider';
import AccessibilityIcon from '@/assets/logos/asesablity.svg';  // ← your new SVG
import ThemePresetCard from './ThemePresetCard';
import AccessibilityToggle from './AccessibilityToggle';
import ThemeColorMode from './ThemeColorMode';
import './theme.scss';

interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

/**
 * ThemeSelector - Main component for theme and accessibility settings
 */
const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { themeType, toggleTheme, themeId, setThemeId, availableThemes, getTheme } = useTheme();
  
  const [accessibilityPresets, setAccessibilityPresets] = useState<AccessibilityPreset[]>([
    { id: 'seizure', name: 'Seizure Safe Preset', description: 'Clear flashes & reduces color', enabled: false },
    { id: 'vision',  name: 'Vision Impaired Preset', description: 'Enhances website\'s visuals', enabled: false },
    { id: 'adhd',    name: 'ADHD Friendly Preset', description: 'More focus & fewer distractions', enabled: false }
  ]);
  
  const [themePresets, setThemePresets] = useState<any[]>([]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);
  
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);
  
  useEffect(() => {
    const loaded = availableThemes.map(id => {
      const theme = getTheme();
      return {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        description: theme.description || `${id} theme preset`,
        previewColor: theme.previewColor
      };
    });
    setThemePresets(loaded);
  }, [availableThemes, getTheme]);

  const resetSettings = () => {
    setThemeId('default');
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      if (themeType !== 'dark') toggleTheme();
    } else {
      if (themeType !== 'light') toggleTheme();
    }
    setAccessibilityPresets(accessibilityPresets.map(p => ({ ...p, enabled: false })));
  };

  const togglePreset = (id: string) => {
    setAccessibilityPresets(accessibilityPresets.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const toggleOverlay = () => setIsOpen(o => !o);

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (overlayRef.current && e.target === overlayRef.current) setIsOpen(false);
  };

  // ← TRIGGER BUTTON WHEN CLOSED
  if (!isOpen) {
    return (
      <button
        type="button"
        className="theme-selector__trigger"
        onClick={toggleOverlay}
        aria-label="Open accessibility & theme panel"
      >
        <AccessibilityIcon className="theme-selector__trigger-icon" />
      </button>
    );
  }

  return (
    <div 
      ref={overlayRef}
      onClick={handleOutsideClick}
      className="theme-selector"
    >
      <div className="theme-selector__container">
        {/* Header */}
        <div className="theme-selector__header">
          <h2 className="theme-selector__title">Accessibility & Theme</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="theme-selector__close"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Controls */}
        <div className="theme-selector__controls">
          <ThemeColorMode 
            mode={themeType as 'light' | 'dark'} 
            onToggle={toggleTheme} 
          />
          <button
            onClick={resetSettings}
            className="theme-selector__control-button"
            aria-label="Reset all settings"
          >
            <RefreshCw size={18} />
            <span>Reset All</span>
          </button>
        </div>
        
        {/* Content Area */}
        <div className="theme-selector__content">
          {/* Theme Presets Section */}
          <section className="theme-selector__section">
            <h3 className="theme-selector__section-title">Theme Presets</h3>
            <div>
              {themePresets.map(preset => (
                <ThemePresetCard
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  description={preset.description}
                  previewColor={preset.previewColor}
                  isActive={themeId === preset.id}
                  onApply={setThemeId}
                />
              ))}
              <div className="theme-presets-placeholder">
                <p className="theme-presets-placeholder__text">
                  More theme presets coming soon. Check back for updates!
                </p>
              </div>
            </div>
          </section>
          
          {/* Accessibility Presets Section */}
          <section className="theme-selector__section">
            <h3 className="theme-selector__section-title">Accessibility Presets</h3>
            <div>
              {accessibilityPresets.map(preset => (
                <AccessibilityToggle
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  description={preset.description}
                  enabled={preset.enabled}
                  onToggle={togglePreset}
                />
              ))}
            </div>
          </section>
        </div>
        
        {/* Footer */}
        <div className="theme-selector__footer">
          <span>Theme System By </span>
          <strong className="theme-selector__brand">Your Brand Name</strong>
          <p className="theme-selector__keyboard-hint">Press ESC to close this panel</p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSelector;