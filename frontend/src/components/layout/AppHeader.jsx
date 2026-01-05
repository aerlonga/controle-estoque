import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useLocation } from '@tanstack/react-router';

function AppHeader({ user, logout }) {
    const location = useLocation();

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
