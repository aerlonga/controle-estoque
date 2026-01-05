import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated ? (
          <>
            {/* Header com logout */}
            <header className="bg-white shadow">
              <div className="container mx-auto px-8 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Controle de Estoque
                </h1>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Olá, <strong>{user?.nome || 'Usuário'}</strong>
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-medium"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </header>

            {/* Conteúdo principal */}
            <div className="container mx-auto p-8">
              <p className="text-gray-600">
                Dashboard em desenvolvimento...
              </p>
            </div>
          </>
        ) : (
          <Login />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
