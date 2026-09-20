import { COLOR_TOKENS, TYPOGRAPHY } from './tokens';

export const SYSTEM_THEME = {
  colors: COLOR_TOKENS,
  typography: TYPOGRAPHY,
  shadows: {
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    glowCyan: '0 0 15px -3px rgba(6, 182, 212, 0.25)',
    glowAmber: '0 0 15px -3px rgba(245, 158, 11, 0.25)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
};
