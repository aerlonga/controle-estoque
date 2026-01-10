import { DataGrid } from '@mui/x-data-grid';
import { Chip, IconButton, Box, useMediaQuery, useTheme, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, ArrowUpward as EntradaIcon, ArrowDownward as SaidaIcon } from '@mui/icons-material';
import { useEffect, useState, useMemo } from 'react';

const statusConfig = {
    NO_DEPOSITO: { label: 'No Depósito', color: 'success' },
    FORA_DEPOSITO: { label: 'Fora do Depósito', color: 'warning' },
    DESCARTADO: { label: 'Descartado', color: 'error' },
};

function EquipmentsDataGrid({ equipments, loading, onEdit, onDelete, onMovement }) {
    const [key, setKey] = useState(0);
    const theme = useTheme();

    const isXl = useMediaQuery(theme.breakpoints.up('xl'));  // >= 1536px
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));  // >= 1200px
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
            { field: 'nome', headerName: 'Nome', minWidth: 120, flex: 1 },
            { field: 'modelo', headerName: 'Modelo', minWidth: 100, flex: 1 },
            { field: 'numero_serie', headerName: 'Nº Série', minWidth: 120, flex: 1 },
        ];

        if (isLg) {
            baseColumns.push({ field: 'patrimonio', headerName: 'Patrimônio', minWidth: 100, flex: 1 });
        }
        if (isXl) {
            baseColumns.push({ field: 'local', headerName: 'Local', minWidth: 80, flex: 1 });
        }

        baseColumns.push({
            field: 'status',
            headerName: 'Status',
            width: 160,
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
        });

        if (isMd) {
            baseColumns.push({
                field: 'responsavel',
                headerName: 'Responsável',
                minWidth: 120,
                flex: 1,
                renderCell: (params) => {
                    return params.row?.usuario?.nome || 'N/A';
                },
            });
        }

        if (isLg) {
            baseColumns.push({
                field: 'created_at',
                headerName: 'Cadastrado em',
                width: 120,
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

        baseColumns.push({
            field: 'actions',
            headerName: 'Ações',
            width: 140,
            sortable: false,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const isNoDeposito = params.row.status === 'NO_DEPOSITO';
                const isForaDeposito = params.row.status === 'FORA_DEPOSITO';

                return (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.3,
                        height: '100%'
                    }}>
                        <Tooltip title="Editar">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(params.row);
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {isNoDeposito && (
                            <Tooltip title="Registrar Saída">
                                <IconButton
                                    size="small"
                                    color="warning"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMovement(params.row, 'SAIDA');
                                    }}
                                >
                                    <SaidaIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}

                        {isForaDeposito && (
                            <Tooltip title="Registrar Entrada">
                                <IconButton
                                    size="small"
                                    color="success"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMovement(params.row, 'ENTRADA');
                                    }}
                                >
                                    <EntradaIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title="Excluir">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(params.row);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                );
            },
        });

        return baseColumns;
    }, [isXl, isLg, isMd, onEdit, onDelete]);

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
