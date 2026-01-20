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
    GridColDef,
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
    getAll as getAllEquipments,
    type Equipment,
} from '../data/equipments';
import PageContainer from './PageContainer';
import MovementDialog from './MovementDialog';
import { usePageTitle } from '../../contexts/PageTitleContext';
import { exportToExcel, exportToPDF } from '../utils/exportHelpers';
import CustomToolbar from './CustomToolbar';
import EquipmentFilter, { FilterState, initialFilterState } from './EquipmentFilter';

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
    const [filters, setFilters] = React.useState<FilterState>(initialFilterState);
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

    const handleFilterChange = React.useCallback(
        (newFilters: FilterState) => {
            setFilters(newFilters);
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
                filters,
            });

            setRowsState({
                rows: listData.items,
                rowCount: listData.itemCount,
            });
        } catch (listDataError) {
            setError(listDataError as Error);
        }

        setIsLoading(false);
    }, [paginationModel, sortModel, filters]);

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

    const handleExportExcel = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const allData = await getAllEquipments({ filters });

            exportToExcel(allData, 'equipamentos');
            notifications.show(`Exportado ${allData.length} equipamento(s) para Excel com sucesso!`, {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error) {
            console.error('Erro na exportação:', error);
            notifications.show('Erro ao exportar para Excel', {
                severity: 'error',
                autoHideDuration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [filters, notifications]);

    const handleExportPDF = React.useCallback(async () => {

        try {
            setIsLoading(true);

            const allData = await getAllEquipments({ filters });

            exportToPDF(allData, 'equipamentos');
            notifications.show(`Exportado ${allData.length} equipamento(s) para PDF com sucesso!`, {
                severity: 'success',
                autoHideDuration: 3000,
            });
        } catch (error) {
            console.error('Erro na exportação:', error);
            notifications.show('Erro ao exportar para PDF', {
                severity: 'error',
                autoHideDuration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    }, [filters, notifications]);



    const initialState = React.useMemo(
        () => ({
            pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
        }),
        [],
    );

    const columns = React.useMemo<GridColDef[]>(
        () => [
            { field: 'id', headerName: 'ID', width: 80, disableColumnMenu: true, sortable: false },
            {
                field: 'nome',
                headerName: 'Nome',
                minWidth: 140,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-'
            },
            {
                field: 'modelo',
                headerName: 'Modelo',
                minWidth: 120,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-'
            },
            {
                field: 'numero_serie',
                headerName: 'Nº Série',
                minWidth: 120,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-'
            },
            {
                field: 'patrimonio',
                headerName: 'Patrimônio',
                minWidth: 100,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-'
            },
            {
                field: 'local',
                headerName: 'Local',
                minWidth: 100,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-'
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 160,
                disableColumnMenu: true,
                sortable: false,
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
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: { nome?: string } | undefined) => value?.nome || 'N/A',
            },
            {
                field: 'created_at',
                headerName: 'Cadastro',
                width: 120,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => {
                    try {
                        const date = new Date(value);
                        return date.toLocaleDateString('pt-BR');
                    } catch {
                        return value || '-';
                    }
                },
            },
            {
                field: 'actions',
                headerName: 'Ações',
                width: 160,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => {
                    const isNoDeposito = params.row.status === 'NO_DEPOSITO';
                    const isForaDeposito = params.row.status === 'FORA_DEPOSITO';

                    return (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            height: '100%'
                        }}>
                            <Tooltip title="Editar">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRowEdit(params.row)();
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
                                            handleMovement(params.row, 'SAIDA')();
                                        }}
                                    >
                                        <ArrowDownwardIcon fontSize="small" />
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
                                            handleMovement(params.row, 'ENTRADA')();
                                        }}
                                    >
                                        <ArrowUpwardIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            <Tooltip title="Excluir">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRowDelete(params.row)();
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    );
                },
            },
        ],
        [handleRowEdit, handleRowDelete, handleMovement],
    );

    const pageTitle = 'Equipamentos';

    return (
        <PageContainer
            // title={pageTitle}
            // breadcrumbs={[{ title: pageTitle }]}
            fullWidth
            actions={
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Atualizar dados" placement="bottom" enterDelay={1000}>
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
                <EquipmentFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSearch={loadData}
                    onClear={() => {
                        setFilters(initialFilterState);
                        setPaginationModel({ page: 0, pageSize: INITIAL_PAGE_SIZE });
                    }}
                />
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
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePaginationModelChange}
                        sortModel={sortModel}
                        onSortModelChange={handleSortModelChange}
                        disableRowSelectionOnClick
                        onRowClick={handleRowClick}
                        loading={isLoading}
                        initialState={initialState}
                        showToolbar
                        slots={{
                            toolbar: CustomToolbar,
                        }}
                        pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
                        sx={{
                            // Bordas nas células e headers
                            [`& .${gridClasses.columnHeader}`]: {
                                outline: 'transparent',
                                borderRight: '1px solid',
                                borderColor: 'divider',
                            },
                            [`& .${gridClasses.cell}`]: {
                                outline: 'transparent',
                                borderRight: '1px solid',
                                borderColor: 'divider',
                            },
                            // Remover outline ao focar
                            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                            {
                                outline: 'none',
                            },
                            // Cursor pointer ao passar o mouse
                            [`& .${gridClasses.row}:hover`]: {
                                cursor: 'pointer',
                            },
                            // Borda horizontal entre linhas
                            [`& .${gridClasses.row}`]: {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            },
                            // Borda ao redor da tabela
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                        slotProps={{
                            toolbar: {
                                onExportPDF: handleExportPDF,
                                onExportExcel: handleExportExcel,
                            },
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
                            // Toolbar
                            toolbarColumns: 'Colunas',
                            toolbarColumnsLabel: 'Selecionar colunas',
                            toolbarFilters: 'Filtros',
                            toolbarFiltersLabel: 'Mostrar filtros',
                            toolbarDensity: 'Densidade',
                            toolbarDensityLabel: 'Densidade',
                            toolbarDensityCompact: 'Compacta',
                            toolbarDensityStandard: 'Padrão',
                            toolbarDensityComfortable: 'Confortável',
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
