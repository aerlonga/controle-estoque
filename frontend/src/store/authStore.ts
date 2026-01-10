import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '../types/api'

interface AuthState {
    user: Usuario | null
    token: string | null
    isAuthenticated: boolean
    login: (user: Usuario, token: string) => void
    logout: () => void
    updateUser: (user: Usuario) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                localStorage.setItem('token', token)
                localStorage.setItem('usuario', JSON.stringify(user))
                set({ user, token, isAuthenticated: true })
            },

            logout: () => {
                localStorage.removeItem('token')
                localStorage.removeItem('usuario')
                set({ user: null, token: null, isAuthenticated: false })

                window.history.pushState({}, '', '/')
                window.dispatchEvent(new PopStateEvent('popstate'))
            },

            updateUser: (user) => {
                localStorage.setItem('usuario', JSON.stringify(user))
                set({ user })
            },
        }),
        {
            name: 'auth-storage',
        }
    )
)
