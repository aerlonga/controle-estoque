import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridFilterModel,
    GridPaginationModel,
    GridSortModel,
    GridEventListener,
    gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from '@tanstack/react-router';
import { useDialogs } from '../hooks/useDialogs/useDialogs';
import useNotifications from '../hooks/useNotifications/useNotifications';
import {
    deleteOne as deleteEquipment,
    getMany as getEquipments,
    type Equipment,
} from '../data/equipments';
import PageContainer from './PageContainer';
import MovementDialog from './MovementDialog';
import { usePageTitle } from '../../contexts/PageTitleContext';

const INITIAL_PAGE_SIZE = 10;

const statusConfig: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
    NO_DEPOSITO: { label: 'No Depósito', color: 'success' },
    FORA_DEPOSITO: { label: 'Fora do Depósito', color: 'warning' },
    DESCARTADO: { label: 'Descartado', color: 'error' },
};

export default function EquipmentList() {
    const navigate = useNavigate();

    const dialogs = useDialogs();
    const notifications = useNotifications();
    const { setMenuTitle } = usePageTitle();

    const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
        page: 0,
        pageSize: INITIAL_PAGE_SIZE,
    });
    const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
    const [sortModel, setSortModel] = React.useState<GridSortModel>([]);

    const [rowsState, setRowsState] = React.useState<{
        rows: Equipment[];
        rowCount: number;
    }>({
        rows: [],
        rowCount: 0,
    });

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    const [movementDialogOpen, setMovementDialogOpen] = React.useState(false);
    const [selectedEquipment, setSelectedEquipment] = React.useState<Equipment | null>(null);
    const [tipoMovimentacao, setTipoMovimentacao] = React.useState<'ENTRADA' | 'SAIDA' | null>(null);

    React.useEffect(() => {
        setMenuTitle('Equipamentos');
    }, [setMenuTitle]);

    const handlePaginationModelChange = React.useCallback(
        (model: GridPaginationModel) => {
            setPaginationModel(model);
        },
        [],
    );

    const handleFilterModelChange = React.useCallback(
        (model: GridFilterModel) => {
            setFilterModel(model);
        },
        [],
    );

    const handleSortModelChange = React.useCallback(
        (model: GridSortModel) => {
            setSortModel(model);
        },
        [],
    );

    const loadData = React.useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            const listData = await getEquipments({
                paginationModel,
                sortModel: sortModel.map((s) => ({ field: s.field, sort: s.sort || 'asc' })),
                filterModel: {
                    items: filterModel.items.map((item) => ({
                        field: item.field,
                        operator: item.operator,
                        value: String(item.value || ''),
                    })),
                },
            });

            setRowsState({
                rows: listData.items,
                rowCount: listData.itemCount,
            });
        } catch (listDataError) {
            setError(listDataError as Error);
        }

        setIsLoading(false);
    }, [paginationModel, sortModel, filterModel]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);
    const handleRefresh = React.useCallback(() => {
        if (!isLoading) {
            loadData();
        }
    }, [isLoading, loadData]);

    const handleRowClick = React.useCallback<GridEventListener<'rowClick'>>(
        ({ row }) => {
            navigate({ to: `/equipments/${row.id}` });
        },
        [navigate],
    );

    const handleCreateClick = React.useCallback(() => {
        navigate({ to: '/equipments/new' });
    }, [navigate]);

    const handleRowEdit = React.useCallback(
        (equipment: Equipment) => () => {
            navigate({ to: `/equipments/${equipment.id}/edit` });
        },
        [navigate],
    );

    const handleRowDelete = React.useCallback(
        (equipment: Equipment) => async () => {
            const confirmed = await dialogs.confirm(
                `Deseja realmente descartar "${equipment.nome}"?`,
                {
                    title: 'Descartar equipamento?',
                    severity: 'error',
                    okText: 'Descartar',
                    cancelText: 'Cancelar',
                },
            );

            if (confirmed) {
                setIsLoading(true);
                try {
                    await deleteEquipment(Number(equipment.id));

                    notifications.show('Equipamento descartado com sucesso.', {
                        severity: 'success',
                        autoHideDuration: 3000,
                    });
                    loadData();
                } catch (deleteError) {
                    notifications.show(
                        `Falha ao descartar equipamento. Motivo: ${(deleteError as Error).message}`,
                        {
                            severity: 'error',
                            autoHideDuration: 3000,
                        },
                    );
                }
                setIsLoading(false);
            }
        },
        [dialogs, notifications, loadData],
    );

    const handleMovement = React.useCallback(
        (equipment: Equipment, tipo: 'ENTRADA' | 'SAIDA') => () => {
            setSelectedEquipment(equipment);
            setTipoMovimentacao(tipo);
            setMovementDialogOpen(true);
        },
        [],
    );

    const handleMovementClose = React.useCallback(() => {
        setMovementDialogOpen(false);
        setSelectedEquipment(null);
        setTipoMovimentacao(null);
    }, []);

    const handleMovementSuccess = React.useCallback(() => {
        loadData();
        handleMovementClose();
    }, [loadData, handleMovementClose]);

    const initialState = React.useMemo(
        () => ({
            pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
        }),
        [],
    );

    const columns = React.useMemo<GridColDef[]>(
        () => [
            { field: 'id', headerName: 'ID', width: 80 },
            { field: 'nome', headerName: 'Nome', minWidth: 140, flex: 1 },
            { field: 'modelo', headerName: 'Modelo', minWidth: 120, flex: 1 },
            { field: 'numero_serie', headerName: 'Nº Série', minWidth: 120, flex: 1 },
            { field: 'patrimonio', headerName: 'Patrimônio', minWidth: 100, flex: 1 },
            { field: 'local', headerName: 'Local', minWidth: 100, flex: 1 },
            {
                field: 'status',
                headerName: 'Status',
                width: 160,
                renderCell: (params) => {
                    const config = statusConfig[params.value as string] || { label: params.value, color: 'default' as const };
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
                field: 'usuario',
                headerName: 'Responsável',
                minWidth: 120,
                flex: 1,
                valueGetter: (value: { nome?: string } | undefined) => value?.nome || 'N/A',
            },
            {
                field: 'created_at',
                headerName: 'Cadastrado em',
                width: 120,
                valueGetter: (value: string) => {
                    try {
                        const date = new Date(value);
                        return date.toLocaleDateString('pt-BR');
                    } catch {
                        return value;
                    }
                },
            },
            {
                field: 'actions',
                type: 'actions',
                headerName: 'Ações',
                width: 160,
                getActions: ({ row }) => {
                    const actions = [
                        <GridActionsCellItem
                            key="edit-item"
                            icon={<EditIcon />}
                            label="Editar"
                            onClick={handleRowEdit(row)}
                        />,
                    ];

                    if (row.status === 'NO_DEPOSITO') {
                        actions.push(
                            <GridActionsCellItem
                                key="saida-item"
                                icon={<ArrowDownwardIcon />}
                                label="Registrar Saída"
                                onClick={handleMovement(row, 'SAIDA')}
                            />
                        );
                    }

                    if (row.status === 'FORA_DEPOSITO') {
                        actions.push(
                            <GridActionsCellItem
                                key="entrada-item"
                                icon={<ArrowUpwardIcon />}
                                label="Registrar Entrada"
                                onClick={handleMovement(row, 'ENTRADA')}
                            />
                        );
                    }

                    actions.push(
                        <GridActionsCellItem
                            key="delete-item"
                            icon={<DeleteIcon />}
                            label="Descartar"
                            onClick={handleRowDelete(row)}
                        />
                    );

                    return actions;
                },
            },
        ],
        [handleRowEdit, handleRowDelete, handleMovement],
    );

    const pageTitle = 'Equipamentos';

    return (
        <PageContainer
            title={pageTitle}
            // breadcrumbs={[{ title: pageTitle }]}
            fullWidth
            actions={
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Atualizar dados" placement="right" enterDelay={1000}>
                        <div>
                            <IconButton size="small" aria-label="refresh" onClick={handleRefresh}>
                                <RefreshIcon />
                            </IconButton>
                        </div>
                    </Tooltip>
                    <Button
                        variant="contained"
                        onClick={handleCreateClick}
                        startIcon={<AddIcon />}
                    >
                        Cadastrar Equipamento
                    </Button>
                </Stack>
            }
        >
            <Box sx={{ flex: 1, width: '100%' }}>
                {error ? (
                    <Box sx={{ flexGrow: 1 }}>
                        <Alert severity="error">{error.message}</Alert>
                    </Box>
                ) : (
                    <DataGrid
                        rows={rowsState.rows}
                        rowCount={rowsState.rowCount}
                        columns={columns}
                        pagination
                        sortingMode="server"
                        filterMode="server"
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePaginationModelChange}
                        sortModel={sortModel}
                        onSortModelChange={handleSortModelChange}
                        filterModel={filterModel}
                        onFilterModelChange={handleFilterModelChange}
                        disableRowSelectionOnClick
                        onRowClick={handleRowClick}
                        loading={isLoading}
                        initialState={initialState}
                        showToolbar
                        pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
                        sx={{
                            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                                outline: 'transparent',
                            },
                            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                            {
                                outline: 'none',
                            },
                            [`& .${gridClasses.row}:hover`]: {
                                cursor: 'pointer',
                            },
                        }}
                        slotProps={{
                            loadingOverlay: {
                                variant: 'circular-progress',
                                noRowsVariant: 'circular-progress',
                            },
                            baseIconButton: {
                                size: 'small',
                            },
                        }}
                        localeText={{
                            noRowsLabel: 'Nenhum equipamento cadastrado',
                        }}
                    />
                )}
            </Box>

            <MovementDialog
                open={movementDialogOpen}
                onClose={handleMovementClose}
                onSuccess={handleMovementSuccess}
                equipment={selectedEquipment}
                tipoMovimentacao={tipoMovimentacao}
            />
        </PageContainer>
    );
}
