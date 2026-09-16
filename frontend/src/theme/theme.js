import { createTheme } from '@mui/material/styles';

// Admin / Sales / Inventory theme: the same black & gold luxury identity as
// the customer side, so every role feels like one product.
export const adminColors = {
  bgDark: '#0F0B08',
  surfaceDark: '#1A130D',
  surface2Dark: '#241A10',
  bgLight: '#FAF6EC',
  surfaceLight: '#FFFFFF',
  surface2Light: '#F3EBD8',
  accent: '#C9A227',
  accentDark: '#8B5E14',
  accentLight: '#E8C77E',
  borderDark: 'rgba(245,239,228,0.10)',
  borderLight: 'rgba(139,94,20,0.16)',
  textDark: '#F5EFE4',
  textMutedDark: '#B8AA95',
  textLight: '#241A0D',
  textMutedLight: '#7A6A52',
};

export const getTheme = (dark) =>
  createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: { main: adminColors.accent, contrastText: '#1A1108' },
      secondary: { main: adminColors.accentDark },
      background: {
        default: dark ? adminColors.bgDark : adminColors.bgLight,
        paper: dark ? adminColors.surfaceDark : adminColors.surfaceLight,
      },
      text: {
        primary: dark ? adminColors.textDark : adminColors.textLight,
        secondary: dark ? adminColors.textMutedDark : adminColors.textMutedLight,
      },
      divider: dark ? adminColors.borderDark : adminColors.borderLight,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
      h6: { fontFamily: 'Inter, sans-serif', fontWeight: 700 },
      button: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 700, borderRadius: 10 },
          containedPrimary: {
            color: '#1A1108',
            backgroundImage: `linear-gradient(135deg, ${adminColors.accentLight} 0%, ${adminColors.accent} 55%, ${adminColors.accentDark} 100%)`,
            boxShadow: '0 8px 20px rgba(201,162,39,.22)',
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${adminColors.accentLight} 0%, ${adminColors.accentDark} 100%)`,
              boxShadow: '0 10px 24px rgba(201,162,39,.3)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 14,
            boxShadow:
              theme.palette.mode === 'dark'
                ? '0 8px 25px rgba(0,0,0,.35)'
                : '0 8px 25px rgba(139,94,20,.08)',
          }),
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
    },
  });

// Client-side (customer) theme: dark, warm gold/amber luxury identity —
// distinct from the admin/staff dashboards.
//   bg / bg-elevated : #100B08 / #1C140D
//   accent (gold)     : #C9A227  |  accent hover / deep: #8B5E14
//   text              : #F5EFE4 (primary)  #B8AA95 (muted)
export const clientColors = {
  bg: '#100B08',
  surface: '#1C140D',
  surface2: '#241A10',
  accent: '#C9A227',
  accentDark: '#8B5E14',
  accentLight: '#E8C77E',
  text: '#F5EFE4',
  textMuted: '#B8AA95',
  border: 'rgba(245,239,228,0.10)',
};

export const getClientTheme = () =>
  createTheme({
    palette: {
      mode: 'dark',
      primary: { main: clientColors.accent, contrastText: '#1A1108' },
      secondary: { main: clientColors.accentLight },
      success: { main: clientColors.accent },
      background: { default: clientColors.bg, paper: clientColors.surface },
      text: { primary: clientColors.text, secondary: clientColors.textMuted },
      divider: clientColors.border,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Inter, Roboto, Arial, sans-serif',
      h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
      h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
      h5: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600 },
      h6: { fontFamily: 'Inter, sans-serif', fontWeight: 700 },
      button: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 999 },
          containedPrimary: {
            color: '#1A1108',
            backgroundImage: `linear-gradient(135deg, ${clientColors.accentLight} 0%, ${clientColors.accent} 55%, ${clientColors.accentDark} 100%)`,
            boxShadow: '0 8px 20px rgba(201,162,39,.28)',
            '&:hover': {
              backgroundImage: `linear-gradient(135deg, ${clientColors.accentLight} 0%, ${clientColors.accentDark} 100%)`,
              boxShadow: '0 10px 24px rgba(201,162,39,.36)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: clientColors.surface,
            backgroundImage: 'none',
            border: `1px solid ${clientColors.border}`,
            borderRadius: 12,
          },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiAppBar: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
    },
  });
