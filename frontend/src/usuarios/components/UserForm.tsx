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
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
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
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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
                                <FormControl variant="standard" fullWidth error={!!errors.nome}>
                                    <Input
                                        {...field}
                                        id="user-nome"
                                        disabled={isLoading}
                                        inputProps={{
                                            'aria-label': 'Nome Completo',
                                        }}
                                    />
                                    <FormHelperText>
                                        {errors.nome?.message || 'Nome Completo'}
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />

                        <Controller
                            name="usuario_rede"
                            control={control}
                            render={({ field }) => (
                                <FormControl variant="standard" fullWidth error={!!errors.usuario_rede}>
                                    <Input
                                        {...field}
                                        id="user-usuario-rede"
                                        disabled={isLoading}
                                        inputProps={{
                                            'aria-label': 'Usuário de Rede',
                                        }}
                                    />
                                    <FormHelperText>
                                        {errors.usuario_rede?.message || 'Usuário de Rede'}
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />

                        <Controller
                            name="senha"
                            control={control}
                            render={({ field }) => (
                                <FormControl variant="standard" fullWidth error={!!errors.senha}>
                                    <Input
                                        {...field}
                                        id="user-senha"
                                        type={showPassword ? 'text' : 'password'}
                                        disabled={isLoading}
                                        inputProps={{
                                            'aria-label': isEditMode ? 'Nova Senha (opcional)' : 'Senha',
                                        }}
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    size="small"
                                                    disableRipple
                                                    sx={{
                                                        color: 'text.secondary',
                                                        border: 'none',
                                                        backgroundColor: 'transparent',
                                                        width: 'auto',
                                                        height: 'auto',
                                                        padding: 0,
                                                        minWidth: 0,
                                                        '&:hover': {
                                                            backgroundColor: 'transparent',
                                                            border: 'none',
                                                        },
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                    />
                                    <FormHelperText>
                                        {errors.senha?.message ||
                                            (isEditMode
                                                ? 'Nova Senha (opcional) - Deixe em branco para manter a senha atual'
                                                : 'Senha')}
                                    </FormHelperText>
                                </FormControl>
                            )}
                        />

                        <Controller
                            name="perfil"
                            control={control}
                            render={({ field }) => (
                                <FormControl variant="standard" fullWidth error={!!errors.perfil}>
                                    <TextField
                                        {...field}
                                        id="user-perfil"
                                        select
                                        variant="standard"
                                        fullWidth
                                        disabled={isLoading}
                                    >
                                        <MenuItem value="USUARIO">Usuário</MenuItem>
                                        <MenuItem value="ADMIN">Administrador</MenuItem>
                                    </TextField>
                                    <FormHelperText>
                                        {errors.perfil?.message || 'Perfil'}
                                    </FormHelperText>
                                </FormControl>
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
