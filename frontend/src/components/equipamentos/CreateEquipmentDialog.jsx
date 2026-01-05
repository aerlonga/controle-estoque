import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Box, Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { equipamentoService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const equipmentSchema = z.object({
    patrimonio: z.string().optional(),
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    modelo: z.string().min(2, 'Modelo deve ter no mínimo 2 caracteres'),
    numero_serie: z.string().min(1, 'Número de série é obrigatório'),
    local: z.string().optional(),
});

function CreateEquipmentDialog({ open, onClose, onSuccess }) {
    const { user } = useAuthStore();

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(equipmentSchema),
        defaultValues: {
            patrimonio: '',
            nome: '',
            modelo: '',
            numero_serie: '',
            local: '',
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => {
            // Adiciona o usuario_id do usuário logado automaticamente
            return equipamentoService.criar({
                ...data,
                usuario_id: user.id,
            });
        },
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
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Cadastrar Novo Equipamento
                    <Typography variant="caption" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                        *Campos obrigatórios
                    </Typography>
                </Box>
            </DialogTitle>

            <form onSubmit={handleSubmit((data) => createMutation.mutate(data))}>
                <DialogContent>
                    <Controller
                        name="nome"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Nome do Equipamento"
                                fullWidth
                                margin="normal"
                                required
                                error={!!errors.nome}
                                helperText={errors.nome?.message}
                            />
                        )}
                    />

                    <Controller
                        name="modelo"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Modelo"
                                fullWidth
                                margin="normal"
                                required
                                error={!!errors.modelo}
                                helperText={errors.modelo?.message}
                            />
                        )}
                    />

                    <Controller
                        name="numero_serie"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Número de Série"
                                fullWidth
                                margin="normal"
                                required
                                error={!!errors.numero_serie}
                                helperText={errors.numero_serie?.message}
                            />
                        )}
                    />

                    <Controller
                        name="patrimonio"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Patrimônio"
                                fullWidth
                                margin="normal"
                                error={!!errors.patrimonio}
                                helperText={errors.patrimonio?.message}
                            />
                        )}
                    />

                    <Controller
                        name="local"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Local"
                                fullWidth
                                margin="normal"
                                error={!!errors.local}
                                helperText={errors.local?.message}
                            />
                        )}
                    />

                    {createMutation.isError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {createMutation.error.response?.data?.error || 'Erro ao cadastrar equipamento'}
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
                        {createMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default CreateEquipmentDialog;
