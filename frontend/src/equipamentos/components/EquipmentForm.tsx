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
import { useForm, Controller } from 'react-hook-form';
import type { EquipamentoFormData } from '../../types/api';
import { validate as validateEquipment } from '../data/equipments';

export interface EquipmentFormProps {
    defaultValues?: Partial<EquipamentoFormData>;
    onSubmit: (data: EquipamentoFormData) => Promise<void>;
    submitButtonLabel: string;
    backButtonPath?: string;
}

interface StandardInputProps {
    label: string;
    value: string | number | undefined | null;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
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
    onBlur,
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
                onBlur={onBlur}
                placeholder="-"
                inputProps={{
                    'aria-label': label,
                }}
            />
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
        defaultValues,
        onSubmit,
        submitButtonLabel,
        backButtonPath,
    } = props;

    const navigate = useNavigate();

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<EquipamentoFormData>({
        defaultValues: {
            nome: '',
            modelo: '',
            numero_serie: '',
            patrimonio: '',
            local: '',
            ...defaultValues,
        },
        resolver: async (values) => {
            const { issues } = validateEquipment(values);
            if (issues && issues.length > 0) {
                return {
                    values: {},
                    errors: issues.reduce((acc, issue) => ({
                        ...acc,
                        [issue.path![0]]: {
                            type: 'manual',
                            message: issue.message,
                        },
                    }), {}),
                };
            }
            return { values, errors: {} };
        },
    });

    const handleBack = React.useCallback(() => {
        navigate({ to: backButtonPath ?? '/equipments' });
    }, [navigate, backButtonPath]);

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            autoComplete="off"
            sx={{ width: '100%' }}
        >
            <FormGroup>
                <Grid container spacing={3} sx={{ mb: 4, width: '100%' }}>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <Controller
                            name="nome"
                            control={control}
                            render={({ field }) => (
                                <StandardInput
                                    {...field}
                                    label="Nome"
                                    error={!!errors.nome}
                                    helperText={errors.nome?.message}
                                    required
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <Controller
                            name="modelo"
                            control={control}
                            render={({ field }) => (
                                <StandardInput
                                    {...field}
                                    label="Modelo"
                                    error={!!errors.modelo}
                                    helperText={errors.modelo?.message}
                                    required
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <Controller
                            name="numero_serie"
                            control={control}
                            render={({ field }) => (
                                <StandardInput
                                    {...field}
                                    label="Número de Série"
                                    error={!!errors.numero_serie}
                                    helperText={errors.numero_serie?.message}
                                    required
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 6 }}>
                        <Controller
                            name="patrimonio"
                            control={control}
                            render={({ field }) => (
                                <StandardInput
                                    {...field}
                                    label="Patrimônio"
                                    error={!!errors.patrimonio}
                                    helperText={errors.patrimonio?.message}
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                    <Grid component="div" size={{ xs: 12, sm: 12 }}>
                        <Controller
                            name="local"
                            control={control}
                            render={({ field }) => (
                                <StandardInput
                                    {...field}
                                    label="Local"
                                    error={!!errors.local}
                                    helperText={errors.local?.message}
                                    fullWidth
                                />
                            )}
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
                    {isSubmitting ? 'Salvando...' : submitButtonLabel}
                </Button>
            </Stack>
        </Box>
    );
}