import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton } from '@mui/material';
import { Logout as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useLocation } from '@tanstack/react-router';

function AppHeader({ user, logout, onMenuClick }) {
    const location = useLocation();

    const pageTitle = {
        '/': 'Dashboard',
        '/users': 'Gerenciar Usuários',
    }[location.pathname] || 'Sistema';

    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="toggle sidebar"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

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
