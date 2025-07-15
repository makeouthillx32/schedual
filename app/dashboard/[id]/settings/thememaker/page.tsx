// app/dashboard/[id]/settings/thememaker/page.tsx

'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Upload, 
  Download, 
  Save, 
  ChevronDown, 
  Menu,
  X,
  Eye,
  Settings,
  Type,
  Paintbrush
} from 'lucide-react';

const ThemeCreatorSkeleton = () => {
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts'>('colors');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['primary-colors'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const colorGroups = [
    { id: 'primary-colors', title: 'Primary Colors', count: 2 },
    { id: 'secondary-colors', title: 'Secondary Colors', count: 2 },
    { id: 'accent-colors', title: 'Accent Colors', count: 2 },
    { id: 'background-colors', title: 'Background Colors', count: 4 },
    { id: 'border-colors', title: 'Border Colors', count: 3 },
    { id: 'chart-colors', title: 'Chart Colors', count: 5 },
    { id: 'sidebar-colors', title: 'Sidebar Colors', count: 8 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-accent rounded-lg"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-semibold">Theme Creator</h1>
            </div>
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-accent rounded-lg lg:hidden"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-screen lg:h-[calc(100vh-0px)]">
        {/* Sidebar - Mobile Menu Overlay / Desktop Sidebar */}
        <div className={`
          ${showMobileMenu ? 'fixed inset-0 z-40 bg-background' : 'hidden'} 
          lg:relative lg:flex lg:w-80 lg:border-r lg:border-border lg:bg-card
          flex flex-col overflow-hidden
        `}>
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Header Section - Desktop Only */}
            <div className="hidden lg:block p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold">Theme Creator</h1>
              </div>
              
              {/* Import/Export Controls */}
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-2 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center gap-2 text-sm">
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button className="flex-1 py-2 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="flex-1 py-2 px-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center justify-center gap-2 text-sm">
                  <Palette className="w-4 h-4" />
                  Load
                </button>
              </div>
            </div>

            {/* Theme Form */}
            <div className="p-4 border-b border-border">
              <div className="space-y-3">
                <div className="h-10 bg-muted rounded-md animate-pulse"></div>
                <div className="h-10 bg-muted rounded-md animate-pulse"></div>
                
                {/* Preview Color */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Preview Color</div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-primary rounded border border-border"></div>
                    <div className="flex-1 h-8 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex rounded-lg bg-muted p-1">
                  <button className="flex-1 py-1 px-3 text-sm rounded-md bg-background shadow-sm">
                    Light
                  </button>
                  <button className="flex-1 py-1 px-3 text-sm rounded-md text-muted-foreground">
                    Dark
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab('colors')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'colors' 
                    ? 'bg-background text-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Paintbrush className="w-4 h-4" />
                Colors
              </button>
              <button
                onClick={() => setActiveTab('fonts')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'fonts' 
                    ? 'bg-background text-foreground border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Type className="w-4 h-4" />
                Fonts & Style
              </button>
            </div>

            {/* Content Area */}
            <div className="p-4 space-y-4">
              {activeTab === 'colors' ? (
                // Colors Tab Content
                <div className="space-y-3">
                  {colorGroups.map((group) => (
                    <div key={group.id} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(group.id)}
                        className="w-full px-4 py-3 bg-muted/50 flex items-center justify-between hover:bg-muted/70 transition-colors"
                      >
                        <span className="font-medium text-sm">{group.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{group.count}</span>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform ${
                              expandedSections.has(group.id) ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>
                      </button>
                      
                      {expandedSections.has(group.id) && (
                        <div className="p-4 space-y-3 bg-card">
                          {/* Skeleton Color Inputs */}
                          {Array.from({ length: group.count }).map((_, index) => (
                            <div key={index} className="space-y-1">
                              <div className="h-3 w-20 bg-muted rounded animate-pulse"></div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary rounded border border-border"></div>
                                <div className="flex-1 h-8 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Fonts & Style Tab Content
                <div className="space-y-6">
                  {/* Font Families */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold">Font Families</h3>
                    </div>
                    <div className="space-y-3">
                      {['Sans-serif', 'Serif', 'Monospace'].map((font) => (
                        <div key={font} className="space-y-2">
                          <div className="text-xs font-medium text-muted-foreground">{font}</div>
                          <div className="h-10 bg-muted rounded animate-pulse"></div>
                          <div className="h-8 bg-muted/50 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Border Radius */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold">Border Radius</h3>
                    </div>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 bg-primary rounded border border-border"></div>
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Typography</h3>
                    <div className="h-10 bg-muted rounded animate-pulse"></div>
                    <div className="h-12 bg-muted/50 rounded animate-pulse"></div>
                  </div>

                  {/* Shadows */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Shadows</h3>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex gap-2">
                          <div className="flex-1 h-8 bg-muted rounded animate-pulse"></div>
                          <div className="w-8 h-8 bg-card border border-border rounded shadow-sm"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-border">
            <button className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center gap-2 font-medium">
              <Save className="w-4 h-4" />
              Save Theme
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`
          ${showPreview ? 'block' : 'hidden'} lg:block
          flex-1 p-4 lg:p-8 overflow-auto
          ${showMobileMenu ? 'hidden' : ''}
        `}>
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Theme Preview</h2>
              <p className="text-muted-foreground text-sm lg:text-base">
                Preview your theme in real-time as you make changes
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Colors Preview Card */}
              <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">Colors Preview</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                  {['Primary', 'Secondary', 'Accent', 'Destructive'].map((color) => (
                    <div key={color} className="text-center">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary mx-auto mb-2 border border-border"></div>
                      <div className="text-xs text-muted-foreground">{color}</div>
                    </div>
                  ))}
                </div>
                
                {/* Chart Colors */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Chart Colors</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="text-center">
                        <div className="w-6 h-6 lg:w-8 lg:h-8 rounded mx-auto mb-1 bg-primary"></div>
                        <div className="text-xs text-muted-foreground">{num}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Typography Preview Card */}
              <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">Typography</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Sans-serif</div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Serif</div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Monospace</div>
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Components Preview Card */}
              <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">Components</h3>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {['Primary', 'Secondary', 'Outline'].map((variant) => (
                      <div key={variant} className="h-8 px-3 bg-primary rounded text-xs text-primary-foreground flex items-center">
                        {variant}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded animate-pulse"></div>
                    <div className="h-16 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Layout Preview Card */}
              <div className="p-4 lg:p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-semibold mb-4">Layout</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {['Default', 'Secondary', 'Outline'].map((badge) => (
                      <div key={badge} className="h-5 px-2 bg-secondary rounded text-xs flex items-center">
                        {badge}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Full Width Application Preview */}
            <div className="mt-6 lg:mt-8 p-4 lg:p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-4">Application Preview</h3>
              <div className="border border-border rounded-lg overflow-hidden">
                {/* Mock Header */}
                <div className="bg-card border-b border-border p-3 lg:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 lg:gap-4">
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded bg-primary"></div>
                      <div className="hidden lg:flex gap-4">
                        <div className="h-4 w-16 bg-foreground rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-muted-foreground rounded animate-pulse"></div>
                        <div className="h-4 w-10 bg-muted-foreground rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-secondary"></div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="p-3 lg:p-6 space-y-3 lg:space-y-4">
                  <div className="h-6 lg:h-8 w-32 lg:w-48 bg-foreground rounded animate-pulse"></div>
                  <div className="h-4 w-full lg:w-2/3 bg-muted-foreground rounded animate-pulse"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 mt-4 lg:mt-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 lg:p-4 bg-card border border-border rounded-lg">
                        <div className="h-6 lg:h-8 w-12 lg:w-16 bg-primary rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-20 lg:w-24 bg-muted-foreground rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons */}
      <div className="lg:hidden fixed bottom-4 right-4 flex flex-col gap-2">
        <button className="w-12 h-12 bg-secondary rounded-full shadow-lg flex items-center justify-center">
          <Upload className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 bg-secondary rounded-full shadow-lg flex items-center justify-center">
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ThemeCreatorSkeleton;