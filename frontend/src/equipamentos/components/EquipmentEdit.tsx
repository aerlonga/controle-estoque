import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from '@tanstack/react-router';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
    getOne as getEquipment,
    updateOne as updateEquipment,
    type Equipment,
} from '../data/equipments';
import EquipmentForm from './EquipmentForm';
import PageContainer from './PageContainer';
import type { EquipamentoFormData } from '../../types/api';
import { usePageTitle } from '../../contexts/PageTitleContext';

export default function EquipmentEdit() {
    const params = useParams({ strict: false });
    const equipmentId = (params as { id?: string }).id || '';
    const { setMenuTitle, setDetailTitle } = usePageTitle();
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [equipment, setEquipment] = React.useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);



    React.useEffect(() => {
        setMenuTitle('Equipamentos');
    }, [setMenuTitle]);

    React.useEffect(() => {
        setDetailTitle('Editar');
    }, [setDetailTitle]);

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

    const handleSubmit = React.useCallback(
        async (formValues: EquipamentoFormData) => {
            try {
                await updateEquipment(Number(equipmentId), formValues);
                notifications.show('Equipamento atualizado com sucesso.', {
                    severity: 'success',
                    autoHideDuration: 3000,
                });
                navigate({ to: '/equipments' });
            } catch (editError) {
                const error = editError as any;
                const errorMessage = error.response?.data?.details?.[0]?.message
                    || error.response?.data?.error
                    || error.message;

                notifications.show(
                    `Falha ao atualizar equipamento. Motivo: ${errorMessage}`,
                    {
                        severity: 'error',
                        autoHideDuration: 3000,
                    },
                );
            }
        },
        [equipmentId, navigate, notifications],
    );

    const sanitizeEquipmentForForm = React.useCallback(
        (e: Equipment | null) =>
            e
                ? (Object.fromEntries(
                    Object.entries(e).map(([k, v]) => [k, v === null ? undefined : v]),
                ) as Partial<EquipamentoFormData>)
                : {},
        [],
    );

    const renderEdit = React.useMemo(() => {
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

        return equipment ? (
            <EquipmentForm
                defaultValues={sanitizeEquipmentForForm(equipment)}
                onSubmit={handleSubmit}
                submitButtonLabel="Salvar"
                backButtonPath="/equipments"
            />
        ) : null;
    }, [isLoading, error, equipment, handleSubmit]);

    return (
        <PageContainer
            title="Editar equipamento"
        >
            <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
        </PageContainer>
    );
}
