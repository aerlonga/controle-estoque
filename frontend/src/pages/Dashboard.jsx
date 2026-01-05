import { Typography, Paper, Box } from '@mui/material';

function Dashboard() {
    return (
        <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
                Bem-vindo ao Sistema
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="body1" color="text.secondary">
                    Dashboard em desenvolvimento...
                </Typography>
            </Paper>
        </Box>
    );
}

export default Dashboard;
