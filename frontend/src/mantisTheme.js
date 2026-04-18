import { createTheme } from '@mui/material/styles';

const colors = {
  primary: {
    lighter: '#e8f0fe',
    light: '#1a73e8',
    main: '#1557b0',
    dark: '#0d47a1',
    darker: '#0a3b7d',
    contrastText: '#fff'
  },
  secondary: {
    lighter: '#f5f5f5',
    light: '#9e9e9e',
    main: '#616161',
    dark: '#424242',
    darker: '#212121',
    contrastText: '#fff'
  },
  error: {
    lighter: '#fdecea',
    light: '#f28b82',
    main: '#d93025',
    dark: '#c5221f',
    darker: '#a50e0c',
    contrastText: '#fff'
  },
  warning: {
    lighter: '#fef7e0',
    light: '#fdd663',
    main: '#f9a825',
    dark: '#f57f17',
    darker: '#e65100',
    contrastText: '#000'
  },
  info: {
    lighter: '#e0f7fa',
    light: '#4dd0e1',
    main: '#00acc1',
    dark: '#00838f',
    darker: '#006064',
    contrastText: '#fff'
  },
  success: {
    lighter: '#e8f5e9',
    light: '#81c784',
    main: '#43a047',
    dark: '#2e7d32',
    darker: '#1b5e20',
    contrastText: '#fff'
  },
  grey: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    A50: '#fafafb',
    A100: '#f5f5f5',
    A200: '#eeeeee',
    A400: '#bdbdbd',
    A700: '#616161'
  }
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: colors.primary.light,
      main: colors.primary.main,
      dark: colors.primary.dark,
      contrastText: colors.primary.contrastText
    },
    secondary: {
      light: colors.secondary.light,
      main: colors.secondary.main,
      dark: colors.secondary.dark,
      contrastText: colors.secondary.contrastText
    },
    error: {
      light: colors.error.light,
      main: colors.error.main,
      dark: colors.error.dark,
      contrastText: colors.error.contrastText
    },
    warning: {
      light: colors.warning.light,
      main: colors.warning.main,
      dark: colors.warning.dark,
      contrastText: colors.warning.contrastText
    },
    info: {
      light: colors.info.light,
      main: colors.info.main,
      dark: colors.info.dark,
      contrastText: colors.info.contrastText
    },
    success: {
      light: colors.success.light,
      main: colors.success.main,
      dark: colors.success.dark,
      contrastText: colors.success.contrastText
    },
    grey: colors.grey,
    text: {
      primary: colors.grey[700],
      secondary: colors.grey[500],
      disabled: colors.grey[400]
    },
    divider: colors.grey[200],
    background: {
      paper: colors.grey[0],
      default: colors.grey[50]
    },
    action: {
      disabled: colors.grey[300],
      disabledOpacity: 0.5
    }
  },
  typography: {
    fontFamily: '"Public Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.35 },
    h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5 },
    h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.55 },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.75rem', lineHeight: 1.7 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
    caption: { fontSize: '0.75rem', lineHeight: 1.8 }
  },
  shape: {
    borderRadius: 12,
    borderRadiusSmall: 8
  },
  shadows: [
    'none',
    '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
    '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
    '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)',
    '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 5px 8px 0px rgba(0,0,0,0.14),0px 1px 14px 0px rgba(0,0,0,0.12)',
    '0px 3px 5px -1px rgba(0,0,0,0.2),0px 6px 10px 0px rgba(0,0,0,0.14),0px 1px 18px 0px rgba(0,0,0,0.12)',
    '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 8px 0px rgba(0,0,0,0.14),0px 2px 16px 0px rgba(0,0,0,0.12)',
    '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 0px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
    '0px 5px 6px -3px rgba(0,0,0,0.2),0px 9px 12px 0px rgba(0,0,0,0.14),0px 3px 16px 0px rgba(0,0,0,0.12)',
    '0px 6px 6px -3px rgba(0,0,0,0.2),0px 10px 14px 0px rgba(0,0,0,0.14),0px 4px 20px 0px rgba(0,0,0,0.12)',
    '0px 6px 7px -4px rgba(0,0,0,0.2),0px 11px 15px 0px rgba(0,0,0,0.14),0px 4px 22px 0px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 12px 17px 0px rgba(0,0,0,0.14),0px 5px 24px 0px rgba(0,0,0,0.12)',
    '0px 7px 8px -4px rgba(0,0,0,0.2),0px 13px 19px 0px rgba(0,0,0,0.14),0px 5px 26px 0px rgba(0,0,0,0.12)',
    '0px 8px 9px -5px rgba(0,0,0,0.2),0px 14px 21px 0px rgba(0,0,0,0.14),0px 6px 28px 0px rgba(0,0,0,0.12)',
    '0px 8px 10px -5px rgba(0,0,0,0.2),0px 15px 23px 0px rgba(0,0,0,0.14),0px 6px 30px 0px rgba(0,0,0,0.12)',
    '0px 8px 11px -5px rgba(0,0,0,0.2),0px 16px 25px 0px rgba(0,0,0,0.14),0px 6px 32px 0px rgba(0,0,0,0.12)',
    '0px 9px 11px -6px rgba(0,0,0,0.2),0px 17px 27px 0px rgba(0,0,0,0.14),0px 7px 34px 0px rgba(0,0,0,0.12)',
    '0px 9px 12px -6px rgba(0,0,0,0.2),0px 18px 29px 0px rgba(0,0,0,0.14),0px 7px 36px 0px rgba(0,0,0,0.12)',
    '0px 10px 13px -6px rgba(0,0,0,0.2),0px 19px 31px 0px rgba(0,0,0,0.14),0px 8px 38px 0px rgba(0,0,0,0.12)',
    '0px 10px 14px -7px rgba(0,0,0,0.2),0px 20px 33px 0px rgba(0,0,0,0.14),0px 8px 40px 0px rgba(0,0,0,0.12)',
    '0px 10px 15px -7px rgba(0,0,0,0.2),0px 21px 35px 0px rgba(0,0,0,0.14),0px 9px 42px 0px rgba(0,0,0,0.12)',
    '0px 11px 16px -7px rgba(0,0,0,0.2),0px 22px 37px 0px rgba(0,0,0,0.14),0px 9px 44px 0px rgba(0,0,0,0.12)',
    '0px 11px 17px -8px rgba(0,0,0,0.2),0px 23px 39px 0px rgba(0,0,0,0.14),0px 10px 46px 0px rgba(0,0,0,0.12)'
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px'
        },
        contained: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 8px 0px rgba(0,0,0,0.14),0px 2px 16px 0px rgba(0,0,0,0.12)'
          }
        },
        containedPrimary: {
          background: colors.primary.main,
          '&:hover': {
            background: colors.primary.dark
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        },
        elevation1: {
          boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
        },
        elevation2: {
          boxShadow: '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)'
        },
        elevation3: {
          boxShadow: '0px 4px 5px -2px rgba(0,0,0,0.2),0px 7px 8px 0px rgba(0,0,0,0.14),0px 2px 16px 0px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '16px'
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.grey[50]
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.grey[50]
          }
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: '0px 3px 3px -2px rgba(0,0,0,0.2),0px 3px 4px 0px rgba(0,0,0,0.14),0px 1px 8px 0px rgba(0,0,0,0.12)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[0],
          color: colors.grey[700]
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&:hover': {
            backgroundColor: colors.primary.lighter
          },
          '&.Mui-selected': {
            backgroundColor: colors.primary.lighter,
            '&:hover': {
              backgroundColor: colors.primary.lighter
            }
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 48
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.grey[800],
          borderRadius: 6,
          fontSize: '0.75rem'
        }
      }
    }
  }
});

export default theme;