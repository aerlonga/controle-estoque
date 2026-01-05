import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Collapse, Divider, Toolbar, Typography
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Settings as SettingsIcon,
    People as PeopleIcon,
    Inventory as InventoryIcon,
    ExpandMore,
    ChevronRight
} from '@mui/icons-material';
import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';

const DRAWER_WIDTH = 260;

function Sidebar({ userProfile }) {
    const [configOpen, setConfigOpen] = useState(true);
    const isAdmin = userProfile === 'ADMIN';
    const location = useLocation();
    const currentPath = location.pathname;

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
                        component={Link}
                        to="/"
                        selected={currentPath === '/'}
                    >
                        <ListItemIcon>
                            <DashboardIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                </ListItem>

                {/* Equipamentos - Todos os perfis */}
                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/equipments"
                        selected={currentPath === '/equipments'}
                    >
                        <ListItemIcon>
                            <InventoryIcon />
                        </ListItemIcon>
                        <ListItemText primary="Equipamentos" />
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
