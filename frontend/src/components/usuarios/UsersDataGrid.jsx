import { DataGrid } from '@mui/x-data-grid';
import { Chip, IconButton, Box, useMediaQuery, useTheme } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useEffect, useState, useMemo } from 'react';

function UsersDataGrid({ users, loading, onEdit, onDelete }) {
    const [key, setKey] = useState(0);
    const theme = useTheme();

    const isMd = useMediaQuery(theme.breakpoints.up('md'));  // >= 900px

    useEffect(() => {
        const handleResize = () => {
            setKey(prev => prev + 1);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const columns = useMemo(() => {
        const baseColumns = [
            { field: 'nome', headerName: 'Nome', width: 150, flex: 1 },
            { field: 'usuario_rede', headerName: 'Usuário', width: 130 },
            {
                field: 'perfil',
                headerName: 'Perfil',
                width: 110,
                renderCell: (params) => (
                    <Chip
                        label={params.value}
                        color={params.value === 'ADMIN' ? 'secondary' : 'default'}
                        size="small"
                    />
                ),
            },
        ];

        if (isMd) {
            baseColumns.push({
                field: 'created_at',
                headerName: 'Criado em',
                width: 130,
                renderCell: (params) => {
                    try {
                        const date = new Date(params.value);
                        return date.toLocaleDateString('pt-BR');
                    } catch {
                        return params.value;
                    }
                },
            });
        }

        if (onEdit && onDelete) {
            baseColumns.push({
                field: 'actions',
                headerName: 'Ações',
                width: 110,
                sortable: false,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params) => (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        height: '100%'
                    }}>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(params.row);
                            }}
                            title="Editar"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(params.row);
                            }}
                            title="Excluir"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            });
        }

        return baseColumns;
    }, [isMd, onEdit, onDelete]);

    return (
        <DataGrid
            key={key}
            rows={users}
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
                noRowsLabel: 'Nenhum usuário cadastrado',
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

export default UsersDataGrid;