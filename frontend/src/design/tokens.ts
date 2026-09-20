/**
 * SIH 2026 PS26070 - Design Tokens
 * Operational Weather & GIS Inspired Color Palette & Typography
 */

export const COLOR_TOKENS = {
  // Base App Colors
  bgRoot: '#070a12',
  bgSurface: '#090d19',
  bgCard: '#0e1424',
  bgCardHover: '#131c33',
  border: '#1e293b',
  borderBright: '#334155',

  // Text Colors
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textHighlight: '#38bdf8',

  // Provenance & Observed Data
  observed: '#06b6d4',       // Cyan
  forecast: '#f59e0b',       // Amber
  official: '#a855f7',       // Purple / Official Warning
  uncertainty: 'rgba(245, 158, 11, 0.2)',

  // Semantic Status Tokens
  status: {
    good: {
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      text: '#34d399',
      icon: '#10b981',
    },
    degraded: {
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
      icon: '#f59e0b',
    },
    stale: {
      bg: 'rgba(234, 179, 8, 0.12)',
      border: 'rgba(234, 179, 8, 0.3)',
      text: '#fde047',
      icon: '#eab308',
    },
    unavailable: {
      bg: 'rgba(100, 116, 139, 0.12)',
      border: 'rgba(100, 116, 139, 0.3)',
      text: '#94a3b8',
      icon: '#64748b',
    },
    critical: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: '#f87171',
      icon: '#ef4444',
    },
    insufficient: {
      bg: 'rgba(168, 85, 247, 0.12)',
      border: 'rgba(168, 85, 247, 0.3)',
      text: '#c084fc',
      icon: '#a855f7',
    },
  },
};

export const TYPOGRAPHY = {
  fontFamilySans: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyMono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
};
