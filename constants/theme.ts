export const Colors = {
  // Backgrounds
  bg: {
    primary: '#12082E',
    secondary: '#1A0F3E',
    card: '#231450',
    surface: '#2A1960',
    elevated: '#321F72',
    input: '#1C1640',
  },

  // Brand
  brand: {
    primary: '#FF6B35',
    secondary: '#FF9500',
    gradient: ['#FF6B35', '#FF9500'] as const,
  },

  // Accents
  accent: {
    purple: '#9B59F5',
    purpleLight: '#B47EFF',
    cyan: '#00D4FF',
    gold: '#FFD700',
    goldDark: '#E5B800',
    badge: '#FF4500',
    teal: '#00E5CC',
  },

  // Semantic
  correct: '#22C55E',
  correctBg: 'rgba(34,197,94,0.15)',
  wrong: '#EF4444',
  wrongBg: 'rgba(239,68,68,0.12)',

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.7)',
    muted: 'rgba(255,255,255,0.4)',
    hint: 'rgba(255,255,255,0.25)',
  },

  // Borders
  border: {
    default: 'rgba(155,89,245,0.2)',
    bright: 'rgba(155,89,245,0.4)',
    white: 'rgba(255,255,255,0.1)',
    cyanSoft: 'rgba(0,212,255,0.22)',
  },

  // Game modes
  modes: {
    quick: { from: '#FF4500', to: '#FF8C00' },
    friends: { from: '#00897B', to: '#00E5CC' },
    daily: { from: '#6B21D4', to: '#C084FC' },
    tournament: { from: '#1565C0', to: '#42A5F5' },
    leaderboard: { from: '#B7791F', to: '#FFD700' },
  },

  // Gradients
  gradients: {
    background: ['#2D1B69', '#1A0A4A', '#0D0527'] as const, // matches home BG_GRADIENT
    brandButton: ['#FF6B35', '#FFB800'] as const,
    option: ['#FFD700', '#FF8C00'] as const,
    modal: ['#00E5CC', '#00B8D4', '#0091A7'] as const,
    // Outer octagon frame — glowing teal diagonal
    modalFrame: ['#00E5CC', '#0091A7'] as const,
    // Inner octagon fill — dark teal -> navy diagonal
    modalFill: ['#0E3A44', '#0A1430'] as const,
  },

  // UI surface helpers
  ui: {
    socialBg: 'rgba(255,255,255,0.08)',
    socialBorder: 'rgba(255,255,255,0.15)',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Typography = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weight: {
    regular: '400' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  family: {
    regular: 'Nunito_400Regular',
    semibold: 'Nunito_600SemiBold',
    bold: 'Nunito_700Bold',
    extrabold: 'Nunito_800ExtraBold',
    black: 'Nunito_900Black',
  },
};

export const Shadows = {
  card: {
    shadowColor: '#9B59F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
  },
  glow: {
    shadowColor: '#9B59F5',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  modalGlow: {
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
};
