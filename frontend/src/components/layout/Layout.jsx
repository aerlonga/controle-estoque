import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useState } from 'react';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

const theme = createTheme({
    palette: {
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
    },
});

function Layout({ children, user, logout }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
                <Sidebar
                    userProfile={user?.perfil}
                    open={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <AppHeader
                        user={user}
                        logout={logout}
                        onMenuClick={toggleSidebar}
                    />

                    <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: '#f5f5f5' }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default Layout;
