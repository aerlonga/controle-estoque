import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Alert, Box, Typography, MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { equipamentoService } from '../../services/api';
import { useState } from 'react';
import ConfirmDialog from '../common/ConfirmDialog';

const equipmentSchema = z.object({
    patrimonio: z.string().optional(),
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    modelo: z.string().min(2, 'Modelo deve ter no mínimo 2 caracteres'),
    numero_serie: z.string().min(1, 'Número de série é obrigatório'),
    local: z.string().optional(),
    status: z.enum(['NO_DEPOSITO', 'FORA_DEPOSITO', 'DESCARTADO']),
});

function EditEquipmentDialog({ open, onClose, onSuccess, equipment }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingData, setPendingData] = useState(null);

    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(equipmentSchema),
        values: equipment ? {
            patrimonio: equipment.patrimonio || '',
            nome: equipment.nome || '',
            modelo: equipment.modelo || '',
            numero_serie: equipment.numero_serie || '',
            local: equipment.local || '',
            status: equipment.status || 'NO_DEPOSITO',
        } : undefined,
    });

    const updateMutation = useMutation({
        mutationFn: (data) => equipamentoService.atualizar(equipment.id, data),
        onSuccess: () => {
            reset();
            setConfirmOpen(false);
            onSuccess();
        },
    });

    const handleClose = () => {
        reset();
        updateMutation.reset();
        setConfirmOpen(false);
        setPendingData(null);
        onClose();
    };

    const onSubmit = (data) => {
        setPendingData(data);
        setConfirmOpen(true);
    };

    const handleConfirmUpdate = () => {
        if (pendingData) {
            updateMutation.mutate(pendingData);
        }
    };

    return (
        <>
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
                        Editar Equipamento
                        <Typography variant="caption" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                            *Campos obrigatórios
                        </Typography>
                    </Box>
                </DialogTitle>

                <form onSubmit={handleSubmit(onSubmit)}>
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

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Status"
                                    fullWidth
                                    margin="normal"
                                    required
                                >
                                    <MenuItem value="NO_DEPOSITO">No Depósito</MenuItem>
                                    <MenuItem value="FORA_DEPOSITO">Fora do Depósito</MenuItem>
                                    <MenuItem value="DESCARTADO">Descartado</MenuItem>
                                </TextField>
                            )}
                        />

                        {updateMutation.isError && (
                            <Alert severity="error" sx={{ mt: 2 }}>
                                {updateMutation.error.response?.data?.error || 'Erro ao atualizar equipamento'}
                            </Alert>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleClose}>Cancelar</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={updateMutation.isPending}
                        >
                            Salvar
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmUpdate}
                title="Confirmar Alterações"
                message="Deseja realmente salvar as alterações realizadas neste equipamento?"
                confirmText="Confirmar"
                cancelText="Cancelar"
            />
        </>
    );
}

export default EditEquipmentDialog;
