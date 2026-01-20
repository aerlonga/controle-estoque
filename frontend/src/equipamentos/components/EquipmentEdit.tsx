import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, useParams } from '@tanstack/react-router';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
    getOne as getEquipment,
    updateOne as updateEquipment,
    validate as validateEquipment,
    type Equipment,
} from '../data/equipments';
import EquipmentForm, {
    type FormFieldValue,
    type EquipmentFormState,
} from './EquipmentForm';
import PageContainer from './PageContainer';
import type { EquipamentoFormData } from '../../types/api';
import { usePageTitle } from '../../contexts/PageTitleContext';

function EquipmentEditForm({
    initialValues,
    onSubmit,
    equipmentId,
}: {
    // Aceitar tanto o tipo de formulário quanto o tipo retornado pela API
    initialValues: Partial<EquipmentFormState['values']> | Partial<EquipamentoFormData>;
    onSubmit: (formValues: Partial<EquipmentFormState['values']>) => Promise<void>;
    equipmentId: string;
}) {
    const navigate = useNavigate();
    const notifications = useNotifications();

    const [formState, setFormState] = React.useState<EquipmentFormState>(() => ({
        values: initialValues,
        errors: {},
    }));
    const formValues = formState.values;
    const formErrors = formState.errors;

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
        setFormValues(initialValues);
    }, [initialValues, setFormValues]);

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
            await onSubmit(formValues);
            notifications.show('Equipamento atualizado com sucesso.', {
                severity: 'success',
                autoHideDuration: 3000,
            });

            navigate({ to: '/equipments' });
        } catch (editError) {
            notifications.show(
                `Falha ao atualizar equipamento. Motivo: ${(editError as Error).message}`,
                {
                    severity: 'error',
                    autoHideDuration: 3000,
                },
            );
            throw editError;
        }
    }, [formValues, navigate, notifications, onSubmit, setFormErrors]);

    return (
        <EquipmentForm
            formState={formState}
            onFieldChange={handleFormFieldChange}
            onSubmit={handleFormSubmit}
            onReset={handleFormReset}
            submitButtonLabel="Salvar"
            backButtonPath="/equipments"
        />
    );
}

export default function EquipmentEdit() {
    const params = useParams({ strict: false });
    const equipmentId = (params as { id?: string }).id || '';
    const { setMenuTitle, setDetailTitle } = usePageTitle();

    const [equipment, setEquipment] = React.useState<Equipment | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    const equipmentName = equipment?.nome ?? '';

    React.useEffect(() => {
        setMenuTitle('Equipamentos');
    }, [setMenuTitle]);

    React.useEffect(() => {
        if (equipmentName) {
            setDetailTitle(equipmentName);
        }
    }, [equipmentName, setDetailTitle]);

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
        async (formValues: Partial<EquipmentFormState['values']>) => {
            const updatedData = await updateEquipment(Number(equipmentId), formValues as Partial<EquipamentoFormData>);
            setEquipment(updatedData);
        },
        [equipmentId],
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
            <EquipmentEditForm
                initialValues={sanitizeEquipmentForForm(equipment)}
                onSubmit={handleSubmit}
                equipmentId={equipmentId}
            />
        ) : null;
    }, [isLoading, error, equipment, handleSubmit, equipmentId]);

    return (
        <PageContainer
            title={`Editar ${equipmentName || `Equipamento ${equipmentId}`}`}
        >
            <Box sx={{ display: 'flex', flex: 1 }}>{renderEdit}</Box>
        </PageContainer>
    );
}
