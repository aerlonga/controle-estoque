import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'
import { AccessTime as AccessTimeIcon } from '@mui/icons-material'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
        },
    },
})

function App() {
    const { token, logout } = useAuthStore()
    const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false)

    useEffect(() => {
        if (!token) {
            return
        }

        try {
            const decoded: any = jwtDecode(token)

            if (decoded.exp) {
                const currentTime = Date.now() / 1000
                const timeUntilExpiration = decoded.exp - currentTime

                if (timeUntilExpiration <= 0) {
                    setShowSessionExpiredModal(true)
                } else {
                    const timeoutId = setTimeout(() => {
                        setShowSessionExpiredModal(true)
                    }, timeUntilExpiration * 1000)

                    return () => {
                        clearTimeout(timeoutId)
                    }
                }
            }
        } catch (error) {
            logout()
        }
    }, [token, logout])

    const handleSessionExpiredConfirm = () => {
        setShowSessionExpiredModal(false)
        logout()
    }

    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />

            <Dialog
                open={showSessionExpiredModal}
                onClose={() => { }}
                disableEscapeKeyDown
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    }
                }}
            >
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        pt: 4,
                        pb: 3,
                        px: 3,
                        textAlign: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(255, 255, 255, 0.8)',
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 48, color: '#546e7a' }} />
                    </Box>
                    <DialogTitle
                        sx={{
                            color: '#37474f',
                            fontWeight: 700,
                            fontSize: '1.75rem',
                            p: 0,
                            mb: 1,
                        }}
                    >
                        Sessão Expirada
                    </DialogTitle>
                </Box>
                <DialogContent sx={{ pt: 4, pb: 2, px: 4 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: 'center',
                            color: 'text.secondary',
                            fontSize: '1.1rem',
                            lineHeight: 1.6,
                        }}
                    >
                        Clique no botão abaixo para entrar novamente.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
                    <Button
                        onClick={handleSessionExpiredConfirm}
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(96, 125, 139, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #78909c 0%, #546e7a 100%)',
                                boxShadow: '0 6px 16px rgba(96, 125, 139, 0.4)',
                                transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                        }}
                    >
                        Entrar
                    </Button>
                </DialogActions>
            </Dialog>
        </QueryClientProvider>
    )
}

export default App
