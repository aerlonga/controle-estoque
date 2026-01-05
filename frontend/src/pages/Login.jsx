import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const loginSchema = z.object({
    usuario_rede: z.string().min(1, 'Usuário é obrigatório'),
    senha: z.string().min(1, 'Senha é obrigatória'),
});

function Login() {
    const { login } = useAuthStore();
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: ({ usuario_rede, senha }) =>
            authService.login(usuario_rede, senha),
        onSuccess: (data) => {
            login(data.usuario, data.token);
            setError('');
        },
        onError: (error) => {
            setError(
                error.response?.data?.error || 'Erro ao fazer login. Tente novamente.'
            );
        },
    });

    const onSubmit = (data) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Controle de Estoque
                    </h1>
                    <p className="text-gray-600 mt-2">Faça login para continuar</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label
                            htmlFor="usuario_rede"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Usuário de Rede
                        </label>
                        <input
                            {...register('usuario_rede')}
                            type="text"
                            id="usuario_rede"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="Digite seu usuário"
                        />
                        {errors.usuario_rede && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.usuario_rede.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="senha"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Senha
                        </label>
                        <input
                            {...register('senha')}
                            type="password"
                            id="senha"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="Digite sua senha"
                        />
                        {errors.senha && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.senha.message}
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
