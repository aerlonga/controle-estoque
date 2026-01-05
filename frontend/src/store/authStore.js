import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (user, token) => {
                localStorage.setItem('token', token);
                localStorage.setItem('usuario', JSON.stringify(user));
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateUser: (user) => {
                localStorage.setItem('usuario', JSON.stringify(user));
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
