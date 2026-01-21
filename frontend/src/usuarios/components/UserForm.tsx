import * as React from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { usuarioService } from '../../services/api';
import type { UsuarioFormData } from '../../types/api';
import PageContainer from '../../equipamentos/components/PageContainer';
import useNotifications from '../../equipamentos/hooks/useNotifications/useNotifications';

const userSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    usuario_rede: z.string().min(3, 'Usuário deve ter no mínimo 3 caracteres'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
    perfil: z.enum(['USUARIO', 'ADMIN']),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UserForm() {
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const notifications = useNotifications();

    const userId = params.id ? Number(params.id) : null;
    const isEditMode = userId !== null;

    const [isLoading, setIsLoading] = React.useState(false);
    const [isFetching, setIsFetching] = React.useState(isEditMode);
    const [error, setError] = React.useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            nome: '',
            usuario_rede: '',
            senha: '',
            perfil: 'USUARIO',
        },
    });

    React.useEffect(() => {
        if (isEditMode && userId) {
            setIsFetching(true);
            usuarioService
                .buscarPorId(userId)
                .then((response) => {
                    const usuario = response.data;
                    reset({
                        nome: usuario.nome,
                        usuario_rede: usuario.usuario_rede,
                        senha: '',
                        perfil: usuario.perfil,
                    });
                })
                .catch((err) => {
                    setError(err.message || 'Erro ao carregar usuário');
                })
                .finally(() => {
                    setIsFetching(false);
                });
        }
    }, [isEditMode, userId, reset]);

    const onSubmit = async (data: UserFormValues) => {
        setIsLoading(true);
        setError(null);

        try {
            const formData: UsuarioFormData = {
                nome: data.nome,
                usuario_rede: data.usuario_rede,
                perfil: data.perfil,
            };

            // Adicionar senha somente se foi preenchida
            if (data.senha && data.senha.trim() !== '') {
                formData.senha = data.senha;
            }

            if (isEditMode && userId) {
                await usuarioService.atualizar(userId, formData);
                notifications.show('Usuário atualizado com sucesso!', {
                    severity: 'success',
                    autoHideDuration: 3000,
                });
            } else {
                if (!formData.senha) {
                    setError('Senha é obrigatória para criar um novo usuário');
                    setIsLoading(false);
                    return;
                }
                await usuarioService.criar(formData);
                notifications.show('Usuário criado com sucesso!', {
                    severity: 'success',
                    autoHideDuration: 3000,
                });
            }

            navigate({ to: '/users' });
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Erro ao salvar usuário');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate({ to: '/users' });
    };

    if (isFetching) {
        return (
            <PageContainer title={isEditMode ? 'Editar Usuário' : 'Criar Usuário'}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <Typography>Carregando...</Typography>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title={isEditMode ? 'Editar Usuário' : 'Criar Usuário'}>
            <Paper sx={{ p: 3, maxWidth: 600 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        {error && <Alert severity="error">{error}</Alert>}

                        <Controller
                            name="nome"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Nome Completo"
                                    fullWidth
                                    error={!!errors.nome}
                                    helperText={errors.nome?.message}
                                    disabled={isLoading}
                                />
                            )}
                        />

                        <Controller
                            name="usuario_rede"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Usuário de Rede"
                                    fullWidth
                                    error={!!errors.usuario_rede}
                                    helperText={errors.usuario_rede?.message}
                                    disabled={isLoading}
                                />
                            )}
                        />

                        <Controller
                            name="senha"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label={isEditMode ? 'Nova Senha (opcional)' : 'Senha'}
                                    type="password"
                                    fullWidth
                                    error={!!errors.senha}
                                    helperText={
                                        errors.senha?.message ||
                                        (isEditMode
                                            ? 'Deixe em branco para manter a senha atual'
                                            : '')
                                    }
                                    disabled={isLoading}
                                />
                            )}
                        />

                        <Controller
                            name="perfil"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Perfil"
                                    fullWidth
                                    error={!!errors.perfil}
                                    helperText={errors.perfil?.message}
                                    disabled={isLoading}
                                >
                                    <MenuItem value="USUARIO">Usuário</MenuItem>
                                    <MenuItem value="ADMIN">Administrador</MenuItem>
                                </TextField>
                            )}
                        />

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button onClick={handleCancel} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Salvando...'
                                    : isEditMode
                                        ? 'Atualizar'
                                        : 'Criar'}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </Paper>
        </PageContainer>
    );
}
