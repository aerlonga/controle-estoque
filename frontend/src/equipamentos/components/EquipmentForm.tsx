import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from '@tanstack/react-router';
import type { EquipamentoFormData } from '../../types/api';

export interface EquipmentFormState {
    values: Partial<EquipamentoFormData>;
    errors: Partial<Record<keyof EquipamentoFormData, string>>;
}

export type FormFieldValue = string | number | null;

export interface EquipmentFormProps {
    formState: EquipmentFormState;
    onFieldChange: (
        name: keyof EquipmentFormState['values'],
        value: FormFieldValue,
    ) => void;
    onSubmit: (formValues: Partial<EquipmentFormState['values']>) => Promise<void>;
    onReset?: (formValues: Partial<EquipmentFormState['values']>) => void;
    submitButtonLabel: string;
    backButtonPath?: string;
}

export default function EquipmentForm(props: EquipmentFormProps) {
    const {
        formState,
        onFieldChange,
        onSubmit,
        onReset,
        submitButtonLabel,
        backButtonPath,
    } = props;

    const formValues = formState.values;
    const formErrors = formState.errors;

    const navigate = useNavigate();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = React.useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            setIsSubmitting(true);
            try {
                await onSubmit(formValues);
            } finally {
                setIsSubmitting(false);
            }
        },
        [formValues, onSubmit],
    );

    const handleTextFieldChange = React.useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onFieldChange(
                event.target.name as keyof EquipmentFormState['values'],
                event.target.value,
            );
        },
        [onFieldChange],
    );

    const handleReset = React.useCallback(() => {
        if (onReset) {
            onReset(formValues);
        }
    }, [formValues, onReset]);

    const handleBack = React.useCallback(() => {
        navigate({ to: backButtonPath ?? '/equipments' });
    }, [navigate, backButtonPath]);

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            autoComplete="off"
            onReset={handleReset}
            sx={{ width: '100%' }}
        >
            <FormGroup>
                <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <TextField
                            value={formValues.nome ?? ''}
                            onChange={handleTextFieldChange}
                            name="nome"
                            label="Nome"
                            error={!!formErrors.nome}
                            helperText={formErrors.nome ?? ' '}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <TextField
                            value={formValues.modelo ?? ''}
                            onChange={handleTextFieldChange}
                            name="modelo"
                            label="Modelo"
                            error={!!formErrors.modelo}
                            helperText={formErrors.modelo ?? ' '}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <TextField
                            value={formValues.numero_serie ?? ''}
                            onChange={handleTextFieldChange}
                            name="numero_serie"
                            label="Número de Série"
                            error={!!formErrors.numero_serie}
                            helperText={formErrors.numero_serie ?? ' '}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <TextField
                            value={formValues.patrimonio ?? ''}
                            onChange={handleTextFieldChange}
                            name="patrimonio"
                            label="Patrimônio"
                            error={!!formErrors.patrimonio}
                            helperText={formErrors.patrimonio ?? ' '}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex' }}>
                        <TextField
                            value={formValues.local ?? ''}
                            onChange={handleTextFieldChange}
                            name="local"
                            label="Local"
                            error={!!formErrors.local}
                            helperText={formErrors.local ?? ' '}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </FormGroup>
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <Button
                    variant="contained"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                >
                    Voltar
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={isSubmitting}
                >
                    {submitButtonLabel}
                </Button>
            </Stack>
        </Box>
    );
}
