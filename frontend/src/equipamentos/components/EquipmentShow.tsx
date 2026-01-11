import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate, useParams } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
    deleteOne as deleteEquipment,
    getOne as getEquipment,
    type Equipment,
} from '../data/equipments';
import PageContainer from './PageContainer';
import MovementDialog from './MovementDialog';
import type { TipoMovimentacao } from '../../types/api';

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    NO_DEPOSITO: { label: 'No Depósito', color: 'success' },
    FORA_DEPOSITO: { label: 'Fora do Depósito', color: 'warning' },
    DESCARTADO: { label: 'Descartado', color: 'error' },
};

export default function EquipmentShow() {
    const params = useParams({ strict: false });
    const equipmentId = (params as { id?: string }).id || '';
    const navigate = useNavigate();

    const dialogs = useDialogs();
    const notifications = useNotifications();

    const [equipment, setEquipment] = React.useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    // Movement dialog state
    const [movementDialogOpen, setMovementDialogOpen] = React.useState(false);
    const [tipoMovimentacao, setTipoMovimentacao] = React.useState<TipoMovimentacao | null>(null);

    const loadData = React.useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            const showData = await getEquipment(Number(equipmentId));
            setEquipment(showData);
        } catch (showDataError) {
            setError(showDataError as Error);
        }
        setIsLoading(false);
    }, [equipmentId]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleEquipmentEdit = React.useCallback(() => {
        navigate({ to: `/equipments/${equipmentId}/edit` });
    }, [navigate, equipmentId]);

    const handleEquipmentDelete = React.useCallback(async () => {
        if (!equipment) {
            return;
        }

        const confirmed = await dialogs.confirm(
            `Deseja realmente descartar "${equipment.nome}"?`,
            {
                title: 'Descartar equipamento?',
                severity: 'error',
                okText: 'Descartar',
                cancelText: 'Cancelar',
            },
        );

        if (confirmed) {
            setIsLoading(true);
            try {
                await deleteEquipment(Number(equipmentId));

                navigate({ to: '/equipments' });

                notifications.show('Equipamento descartado com sucesso.', {
                    severity: 'success',
                    autoHideDuration: 3000,
                });
            } catch (deleteError) {
                notifications.show(
                    `Falha ao descartar equipamento. Motivo: ${(deleteError as Error).message}`,
                    {
                        severity: 'error',
                        autoHideDuration: 3000,
                    },
                );
            }
            setIsLoading(false);
        }
    }, [equipment, dialogs, equipmentId, navigate, notifications]);

    const handleBack = React.useCallback(() => {
        navigate({ to: '/equipments' });
    }, [navigate]);

    const handleMovement = React.useCallback((tipo: TipoMovimentacao) => {
        setTipoMovimentacao(tipo);
        setMovementDialogOpen(true);
    }, []);

    const handleMovementClose = React.useCallback(() => {
        setMovementDialogOpen(false);
        setTipoMovimentacao(null);
    }, []);

    const handleMovementSuccess = React.useCallback(() => {
        loadData();
        handleMovementClose();
    }, [loadData, handleMovementClose]);

    const renderShow = React.useMemo(() => {
        if (isLoading) {
            return (
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        m: 1,
                    }}
                >
                    <CircularProgress />
                </Box>
            );
        }
        if (error) {
            return (
                <Box sx={{ flexGrow: 1 }}>
                    <Alert severity="error">{error.message}</Alert>
                </Box>
            );
        }

        const statusCfg = statusConfig[equipment?.status || ''] || { label: equipment?.status, color: 'default' as const };

        return equipment ? (
            <Box sx={{ flexGrow: 1, width: '100%' }}>
                <Grid container spacing={2} sx={{ width: '100%' }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Nome</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.nome}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Modelo</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.modelo || 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Número de Série</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.numero_serie || 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Patrimônio</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.patrimonio || 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Local</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.local || 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Status</Typography>
                            <Box sx={{ mb: 1 }}>
                                <Chip label={statusCfg.label} color={statusCfg.color} size="small" />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Responsável</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.usuario?.nome || 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Paper sx={{ px: 2, py: 1 }}>
                            <Typography variant="overline">Cadastrado em</Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                {equipment.created_at ? dayjs(equipment.created_at).format('DD/MM/YYYY') : 'N/A'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap">
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                    >
                        Voltar
                    </Button>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        {equipment.status === 'NO_DEPOSITO' && (
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={<ArrowDownwardIcon />}
                                onClick={() => handleMovement('SAIDA')}
                            >
                                Registrar Saída
                            </Button>
                        )}
                        {equipment.status === 'FORA_DEPOSITO' && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<ArrowUpwardIcon />}
                                onClick={() => handleMovement('ENTRADA')}
                            >
                                Registrar Entrada
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleEquipmentEdit}
                        >
                            Editar
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleEquipmentDelete}
                        >
                            Descartar
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        ) : null;
    }, [
        isLoading,
        error,
        equipment,
        handleBack,
        handleEquipmentEdit,
        handleEquipmentDelete,
        handleMovement,
    ]);

    const pageTitle = `Equipamento ${equipmentId}`;

    return (
        <PageContainer
            title={pageTitle}
            breadcrumbs={[
                { title: 'Equipamentos', path: '/equipments' },
                { title: pageTitle },
            ]}
        >
            <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow}</Box>

            <MovementDialog
                open={movementDialogOpen}
                onClose={handleMovementClose}
                onSuccess={handleMovementSuccess}
                equipment={equipment}
                tipoMovimentacao={tipoMovimentacao}
            />
        </PageContainer>
    );
}
