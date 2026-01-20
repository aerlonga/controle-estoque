import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { usuarioService } from '../../services/api';
import type { Usuario } from '../../types/api';

export interface FilterState {
    nome: string;
    modelo: string;
    numero_serie: string;
    patrimonio: string;
    local: string;
    status: string;
    usuario_id: string;
    created_at: Dayjs | null;
}

export const initialFilterState: FilterState = {
    nome: '',
    modelo: '',
    numero_serie: '',
    patrimonio: '',
    local: '',
    status: '',
    usuario_id: '',
    created_at: null,
};

interface EquipmentFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onSearch: () => void;
    onClear: () => void;
}

const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'NO_DEPOSITO', label: 'No Depósito' },
    { value: 'FORA_DEPOSITO', label: 'Fora do Depósito' },
];

const textFieldStyle = {
    '& .MuiInputLabel-root': {
        fontSize: '0.95rem',
        color: '#94a3b8',
        transform: 'translate(14px, 12px) scale(1)',
        transition: 'all 0.2s ease-out',
    },
    '& .MuiInputLabel-shrink': {
        fontSize: '0.85rem',
        transform: 'translate(14px, -9px) scale(0.85)',
        backgroundColor: '#020617',
        padding: '0 8px',
        borderRadius: '10px',
        zIndex: 1,
        color: '#3b82f6',
    },
    '& .MuiOutlinedInput-root': {
        height: '48px',
        fontSize: '0.95rem',
        backgroundColor: 'transparent',
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.4)',
        },
        '&.Mui-focused fieldset': {
            borderWidth: '2px',
        },
        '& input': {
            padding: '10px 14px',
            color: '#f8fafc',
        },
    },
};

const selectStyle = {
    height: '48px',
    fontSize: '0.95rem',
    backgroundColor: 'transparent',
    '& fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&:hover fieldset': {
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    '&.Mui-focused fieldset': {
        borderWidth: '2px',
    },
    '& .MuiSelect-select': {
        padding: '10px 14px',
        color: '#f8fafc',
    },
};



export default function EquipmentFilter({
    filters,
    onFilterChange,
    onSearch,
    onClear,
}: EquipmentFilterProps) {
    const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);

    React.useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await usuarioService.listar();
                setUsuarios(response.data || []);
            } catch (error) {
                console.error('Erro ao carregar usuários:', error);
            }
        };
        fetchUsuarios();
    }, []);

    const handleInputChange = (field: keyof FilterState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        onFilterChange({ ...filters, [field]: event.target.value });
    };

    const handleStatusChange = (event: any) => {
        onFilterChange({ ...filters, status: event.target.value });
    };

    const handleDateChange = (newValue: unknown) => {
        onFilterChange({ ...filters, created_at: newValue as Dayjs | null });
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            onSearch();
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Nome"
                            value={filters.nome}
                            onChange={handleInputChange('nome')}
                            onKeyPress={handleKeyPress}
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Modelo"
                            value={filters.modelo}
                            onChange={handleInputChange('modelo')}
                            onKeyPress={handleKeyPress}
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Nº Série"
                            value={filters.numero_serie}
                            onChange={handleInputChange('numero_serie')}
                            onKeyPress={handleKeyPress}
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Patrimônio"
                            value={filters.patrimonio}
                            onChange={handleInputChange('patrimonio')}
                            onKeyPress={handleKeyPress}
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Local"
                            value={filters.local}
                            onChange={handleInputChange('local')}
                            onKeyPress={handleKeyPress}
                            sx={textFieldStyle}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel
                                sx={{
                                    fontSize: '0.95rem',
                                    color: '#94a3b8',
                                    transform: 'translate(14px, 12px) scale(1)',
                                    transition: 'all 0.2s ease-out',
                                    '&.Mui-focused': {
                                        color: '#3b82f6',
                                    },
                                    '&.MuiInputLabel-shrink': {
                                        fontSize: '0.85rem',
                                        transform: 'translate(14px, -9px) scale(0.85)',
                                        backgroundColor: '#020617',
                                        padding: '0 8px',
                                        borderRadius: '10px',
                                    },
                                }}
                            >
                                Status
                            </InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={handleStatusChange}
                                sx={selectStyle}
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel
                                sx={{
                                    fontSize: '0.95rem',
                                    color: '#94a3b8',
                                    transform: 'translate(14px, 12px) scale(1)',
                                    transition: 'all 0.2s ease-out',
                                    '&.Mui-focused': {
                                        color: '#3b82f6',
                                    },
                                    '&.MuiInputLabel-shrink': {
                                        fontSize: '0.85rem',
                                        transform: 'translate(14px, -9px) scale(0.85)',
                                        backgroundColor: '#020617',
                                        padding: '0 8px',
                                        borderRadius: '10px',
                                    },
                                }}
                            >
                                Responsável
                            </InputLabel>
                            <Select
                                value={filters.usuario_id}
                                label="Responsável"
                                onChange={(event) => onFilterChange({ ...filters, usuario_id: event.target.value as string })}
                                sx={selectStyle}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {usuarios.map((usuario) => (
                                    <MenuItem key={usuario.id} value={usuario.id?.toString() || ''}>
                                        {usuario.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel
                                shrink={filters.created_at !== null}
                                sx={{
                                    fontSize: '0.95rem',
                                    color: '#94a3b8',
                                    transform: 'translate(14px, 12px) scale(1)',
                                    transition: 'all 0.2s ease-out',
                                    '&.Mui-focused': {
                                        color: '#3b82f6',
                                    },
                                    '&.MuiInputLabel-shrink': {
                                        fontSize: '0.85rem',
                                        transform: 'translate(14px, -9px) scale(0.85)',
                                        backgroundColor: '#020617',
                                        padding: '0 8px',
                                        borderRadius: '10px',
                                        zIndex: 1,
                                    },
                                }}
                            >
                                Cadastro
                            </InputLabel>
                            <DatePicker
                                value={filters.created_at}
                                onChange={handleDateChange}
                                format="DD/MM/YYYY"
                                slots={{
                                    openPickerIcon: CalendarTodayIcon,
                                }}
                                slotProps={{
                                    field: {
                                        clearable: true,
                                        onClear: () => handleDateChange(null)
                                    },
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined',
                                        sx: {
                                            '& .MuiInputBase-root': {
                                                height: '48px',
                                                color: '#f8fafc',
                                                backgroundColor: 'transparent',
                                                '& fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.4)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderWidth: '2px',
                                                    borderColor: '#1976d2',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                padding: '10px 14px',
                                                height: 'auto',
                                            },
                                        }
                                    },
                                    openPickerButton: {
                                        disableRipple: true,
                                        sx: {
                                            color: '#94a3b8',
                                            marginRight: '4px',
                                            '&:hover': {
                                                backgroundColor: 'transparent',
                                            },
                                        },
                                    },
                                }}
                            />
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, md: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SearchIcon />}
                                onClick={onSearch}
                                sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    height: '40px',
                                }}
                            >
                                Buscar
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={onClear}
                                sx={{
                                    flex: 1,
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    height: '40px',
                                }}
                            >
                                Limpar
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </LocalizationProvider>
    );
}
