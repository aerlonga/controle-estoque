import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'
import SignIn from '../sign-in/SignIn'
import AppLayout from '../layouts/AppLayout'
import { useAuthStore } from '../store/authStore'
import NotificationsProvider from '../equipamentos/hooks/useNotifications/NotificationsProvider'
import DialogsProvider from '../equipamentos/hooks/useDialogs/DialogsProvider'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const Users = lazy(() => import('../pages/Users'))


// Equipment components from MUI template
const EquipmentList = lazy(() => import('../equipamentos/components/EquipmentList'))
const EquipmentCreate = lazy(() => import('../equipamentos/components/EquipmentCreate'))
const EquipmentEdit = lazy(() => import('../equipamentos/components/EquipmentEdit'))

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
                <NotificationsProvider>
                    <DialogsProvider>
                        <Suspense fallback={<LoadingFallback />}>
                            <Outlet />
                        </Suspense>
                    </DialogsProvider>
                </NotificationsProvider>
            </AppLayout>
        )
    },
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Dashboard,
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
    component: EquipmentList,
})

const equipmentNewRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/equipments/new',
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) {
            throw redirect({ to: '/' })
        }
    },
    component: EquipmentCreate,
})



const equipmentEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/equipments/$id/edit',
    beforeLoad: () => {
        const { isAuthenticated } = useAuthStore.getState()
        if (!isAuthenticated) {
            throw redirect({ to: '/' })
        }
    },
    component: EquipmentEdit,
})

const routeTree = rootRoute.addChildren([
    dashboardRoute,
    usersRoute,
    equipmentsRoute,
    equipmentNewRoute,
    equipmentEditRoute,

])

export const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
})
