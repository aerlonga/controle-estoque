import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
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

const textFieldStyle = {
    '& .MuiInputLabel-root': {
        fontSize: '1.1rem',
        color: '#94a3b8', // Cor suave para o estado parado
        transform: 'translate(14px, 16px) scale(1)',
        transition: 'all 0.2s ease-out',
    },
    '& .MuiInputLabel-shrink': {
        // EFEITO DE CÁPSULA:
        fontSize: '1rem',
        transform: 'translate(14px, -10px) scale(0.85)', // Sobe exatamente em cima da borda
        backgroundColor: '#020617', // DEVE SER A MESMA COR DO FUNDO DO SEU FORM
        padding: '0 8px',            // Espaço nas laterais para "quebrar" a borda
        borderRadius: '10px',        // Arredonda o fundo do label
        zIndex: 1,                   // Garante que fique acima da linha da borda
        color: '#3b82f6',            // Cor de destaque ao subir (azul)
    },
    '& .MuiOutlinedInput-root': {
        height: '56px',
        fontSize: '1.1rem',
        backgroundColor: 'transparent',
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)', // Borda discreta
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
        },
        '& input': {
            padding: '12px 14px', 
            color: '#f8fafc',
        },
    },
};

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
                        <TextField
                            value={formValues.nome ?? ''}
                            onChange={handleTextFieldChange}
                            name="nome"
                            label="Nome"
                            error={!!formErrors.nome}
                            helperText={formErrors.nome ?? ' '}
                            fullWidth
                            required
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <TextField
                            value={formValues.modelo ?? ''}
                            onChange={handleTextFieldChange}
                            name="modelo"
                            label="Modelo"
                            error={!!formErrors.modelo}
                            helperText={formErrors.modelo ?? ' '}
                            fullWidth
                            required
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <TextField
                            value={formValues.numero_serie ?? ''}
                            onChange={handleTextFieldChange}
                            name="numero_serie"
                            label="Número de Série"
                            error={!!formErrors.numero_serie}
                            helperText={formErrors.numero_serie ?? ' '}
                            fullWidth
                            required
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <TextField
                            value={formValues.patrimonio ?? ''}
                            onChange={handleTextFieldChange}
                            name="patrimonio"
                            label="Patrimônio"
                            error={!!formErrors.patrimonio}
                            helperText={formErrors.patrimonio ?? ' '}
                            fullWidth
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 12 }}>
                        <TextField
                            value={formValues.local ?? ''}
                            onChange={handleTextFieldChange}
                            name="local"
                            label="Local"
                            error={!!formErrors.local}
                            helperText={formErrors.local ?? ' '}
                            fullWidth
                            sx={textFieldStyle}
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