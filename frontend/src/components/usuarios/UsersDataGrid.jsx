import { DataGrid } from '@mui/x-data-grid';
import { Chip } from '@mui/material';
import { useEffect, useState } from 'react';

function UsersDataGrid({ users, loading }) {
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
        { field: 'usuario_rede', headerName: 'Usuário', width: 150 },
        {
            field: 'perfil',
            headerName: 'Perfil',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'ADMIN' ? 'secondary' : 'default'}
                    size="small"
                />
            ),
        },
        {
            field: 'created_at',
            headerName: 'Criado em',
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
    ];

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