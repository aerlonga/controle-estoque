import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, Menu, MenuItem } from '@mui/material';
import { Logout as LogoutIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { useLocation } from '@tanstack/react-router';
import { useState } from 'react';

function AppHeader({ user, logout, mode, toggleTheme }) {
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);

    const pageTitle = {
        '/': 'Dashboard',
        '/users': 'Gerenciar Usuários',
    }[location.pathname] || 'Sistema';

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {pageTitle}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {user?.nome?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                            {user?.nome}
                        </Typography>
                    </Box>

                    {/* Theme Toggle */}
                    <IconButton
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        color="inherit"
                    >
                        {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem onClick={() => { toggleTheme('light'); setAnchorEl(null); }}>
                            ☀️ Light
                        </MenuItem>
                        <MenuItem onClick={() => { toggleTheme('dark'); setAnchorEl(null); }}>
                            🌙 Dark
                        </MenuItem>
                    </Menu>

                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<LogoutIcon />}
                        onClick={logout}
                        size="small"
                    >
                        Sair
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default AppHeader;
