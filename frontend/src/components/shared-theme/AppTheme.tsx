import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export default function AppTheme({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = React.useState<'light' | 'dark'>('light');

    React.useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
        if (savedMode) {
            setMode(savedMode);
        }
    }, []);

    const theme = React.useMemo(() => {
        const themeOptions: ThemeOptions = {
            palette: {
                mode,
                primary: {
                    main: '#4e60ff',
                },
                secondary: {
                    main: '#f6ad37',
                },
                ...(mode === 'light'
                    ? {
                        background: {
                            default: '#f5f5f5',
                            paper: '#ffffff',
                        },
                    }
                    : {
                        background: {
                            default: '#0a1929',
                            paper: '#1e1e1e',
                        },
                    }),
            },
            typography: {
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            },
            shape: {
                borderRadius: 8,
            },
        };

        return createTheme(themeOptions);
    }, [mode]);

    const toggleColorMode = React.useCallback(() => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    }, []);

    // Pass mode and toggleColorMode as props to children
    const childrenWithProps = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
                mode,
                toggleColorMode,
            });
        }
        return child;
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {childrenWithProps}
        </ThemeProvider>
    );
}
