import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { equipamentoService } from '../services/api';
import EquipmentsDataGrid from '../components/equipamentos/EquipmentsDataGrid';
import CreateEquipmentDialog from '../components/equipamentos/CreateEquipmentDialog';
import EditEquipmentDialog from '../components/equipamentos/EditEquipmentDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';

function Equipments() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['equipamentos'],
        queryFn: () => equipamentoService.listar()
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => equipamentoService.descartar(id),
        onSuccess: () => {
            refetch();
            setDeleteDialogOpen(false);
            setSelectedEquipment(null);
        },
    });

    const handleEdit = (equipment) => {
        setSelectedEquipment(equipment);
        setEditDialogOpen(true);
    };

    const handleDelete = (equipment) => {
        setSelectedEquipment(equipment);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedEquipment) {
            deleteMutation.mutate(selectedEquipment.id);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Equipamentos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                >
                    Cadastrar Equipamento
                </Button>
            </Box>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
                <EquipmentsDataGrid
                    equipments={data?.data || []}
                    loading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </Paper>

            <CreateEquipmentDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSuccess={() => {
                    refetch();
                    setCreateDialogOpen(false);
                }}
            />

            <EditEquipmentDialog
                open={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false);
                    setSelectedEquipment(null);
                }}
                onSuccess={() => {
                    refetch();
                    setEditDialogOpen(false);
                    setSelectedEquipment(null);
                }}
                equipment={selectedEquipment}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setSelectedEquipment(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Excluir Equipamento"
                message={`Deseja realmente excluir o equipamento "${selectedEquipment?.nome}"?`}
                confirmText="Excluir"
                cancelText="Cancelar"
                confirmColor="error"
            />
        </Box>
    );
}

export default Equipments;
