import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';

// Root route
const rootRoute = createRootRoute({
    component: () => {
        const { isAuthenticated, user, logout } = useAuthStore();

        if (!isAuthenticated) {
            return <Login />;
        }

        return <Layout user={user} logout={logout}><Outlet /></Layout>;
    },
});

// Dashboard route
const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Dashboard,
});

// Users route
const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    component: Users,
});

// Create route tree
const routeTree = rootRoute.addChildren([dashboardRoute, usersRoute]);

// Create and export router
export const router = createRouter({ routeTree });
