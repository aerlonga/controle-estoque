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
    gridClasses,
} from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from '@tanstack/react-router';
import { useDialogs } from '../../equipamentos/hooks/useDialogs/useDialogs';
import useNotifications from '../../equipamentos/hooks/useNotifications/useNotifications';
import { usuarioService } from '../../services/api';
import type { Usuario } from '../../types/api';
import PageContainer from '../../equipamentos/components/PageContainer';
import { usePageTitle } from '../../contexts/PageTitleContext';
import UserFilter, { FilterState, initialFilterState } from './UserFilter';

const INITIAL_PAGE_SIZE = 10;

export default function UserList() {
    const navigate = useNavigate();
    const dialogs = useDialogs();
    const notifications = useNotifications();
    const { setMenuTitle } = usePageTitle();

    const [paginationModel, setPaginationModel] = React.useState<GridPaginationModel>({
        page: 0,
        pageSize: INITIAL_PAGE_SIZE,
    });
    const [filters, setFilters] = React.useState<FilterState>(initialFilterState);

    const [rowsState, setRowsState] = React.useState<{
        rows: Usuario[];
        rowCount: number;
    }>({
        rows: [],
        rowCount: 0,
    });

    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        setMenuTitle('Usuários');
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

    const loadData = React.useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            const response = await usuarioService.listar({
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
                nome: filters.nome || undefined,
                usuario_rede: filters.usuario_rede || undefined,
                perfil: filters.perfil || undefined,
            });

            setRowsState({
                rows: response.data || [],
                rowCount: response.meta?.totalCount || 0,
            });
        } catch (listDataError) {
            setError(listDataError as Error);
        }

        setIsLoading(false);
    }, [paginationModel, filters]);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = React.useCallback(() => {
        if (!isLoading) {
            loadData();
        }
    }, [isLoading, loadData]);

    const handleCreateClick = React.useCallback(() => {
        navigate({ to: '/users/new' });
    }, [navigate]);

    const handleRowEdit = React.useCallback(
        (usuario: Usuario) => () => {
            navigate({ to: `/users/${usuario.id}/edit` });
        },
        [navigate],
    );

    const handleRowDelete = React.useCallback(
        (usuario: Usuario) => async () => {
            const confirmed = await dialogs.confirm(
                `Deseja realmente desativar o usuário "${usuario.nome}"?`,
                {
                    title: 'Desativar usuário?',
                    severity: 'error',
                    okText: 'Desativar',
                    cancelText: 'Cancelar',
                },
            );

            if (confirmed) {
                setIsLoading(true);
                try {
                    await usuarioService.desativar(Number(usuario.id));

                    notifications.show('Usuário desativado com sucesso.', {
                        severity: 'success',
                        autoHideDuration: 3000,
                    });
                    loadData();
                } catch (deleteError) {
                    notifications.show(
                        `Falha ao desativar usuário. Motivo: ${(deleteError as Error).message}`,
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

    const initialState = React.useMemo(
        () => ({
            pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
        }),
        [],
    );

    const columns = React.useMemo<GridColDef[]>(
        () => [
            {
                field: 'nome',
                headerName: 'Nome',
                minWidth: 180,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-',
            },
            {
                field: 'usuario_rede',
                headerName: 'Usuário',
                minWidth: 150,
                flex: 1,
                disableColumnMenu: true,
                sortable: false,
                valueGetter: (value: string) => value || '-',
            },
            {
                field: 'perfil',
                headerName: 'Perfil',
                width: 150,
                disableColumnMenu: true,
                sortable: false,
                renderCell: (params) => {
                    const color = params.value === 'ADMIN' ? 'secondary' : 'default';
                    const label = params.value === 'ADMIN' ? 'Administrador' : 'Usuário';
                    return <Chip label={label} color={color} size="small" />;
                },
            },
            {
                field: 'created_at',
                headerName: 'Data de Cadastro',
                width: 160,
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
                width: 120,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => {
                    return (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.5,
                                height: '100%',
                            }}
                        >
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
        [handleRowEdit, handleRowDelete],
    );

    return (
        <PageContainer
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
                        Criar Usuário
                    </Button>
                </Stack>
            }
        >
            <Box sx={{ flex: 1, width: '100%' }}>
                <UserFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
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
                        paginationMode="server"
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePaginationModelChange}
                        disableRowSelectionOnClick
                        loading={isLoading}
                        initialState={initialState}
                        pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
                        sx={{
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
                            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                            {
                                outline: 'none',
                            },
                            [`& .${gridClasses.row}`]: {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            },
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                        localeText={{
                            noRowsLabel: 'Nenhum usuário cadastrado',
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
        </PageContainer>
    );
}
