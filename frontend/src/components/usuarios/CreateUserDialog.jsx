import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, MenuItem, Alert
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { usuarioService } from '../../services/api';

const userSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    usuario_rede: z.string().min(3, 'Usuário deve ter no mínimo 3 caracteres'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    perfil: z.enum(['USUARIO', 'ADMIN']),
});

function CreateUserDialog({ open, onClose, onSuccess }) {
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            nome: '',
            usuario_rede: '',
            senha: '',
            perfil: 'USUARIO',
        },
    });

    const createMutation = useMutation({
        mutationFn: usuarioService.criar,
        onSuccess: () => {
            reset();
            onSuccess();
        },
    });

    const handleClose = () => {
        reset();
        createMutation.reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                handleClose();
            }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Criar Novo Usuário</DialogTitle>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
                <DialogContent>
                    <Controller
                        name="nome"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Nome Completo"
                                fullWidth
                                margin="normal"
                                error={!!errors.nome}
                                helperText={errors.nome?.message}
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
                                margin="normal"
                                error={!!errors.usuario_rede}
                                helperText={errors.usuario_rede?.message}
                            />
                        )}
                    />

                    <Controller
                        name="senha"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Senha"
                                type="password"
                                fullWidth
                                margin="normal"
                                error={!!errors.senha}
                                helperText={errors.senha?.message}
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
                                margin="normal"
                            >
                                <MenuItem value="USUARIO">Usuário</MenuItem>
                                <MenuItem value="ADMIN">Administrador</MenuItem>
                            </TextField>
                        )}
                    />

                    {createMutation.isError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {createMutation.error.response?.data?.error || 'Erro ao criar usuário'}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'Criando...' : 'Criar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default CreateUserDialog;
