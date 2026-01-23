import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { useAuthStore } from '../../store/authStore';
import {
    createOne as createEquipment,
} from '../data/equipments';
import EquipmentForm from './EquipmentForm';
import PageContainer from './PageContainer';
import type { EquipamentoFormData } from '../../types/api';
import { usePageTitle } from '../../contexts/PageTitleContext';

export default function EquipmentCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { user } = useAuthStore();
    const { setMenuTitle } = usePageTitle();

    React.useEffect(() => {
        setMenuTitle('Equipamentos');
    }, [setMenuTitle]);

    const handleFormSubmit = React.useCallback(async (data: EquipamentoFormData) => {
        try {
            const dataToSubmit = {
                ...data,
                usuario_id: user?.id,
            } as EquipamentoFormData;

            await createEquipment(dataToSubmit);
            notifications.show('Equipamento cadastrado com sucesso.', {
                severity: 'success',
                autoHideDuration: 3000,
            });

            navigate({ to: '/equipments' });
        } catch (createError) {
            const error = createError as any;
            const errorMessage = error.response?.data?.details?.[0]?.message
                || error.response?.data?.error
                || error.message;

            notifications.show(
                `Falha ao cadastrar equipamento. Motivo: ${errorMessage}`,
                {
                    severity: 'error',
                    autoHideDuration: 3000,
                },
            );
            throw createError;
        }
    }, [navigate, notifications, user]);

    return (
        <PageContainer
            title="Cadastrar Equipamento"
        >
            <EquipmentForm
                onSubmit={handleFormSubmit}
                submitButtonLabel="Cadastrar"
            />
        </PageContainer>
    );
}
