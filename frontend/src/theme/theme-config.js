// src/theme/theme-config.js
// Central configuration for easy customization and runtime application

export const themeConfig = {
  // Quick toggles
  compactMode: false,        // Makes everything smaller
  roundedCorners: 'medium',  // 'none' | 'small' | 'medium' | 'large' | 'extra-large'

  // Typography
  baseFontSize: '16px',      // Base font size for the app (1rem)
  headingFontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  bodyFontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  monoFontFamily: "'Fira Code', 'Courier New', monospace",

  // Spacing
  baseSpacing: '16px',       // 1rem equivalent
  spacingScale: 8,           // 8px grid system

  // Components
  cardPadding: 'medium',     // 'small' | 'medium' | 'large'
  cardBorderRadius: 'large', // 'small' | 'medium' | 'large'
  buttonSize: 'medium',      // 'small' | 'medium' | 'large'

  // Borders
  borderWidth: 'thin',       // 'thin' | 'medium' | 'thick'

  // Animations
  animationSpeed: 'normal',  // 'fast' | 'normal' | 'slow'
};

function mapRadius(size) {
  switch (size) {
    case 'none': return '0';
    case 'small': return 'var(--radius-sm)';
    case 'medium': return 'var(--radius-md)';
    case 'large': return 'var(--radius-lg)';
    case 'extra-large': return 'var(--radius-2xl)';
    default: return 'var(--radius-md)';
  }
}

function mapBorderWidth(size) {
  switch (size) {
    case 'thin': return 'var(--border-width-thin)';
    case 'medium': return 'var(--border-width-medium)';
    case 'thick': return 'var(--border-width-thick)';
    default: return 'var(--border-width-thin)';
  }
}

function mapCardPadding(size) {
  switch (size) {
    case 'small': return 'var(--card-padding-sm)';
    case 'medium': return 'var(--card-padding)';
    case 'large': return 'var(--card-padding-lg)';
    default: return 'var(--card-padding)';
  }
}

function mapAnimationSpeed(speed) {
  switch (speed) {
    case 'fast': return 'var(--transition-fast)';
    case 'normal': return 'var(--transition-base)';
    case 'slow': return 'var(--transition-slow)';
    case 'slower': return 'var(--transition-slower)';
    default: return 'var(--transition-base)';
  }
}

export function applyThemeConfig(cfg = themeConfig) {
  const root = document.documentElement;

  // Typography
  if (cfg.baseFontSize) root.style.setProperty('--font-size-base', cfg.baseFontSize);
  if (cfg.headingFontFamily) root.style.setProperty('--font-family-heading', cfg.headingFontFamily);
  if (cfg.bodyFontFamily) root.style.setProperty('--font-family-primary', cfg.bodyFontFamily);
  if (cfg.monoFontFamily) root.style.setProperty('--font-family-mono', cfg.monoFontFamily || "'Fira Code', monospace");

  // Radius
  root.style.setProperty('--card-radius', mapRadius(cfg.cardBorderRadius));

  // Border width
  root.style.setProperty('--card-border-width', mapBorderWidth(cfg.borderWidth));

  // Card padding
  root.style.setProperty('--card-padding', mapCardPadding(cfg.cardPadding));

  // Animation speed
  const transition = mapAnimationSpeed(cfg.animationSpeed);
  root.style.setProperty('--transition-base', transition);

  // Compact mode adjustments (smaller spacing & font scale)
  if (cfg.compactMode) {
    root.style.setProperty('--spacing-4', '0.75rem');
    root.style.setProperty('--spacing-5', '1rem');
    root.style.setProperty('--font-size-base', '0.9375rem');
  }

  // Rounded corners quick toggle
  if (cfg.roundedCorners) {
    const rad = mapRadius(cfg.roundedCorners === 'small' ? 'small' : cfg.roundedCorners === 'extra-large' ? 'extra-large' : 'medium');
    root.style.setProperty('--radius-md', rad);
  }
}

export default { themeConfig, applyThemeConfig };