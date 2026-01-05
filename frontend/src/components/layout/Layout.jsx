import { Box, CssBaseline, createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useState, useMemo } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

function Layout({ children, user, logout }) {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            primary: { main: '#1976d2' },
            secondary: { main: '#dc004e' },
        },
    }), [mode]);

    const toggleTheme = (newMode) => {
        setMode(newMode);
        localStorage.setItem('theme', newMode);
    };

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar userProfile={user?.perfil} />

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <AppHeader user={user} logout={logout} mode={mode} toggleTheme={toggleTheme} />

                    <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default' }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </MuiThemeProvider>
    );
}

export default Layout;
