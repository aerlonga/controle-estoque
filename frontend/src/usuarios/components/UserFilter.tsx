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

export interface FilterState {
    nome: string;
    usuario_rede: string;
    perfil: string;
}

export const initialFilterState: FilterState = {
    nome: '',
    usuario_rede: '',
    perfil: '',
};

interface UserFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClear: () => void;
}

const perfilOptions = [
    { value: '', label: 'Todos' },
    { value: 'USUARIO', label: 'Usuário' },
    { value: 'ADMIN', label: 'Administrador' },
];

export default function UserFilter({
    filters,
    onFilterChange,
    onClear,
}: UserFilterProps) {
    const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

    React.useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleInputChange = (field: keyof FilterState) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setLocalFilters({ ...localFilters, [field]: event.target.value });
    };

    const handlePerfilChange = (event: any) => {
        setLocalFilters({ ...localFilters, perfil: event.target.value });
    };

    const handleSearch = () => {
        onFilterChange(localFilters);
    };

    const handleClear = () => {
        onClear();
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
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
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl variant="standard" fullWidth>
                        <Input
                            id="filter-nome"
                            value={localFilters.nome}
                            onChange={handleInputChange('nome')}
                            onKeyPress={handleKeyPress}
                            inputProps={{
                                'aria-label': 'Nome',
                            }}
                        />
                        <FormHelperText>Nome</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl variant="standard" fullWidth>
                        <Input
                            id="filter-usuario-rede"
                            value={localFilters.usuario_rede}
                            onChange={handleInputChange('usuario_rede')}
                            onKeyPress={handleKeyPress}
                            inputProps={{
                                'aria-label': 'Usuário',
                            }}
                        />
                        <FormHelperText>Usuário</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <FormControl variant="standard" fullWidth>
                        <TextField
                            id="filter-perfil"
                            select
                            value={localFilters.perfil}
                            onChange={handlePerfilChange}
                            variant="standard"
                            fullWidth
                        >
                            {perfilOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <FormHelperText>Perfil</FormHelperText>
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<SearchIcon />}
                            onClick={handleSearch}
                            sx={{
                                minWidth: '120px',
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
                            onClick={handleClear}
                            sx={{
                                minWidth: '120px',
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
    );
}
