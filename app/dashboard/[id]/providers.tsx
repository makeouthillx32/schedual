import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DashboardThemeToggleTest() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // TweakCN-style click handler - EXACT same approach as their code
  const handleThemeToggle = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX: x, clientY: y } = event;
    
    console.log(`🎯 Click coordinates: (${x}, ${y})`);
    
    // Call the global smoothToggleTheme function with coordinates
    if ((window as any).smoothToggleTheme) {
      await (window as any).smoothToggleTheme({ x, y });
    } else {
      console.error('smoothToggleTheme not available');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleThemeToggle}
        className="
          w-12 h-12 
          rounded-full 
          bg-background 
          border border-border 
          shadow-lg 
          flex items-center justify-center 
          hover:scale-110 
          transition-transform 
          duration-200
        "
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-foreground" />
        )}
      </button>
      
      {/* Debug info */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Current: {resolvedTheme}
      </div>
    </div>
  );
}