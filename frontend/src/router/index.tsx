import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'
import SignIn from '../components/sign-in/SignIn'
import AppLayout from '../layouts/AppLayout'
import { useAuthStore } from '../store/authStore'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Users = lazy(() => import('../pages/Users'))
const Equipments = lazy(() => import('../pages/Equipments'))
const dashboardTeste = lazy(() => import('../pages/dashboard-teste'))

const LoadingFallback = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
    </Box>
)

const rootRoute = createRootRoute({
    component: () => {
        const { isAuthenticated } = useAuthStore()

        if (!isAuthenticated) {
            return <SignIn />
        }

        return (
            <AppLayout>
                <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                </Suspense>
            </AppLayout>
        )
    },
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Dashboard,
})

const dashboardTesteRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/dashboard-teste',
    component: dashboardTeste,
})

const usersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users',
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) {
            throw redirect({ to: '/' })
        }
    },
    component: Users,
})

const equipmentsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/equipments',
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) {
            throw redirect({ to: '/' })
        }
    },
    component: Equipments,
})

const routeTree = rootRoute.addChildren([dashboardRoute, usersRoute, equipmentsRoute, dashboardTesteRoute])

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
})
