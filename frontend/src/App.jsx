import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Layout from './components/layout/Layout';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthenticated ? (
        <Layout
          user={user}
          logout={logout}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        >
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'users' && <Users />}
        </Layout>
      ) : (
        <Login />
      )}
    </QueryClientProvider>
  );
}

export default App;
