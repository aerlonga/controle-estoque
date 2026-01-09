import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Typography, Paper, Box, Grid, CircularProgress,
    useTheme, alpha, Tooltip, Stack, MenuItem, Select, FormControl
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { equipamentoService, movimentacaoService } from '../services/api';

// Cores das séries (mantidas para consistência dos dados)
const DATA_COLORS = {
    v6: '#4e60ff',
    v7: '#f6ad37',
    v8: '#e94c4c'
};

function Dashboard() {
    const theme = useTheme();

    const { data: equipmentsData, isLoading: isLoadingEquipments } = useQuery({
        queryKey: ['equipamentos'],
        queryFn: () => equipamentoService.listar()
    });

    const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
        queryKey: ['movimentacoes'],
        queryFn: () => movimentacaoService.listar({})
    });

    const stats = useMemo(() => {
        if (!equipmentsData?.data || !movementsData?.data) {
            return {
                noDeposito: 0, foraDeposito: 0, total: 0,
                byType: [],
                movementsByDate: { xAxis: [], series: [] },
                weeklyMovements: { xAxis: [], series: [] },
                heatmapData: [], heatmapMax: 0
            };
        }

        const equipments = equipmentsData.data;
        const movements = movementsData.data;

        const noDeposito = equipments.filter(eq => eq.status === 'NO_DEPOSITO').length;
        const foraDeposito = equipments.filter(eq => eq.status === 'FORA_DEPOSITO').length;
        const total = equipments.filter(eq => eq.status !== 'DESCARTADO').length;

        const typeCount = {};
        equipments.forEach(eq => {
            const type = eq.nome ? eq.nome.trim() : 'Outros';
            typeCount[type] = (typeCount[type] || 0) + 1;
        });
        const byType = Object.entries(typeCount).map(([label, value], id) => ({
            id, value, label
        }));

        const movementsByDateMap = {};
        const sortedMovements = [...movements].sort((a, b) => new Date(a.data_movimentacao) - new Date(b.data_movimentacao));
        sortedMovements.forEach(mov => {
            const date = new Date(mov.data_movimentacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (!movementsByDateMap[date]) movementsByDateMap[date] = { ENTRADA: 0, SAIDA: 0 };
            movementsByDateMap[date][mov.tipo]++;
        });

        const dates = Object.keys(movementsByDateMap);
        const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
        const weeklyTotal = Array(7).fill(0);
        const heatmapMatrix = Array(6).fill(0).map(() => Array(7).fill(0));

        movements.forEach(mov => {
            const date = new Date(mov.data_movimentacao);
            const day = (date.getDay() + 6) % 7;
            const hour = date.getHours();
            weeklyTotal[day]++;

            let hourIdx = 0;
            if (hour >= 6 && hour < 10) hourIdx = 0;
            else if (hour >= 10 && hour < 12) hourIdx = 1;
            else if (hour >= 12 && hour < 14) hourIdx = 2;
            else if (hour >= 14 && hour < 17) hourIdx = 3;
            else if (hour >= 17 && hour < 20) hourIdx = 4;
            else hourIdx = 5;

            heatmapMatrix[hourIdx][day]++;
        });

        return {
            noDeposito, foraDeposito, total, byType,
            movementsByDate: {
                xAxis: dates,
                series: [
                    { data: dates.map(d => movementsByDateMap[d].ENTRADA), label: 'Entrada', color: DATA_COLORS.v6, area: true, showMark: false },
                    { data: dates.map(d => movementsByDateMap[d].SAIDA), label: 'Saída', color: DATA_COLORS.v7, area: true, showMark: false }
                ]
            },
            weeklyMovements: {
                xAxis: weekdays,
                series: [{ data: weeklyTotal, color: DATA_COLORS.v6 }]
            },
            heatmapData: heatmapMatrix,
            heatmapMax: Math.max(...heatmapMatrix.flat())
        };
    }, [equipmentsData, movementsData]);

    if (isLoadingEquipments || isLoadingMovements) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    const StatCard = ({ title, value, color }) => (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, flex: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{title}</Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
                <Box sx={{ width: 40, height: 20, bgcolor: alpha(color, 0.1), borderRadius: 0.5 }} />
            </Stack>
        </Paper>
    );

    const heatmapHours = ['6am', '10am', '12am', '2pm', '5pm', '8pm'];

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh', transition: 'background 0.3s ease' }}>
            {/* Header Stats */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <StatCard title="No Depósito" value={`${stats.noDeposito}`} color={DATA_COLORS.v6} />
                <StatCard title="Fora do Depósito" value={`${stats.foraDeposito}`} color={DATA_COLORS.v7} />
                <StatCard title="Total" value={`${stats.total}`} color={DATA_COLORS.v8} />
            </Stack>

            <Grid container spacing={2}>
                {/* Linha Superior - Gráfico Principal (Largura Total) */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>Movimentações</Typography>
                            <Typography variant="caption" sx={{ bgcolor: alpha(theme.palette.divider, 0.1), px: 1, borderRadius: 1 }}>Absolute</Typography>
                        </Stack>

                        <Box sx={{ height: 400 }}>
                            <LineChart
                                xAxis={[{ data: stats.movementsByDate.xAxis, scaleType: 'point' }]}
                                series={stats.movementsByDate.series}
                                sx={{
                                    '.MuiChartsAxis-bottom .MuiChartsAxis-line, .MuiChartsAxis-left .MuiChartsAxis-line': { display: 'none' },
                                    '.MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 10 },
                                    '.MuiAreaElement-root': { fillOpacity: 0.15 },
                                }}
                                grid={{ horizontal: true }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                {/* Linha Inferior - 3 Gráficos lado a lado */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>Equipamentos por Tipo</Typography>
                        <Box sx={{ height: 380, display: 'flex', justifyContent: 'center' }}>
                            <PieChart
                                series={[{
                                    data: stats.byType,
                                    innerRadius: 90,
                                    outerRadius: 140,
                                    paddingAngle: 4,
                                    cornerRadius: 4,
                                }]}
                                colors={[DATA_COLORS.v6, DATA_COLORS.v7, DATA_COLORS.v8]}
                                slotProps={{ legend: { hidden: true } }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>Movimentações p/ Dia</Typography>
                        <Box sx={{ height: 400 }}>
                            <BarChart
                                xAxis={[{ scaleType: 'band', data: stats.weeklyMovements.xAxis }]}
                                series={stats.weeklyMovements.series}
                                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                                sx={{
                                    '.MuiBarElement-root': { rx: 2 },
                                    '.MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 12 },
                                    '.MuiChartsAxis-bottom .MuiChartsAxis-line': { display: 'none' }
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', fontWeight: 600 }}>Horários de Movimentação</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center', alignItems: 'center', height: 360 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', py: 1 }}>
                                {heatmapHours.map(h => <Typography key={h} sx={{ fontSize: 11, color: theme.palette.text.secondary }}>{h}</Typography>)}
                            </Box>
                            <Box sx={{ flex: 1, maxWidth: 400 }}>
                                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <Typography key={i} sx={{ fontSize: 11, color: theme.palette.text.secondary, width: '14%', textAlign: 'center' }}>{d}</Typography>
                                    ))}
                                </Stack>
                                <Stack spacing={1}>
                                    {stats.heatmapData.map((row, i) => (
                                        <Stack key={i} direction="row" justifyContent="space-between">
                                            {row.map((val, j) => (
                                                <Box
                                                    key={j}
                                                    sx={{
                                                        width: '14%',
                                                        aspectRatio: '1/1',
                                                        borderRadius: 0.5,
                                                        bgcolor: val > 0
                                                            ? alpha(DATA_COLORS.v6, Math.min(val / (stats.heatmapMax || 1) + 0.2, 1))
                                                            : alpha(theme.palette.divider, 0.1),
                                                        transition: '0.2s',
                                                        '&:hover': { bgcolor: DATA_COLORS.v6 }
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;