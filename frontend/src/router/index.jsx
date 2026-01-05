import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import Login from '../pages/Login';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Users = lazy(() => import('../pages/Users'));
const Equipments = lazy(() => import('../pages/Equipments'));

const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
    </Box>
);

const rootRoute = createRootRoute({
    component: () => {
        const { isAuthenticated, user, logout } = useAuthStore();

        if (!isAuthenticated) {
            return <Login />;
        }

        return (
            <Layout user={user} logout={logout}>
                <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                </Suspense>
            </Layout>
        );
    },
});

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Dashboard,
});

const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            throw redirect({ to: '/' });
        }
    },
    component: Users,
});

const equipmentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/equipments',
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
            throw redirect({ to: '/' });
        }
    },
    component: Equipments,
});

const routeTree = rootRoute.addChildren([dashboardRoute, usersRoute, equipmentsRoute]);

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
});
