import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import useNotifications from '../hooks/useNotifications/useNotifications';
import { useAuthStore } from '../../store/authStore';
import {
    createOne as createEquipment,
    validate as validateEquipment,
} from '../data/equipments';
import EquipmentForm, {
    type FormFieldValue,
    type EquipmentFormState,
} from './EquipmentForm';
import PageContainer from './PageContainer';
import type { EquipamentoFormData } from '../../types/api';
import { usePageTitle } from '../../contexts/PageTitleContext';

const INITIAL_FORM_VALUES: Partial<EquipamentoFormData> = {
    nome: '',
    modelo: '',
    numero_serie: '',
    patrimonio: '',
    local: '',
};

export default function EquipmentCreate() {
    const navigate = useNavigate();
    const notifications = useNotifications();
    const { user } = useAuthStore();
    const { setMenuTitle } = usePageTitle();

    const [formState, setFormState] = React.useState<EquipmentFormState>(() => ({
        values: INITIAL_FORM_VALUES,
        errors: {},
    }));
    const formValues = formState.values;
    const formErrors = formState.errors;

    React.useEffect(() => {
        setMenuTitle('Equipamentos');
    }, [setMenuTitle]);

    const setFormValues = React.useCallback(
        (newFormValues: Partial<EquipmentFormState['values']>) => {
            setFormState((previousState) => ({
                ...previousState,
                values: newFormValues,
            }));
        },
        [],
    );

    const setFormErrors = React.useCallback(
        (newFormErrors: Partial<EquipmentFormState['errors']>) => {
            setFormState((previousState) => ({
                ...previousState,
                errors: newFormErrors,
            }));
        },
        [],
    );

    const handleFormFieldChange = React.useCallback(
        (name: keyof EquipmentFormState['values'], value: FormFieldValue) => {
            const validateField = async (values: Partial<EquipmentFormState['values']>) => {
                const { issues } = validateEquipment(values as Partial<EquipamentoFormData>);
                setFormErrors({
                    ...formErrors,
                    [name]: issues?.find((issue) => issue.path?.[0] === name)?.message,
                });
            };

            const newFormValues = { ...formValues, [name]: value };

            setFormValues(newFormValues);
            validateField(newFormValues);
        },
        [formValues, formErrors, setFormErrors, setFormValues],
    );

    const handleFormReset = React.useCallback(() => {
        setFormValues(INITIAL_FORM_VALUES);
    }, [setFormValues]);

    const handleFormSubmit = React.useCallback(async () => {
        const { issues } = validateEquipment(formValues as Partial<EquipamentoFormData>);
        if (issues && issues.length > 0) {
            setFormErrors(
                Object.fromEntries(issues.map((issue) => [issue.path?.[0], issue.message])),
            );
            return;
        }
        setFormErrors({});

        try {
            // Add usuario_id from authenticated user
            const dataToSubmit = {
                ...formValues,
                usuario_id: user?.id,
            } as EquipamentoFormData;

            await createEquipment(dataToSubmit);
            notifications.show('Equipamento cadastrado com sucesso.', {
                severity: 'success',
                autoHideDuration: 3000,
            });

            navigate({ to: '/equipments' });
        } catch (createError) {
            notifications.show(
                `Falha ao cadastrar equipamento. Motivo: ${(createError as Error).message}`,
                {
                    severity: 'error',
                    autoHideDuration: 3000,
                },
            );
            throw createError;
        }
    }, [formValues, navigate, notifications, setFormErrors, user]);

    return (
        <PageContainer
            title="Novo Equipamento"
        >
            <EquipmentForm
                formState={formState}
                onFieldChange={handleFormFieldChange}
                onSubmit={handleFormSubmit}
                onReset={handleFormReset}
                submitButtonLabel="Cadastrar"
            />
        </PageContainer>
    );
}
