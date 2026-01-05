import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { usuarioService } from '../services/api';
import UsersDataGrid from '../components/usuarios/UsersDataGrid';
import CreateUserDialog from '../components/usuarios/CreateUserDialog';

function Users() {
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['usuarios'],
        queryFn: () => usuarioService.listar()
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Usuários do Sistema
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    Criar Usuário
                </Button>
            </Box>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <UsersDataGrid
                    users={data?.data || []}
                    loading={isLoading}
                />
            </Paper>

            <CreateUserDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={() => {
                    refetch();
                    setDialogOpen(false);
                }}
            />
        </Box>
    );
}

export default Users;
