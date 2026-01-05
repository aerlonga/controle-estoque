import { DataGrid } from '@mui/x-data-grid';
import { Chip, IconButton, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';

const statusConfig = {
    NO_DEPOSITO: { label: 'No Depósito', color: 'success' },
    FORA_DEPOSITO: { label: 'Fora do Depósito', color: 'warning' },
    DESCARTADO: { label: 'Descartado', color: 'error' },
};

function EquipmentsDataGrid({ equipments, loading, onEdit, onDelete }) {
    const [key, setKey] = useState(0);

    useEffect(() => {
        const handleResize = () => {
            setKey(prev => prev + 1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = [
        { field: 'nome', headerName: 'Nome', width: 200, flex: 1 },
        { field: 'modelo', headerName: 'Modelo', width: 150 },
        { field: 'numero_serie', headerName: 'Nº Série', width: 150 },
        { field: 'patrimonio', headerName: 'Patrimônio', width: 130 },
        { field: 'local', headerName: 'Local', width: 130 },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                const config = statusConfig[params.value] || { label: params.value, color: 'default' };
                return (
                    <Chip
                        label={config.label}
                        color={config.color}
                        size="small"
                    />
                );
            },
        },
        {
            field: 'responsavel',
            headerName: 'Responsável',
            width: 180,
            renderCell: (params) => {
                return params.row?.usuario?.nome || 'N/A';
            },
        },
        {
            field: 'created_at',
            headerName: 'Cadastrado em',
            width: 150,
            renderCell: (params) => {
                try {
                    const date = new Date(params.value);
                    return date.toLocaleDateString('pt-BR');
                } catch {
                    return params.value;
                }
            },
        },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                        size="large"
                        color="primary"
                        onClick={() => onEdit(params.row)}
                        title="Editar"
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="large"
                        color="error"
                        onClick={() => onDelete(params.row)}
                        title="Excluir"
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <DataGrid
            key={key}
            rows={equipments}
            columns={columns}
            loading={loading}
            autoHeight
            initialState={{
                pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            disableColumnResize
            localeText={{
                noRowsLabel: 'Nenhum equipamento cadastrado',
            }}
            sx={{
                width: '100%',
                '& .MuiDataGrid-cell:hover': {
                    cursor: 'pointer',
                },
            }}
        />
    );
}

export default EquipmentsDataGrid;
