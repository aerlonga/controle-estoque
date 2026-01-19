// import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Alert,
    Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { equipamentoService } from '../../services/api';
import type { Equipment } from '../data/equipments';
import type { TipoMovimentacao } from '../../types/api';

interface MovementDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    equipment: Equipment | null;
    tipoMovimentacao: TipoMovimentacao | null;
}

interface FormData {
    observacao: string;
}

export default function MovementDialog({
    open,
    onClose,
    onSuccess,
    equipment,
    tipoMovimentacao,
}: MovementDialogProps) {
    const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            observacao: '',
        },
    });

    const movementMutation = useMutation({
        mutationFn: (data: FormData) => {
            if (!equipment || !tipoMovimentacao) {
                throw new Error('Equipamento ou tipo de movimentação inválido');
            }
            return equipamentoService.movimentar(equipment.id, {
                tipo: tipoMovimentacao,
                observacao: data.observacao,
            });
        },
        onSuccess: () => {
            reset();
            onSuccess();
        },
    });

    const handleClose = () => {
        reset();
        movementMutation.reset();
        onClose();
    };

    const onSubmit = (data: FormData) => {
        movementMutation.mutate(data);
    };

    const titulo = tipoMovimentacao === 'SAIDA' ? 'Registrar Saída' : 'Registrar Entrada';
    const icon = tipoMovimentacao === 'SAIDA' ? '📤' : '📥';
    const statusAtual = equipment?.status === 'NO_DEPOSITO' ? 'No Depósito' : 'Fora do Depósito';
    const novoStatus = tipoMovimentacao === 'SAIDA' ? 'Fora do Depósito' : 'No Depósito';

    return (
        <Dialog
            open={open}
            onClose={(_event, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                handleClose();
            }}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {icon} {titulo}
            </DialogTitle>

            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        <strong>Equipamento:</strong> {equipment?.nome} ({equipment?.modelo})
                    </Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Status atual:</strong> {statusAtual}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 3 }}>
                        <strong>Novo status:</strong> {novoStatus} ✓
                    </Typography>

                    <Controller
                        name="observacao"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Observação (opcional)"
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Ex: Entregue ao setor financeiro"
                                error={!!errors.observacao}
                                helperText={errors.observacao?.message}
                            />
                        )}
                    />

                    {movementMutation.isError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {(movementMutation.error as Error)?.message || 'Erro ao registrar movimentação'}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={movementMutation.isPending}
                    >
                        Confirmar {titulo.split(' ')[1]}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
