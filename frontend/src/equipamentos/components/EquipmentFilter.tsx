import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Input from '@mui/material/Input';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { usuarioService } from '../../services/api';
import type { Usuario } from '../../types/api';
import DatePickerField from './DatePickerField';

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
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <Input
                                id="filter-nome"
                                value={filters.nome}
                                onChange={handleInputChange('nome')}
                                onKeyPress={handleKeyPress}
                                inputProps={{
                                    'aria-label': 'Nome',
                                }}
                            />
                            <FormHelperText>Nome</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <Input
                                id="filter-modelo"
                                value={filters.modelo}
                                onChange={handleInputChange('modelo')}
                                onKeyPress={handleKeyPress}
                                inputProps={{
                                    'aria-label': 'Modelo',
                                }}
                            />
                            <FormHelperText>Modelo</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <Input
                                id="filter-numero-serie"
                                value={filters.numero_serie}
                                onChange={handleInputChange('numero_serie')}
                                onKeyPress={handleKeyPress}
                                inputProps={{
                                    'aria-label': 'Nº Série',
                                }}
                            />
                            <FormHelperText>Nº Série</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <Input
                                id="filter-patrimonio"
                                value={filters.patrimonio}
                                onChange={handleInputChange('patrimonio')}
                                onKeyPress={handleKeyPress}
                                inputProps={{
                                    'aria-label': 'Patrimônio',
                                }}
                            />
                            <FormHelperText>Patrimônio</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <Input
                                id="filter-local"
                                value={filters.local}
                                onChange={handleInputChange('local')}
                                onKeyPress={handleKeyPress}
                                inputProps={{
                                    'aria-label': 'Local',
                                }}
                            />
                            <FormHelperText>Local</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <TextField
                                id="filter-status"
                                select
                                value={filters.status}
                                onChange={handleStatusChange}
                                variant="standard"
                                fullWidth
                            >
                                {statusOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <FormHelperText>Status</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl variant="standard" fullWidth>
                            <TextField
                                id="filter-responsavel"
                                select
                                value={filters.usuario_id}
                                onChange={(event) => onFilterChange({ ...filters, usuario_id: event.target.value as string })}
                                variant="standard"
                                fullWidth
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {usuarios.map((usuario) => (
                                    <MenuItem key={usuario.id} value={usuario.id?.toString() || ''}>
                                        {usuario.nome}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <FormHelperText>Responsável</FormHelperText>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <DatePickerField
                            label="Cadastro"
                            value={filters.created_at}
                            onChange={handleDateChange}
                            fullWidth
                        />
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
