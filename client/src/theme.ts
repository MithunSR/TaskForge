import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1F3A5F',
      light: '#4A78B0',
      dark: '#132844',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4A78B0',
    },
    background: {
      default: '#F4F6F9',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, padding: '10px 0' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
  },
});