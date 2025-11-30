import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ThemeToggle() {
  const { theme, setTheme, isDark, palette, setPalette, cyclePalette } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const palettes = [
    { value: 'neon', label: '🎆 Neon', color: 'from-primary-500 to-primary-600' },
    { value: 'teal', label: '🌊 Teal', color: 'from-secondary-500 to-secondary-600' },
    { value: 'orange', label: '🔥 Orange', color: 'from-warning-500 to-warning-600' },
  ];

  const currentThemeIcon = themes.find(t => t.value === theme)?.icon || Sun;
  const CurrentIcon = currentThemeIcon;

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle (Light/Dark/System) */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="theme-toggle-button relative h-9 w-9 rounded-lg hover:bg-muted transition-all duration-200"
            aria-label="Toggle theme"
          >
            <CurrentIcon className="h-5 w-5 text-foreground transition-transform duration-200 hover:rotate-12" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 glass-effect dark:glass-effect-dark">
          {themes.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 cursor-pointer ${
                theme === value
                  ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]'
                  : 'hover:bg-muted'
              }`}
            >
              <Icon className="h-4 h-4" />
              <span>{label}</span>
              {theme === value && (
                <span className="ml-auto text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Palette Selector */}
      <DropdownMenu open={showPaletteMenu} onOpenChange={setShowPaletteMenu}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-muted transition-all duration-200"
            aria-label="Select palette"
            title={`Palette: ${palette}`}
          >
            🎨
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 glass-effect dark:glass-effect-dark">
          {palettes.map(({ value, label }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => {
                setPalette(value);
                setShowPaletteMenu(false);
              }}
              className={`flex items-center gap-2 cursor-pointer ${
                palette === value
                  ? 'bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)] text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]'
                  : 'hover:bg-muted'
              }`}
            >
              <span>{label}</span>
              {palette === value && (
                <span className="ml-auto text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cycle Palette Quick Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={cyclePalette}
        className="relative h-9 w-9 rounded-lg hover:bg-muted transition-all duration-200"
        aria-label="Cycle palette"
        title="Cycle through palettes"
      >
        🔄
      </Button>
    </div>
  );
}
