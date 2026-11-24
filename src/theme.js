import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    primary: { main: '#0a0a0a' },
    error: { main: '#c0392b' },
    background: { default: '#f3f3f3' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiSwitch: { defaultProps: { size: 'small', color: 'primary' } },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 12 } } },
    MuiFormHelperText: { styleOverrides: { root: { fontSize: 12, marginLeft: 0 } } },
    MuiOutlinedInput: { styleOverrides: {
      root: { fontSize: 14, backgroundColor: '#fff' },
      input: { '&::placeholder': { fontSize: 14, opacity: 1, color: '#8a8a8a' } },
    } },
    MuiMenuItem: { styleOverrides: { root: { fontSize: 14 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 14 } } },
  },
});
