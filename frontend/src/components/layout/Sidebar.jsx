import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Collapse, Divider, Toolbar, Typography, useTheme, useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    People as PeopleIcon,
    ExpandMore,
    ChevronRight
} from '@mui/icons-material';
import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';

const DRAWER_WIDTH = 260;

function Sidebar({ userProfile, open, onClose }) {
    const [configOpen, setConfigOpen] = useState(true);
    const isAdmin = userProfile === 'ADMIN';
    const location = useLocation();
    const currentPath = location.pathname;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawerContent = (
        <>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" fontWeight="bold">
                    Controle Estoque
                </Typography>
            </Toolbar>

            <Divider />

            <List>
                {/* Dashboard */}
                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/"
                        selected={currentPath === '/'}
                        onClick={isMobile ? onClose : undefined}
                    >
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>

                {/* Configuração - Apenas ADMIN */}
                {isAdmin && (
                    <>
                        <ListItemButton onClick={() => setConfigOpen(!configOpen)}>
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText primary="Configuração" />
                            {configOpen ? <ExpandMore /> : <ChevronRight />}
                        </ListItemButton>

                        <Collapse in={configOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to="/users"
                                    selected={currentPath === '/users'}
                                    onClick={isMobile ? onClose : undefined}
                                    sx={{ pl: 4 }}
                                >
                                    <ListItemIcon>
                                        <PeopleIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Usuários" />
                                </ListItemButton>
                            </List>
                        </Collapse>
                    </>
                )}
            </List>
        </>
    );

    return (
        <>
            {/* Mobile drawer (temporary) */}
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop drawer (permanent, controlado) */}
            <Drawer
                variant="persistent"
                open={open}
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: open ? DRAWER_WIDTH : 0,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}

export default Sidebar;
