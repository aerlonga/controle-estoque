import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Collapse, Divider, Toolbar, Typography
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    People as PeopleIcon,
    ExpandMore,
    ChevronRight
} from '@mui/icons-material';
import { useState } from 'react';

const DRAWER_WIDTH = 260;

function Sidebar({ currentPage, onNavigate, userProfile }) {
    const [configOpen, setConfigOpen] = useState(true);
    const isAdmin = userProfile === 'ADMIN';

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                },
            }}
        >
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
                        selected={currentPage === 'dashboard'}
                        onClick={() => onNavigate('dashboard')}
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
                                    selected={currentPage === 'users'}
                                    onClick={() => onNavigate('users')}
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
        </Drawer>
    );
}

export default Sidebar;
