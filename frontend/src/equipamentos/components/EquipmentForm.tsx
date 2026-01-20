import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText';
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

interface StandardInputProps {
    label: string;
    value: string | number | undefined | null;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    fullWidth?: boolean;
}

function StandardInput({
    label,
    value,
    onChange,
    name,
    error,
    helperText,
    required,
    fullWidth,
}: StandardInputProps) {
    return (
        <FormControl variant="standard" fullWidth={fullWidth} error={error} required={required}>
            <Input
                id={`input-${name}`}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                placeholder="-"
                inputProps={{
                    'aria-label': label,
                }}
            />
            {/* O helperText do erro, se houver, ou o Label abaixo da linha */}
            {error ? (
                <Stack>
                    <FormHelperText>{label}</FormHelperText>
                    <FormHelperText error>{helperText}</FormHelperText>
                </Stack>
            ) : (
                <FormHelperText>{label}</FormHelperText>
            )}
        </FormControl>
    );
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
        if (onReset) onReset(formValues);
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
                <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <StandardInput
                            value={formValues.nome}
                            onChange={handleTextFieldChange}
                            name="nome"
                            label="Nome"
                            error={!!formErrors.nome}
                            helperText={formErrors.nome}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <StandardInput
                            value={formValues.modelo}
                            onChange={handleTextFieldChange}
                            name="modelo"
                            label="Modelo"
                            error={!!formErrors.modelo}
                            helperText={formErrors.modelo}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <StandardInput
                            value={formValues.numero_serie}
                            onChange={handleTextFieldChange}
                            name="numero_serie"
                            label="Número de Série"
                            error={!!formErrors.numero_serie}
                            helperText={formErrors.numero_serie}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <StandardInput
                            value={formValues.patrimonio}
                            onChange={handleTextFieldChange}
                            name="patrimonio"
                            label="Patrimônio"
                            error={!!formErrors.patrimonio}
                            helperText={formErrors.patrimonio}
                            fullWidth
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 12 }}>
                        <StandardInput
                            value={formValues.local}
                            onChange={handleTextFieldChange}
                            name="local"
                            label="Local"
                            error={!!formErrors.local}
                            helperText={formErrors.local}
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
                    sx={{
                        bgcolor: '#1e293b',
                        '&:hover': { bgcolor: '#334155' },
                        textTransform: 'none',
                        px: 4,
                        py: 1.5,
                        borderRadius: '8px'
                    }}
                >
                    Voltar
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                        textTransform: 'none',
                        px: 6,
                        py: 1.5,
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}
                >
                    {isSubmitting ? 'Cadastrando...' : submitButtonLabel}
                </Button>
            </Stack>
        </Box>
    );
}