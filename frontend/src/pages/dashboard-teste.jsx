import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Typography, Paper, Box, Grid, CircularProgress,
    useTheme, alpha, Tooltip, Stack, MenuItem, Select, FormControl, styled
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { equipamentoService, movimentacaoService } from '../services/api';

const DATA_COLORS = {
    v6: '#4e60ff',
    v7: '#f6ad37',
    v8: '#e94c4c'
};

// Componente Item para o exemplo de Grid
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
}));

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
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weeklyTotal = Array(7).fill(0);

        // Heatmap de horários (6am-8pm) x Dias da semana
        const heatmapMatrix = Array(15).fill(0).map(() => Array(7).fill(0)); // 15 horas x 7 dias

        movements.forEach(mov => {
            const date = new Date(mov.data_movimentacao);
            const day = date.getDay();
            const hour = date.getHours();
            weeklyTotal[day]++;

            if (hour >= 6 && hour <= 20) {
                heatmapMatrix[hour - 6][day]++;
            }
        });

        // Normalizar para escala de cores
        const maxValue = Math.max(...heatmapMatrix.flat());

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
                xAxis: [{ scaleType: 'band', data: weekdays }],
                series: [{ data: weeklyTotal, color: DATA_COLORS.v6 }]
            },
            heatmapData: heatmapMatrix,
            heatmapMax: maxValue
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

    const HeatmapCell = ({ value, max, label }) => {
        const intensity = max > 0 ? value / max : 0;
        const getColor = (intensity) => {
            if (intensity === 0) return alpha(theme.palette.grey[300], 0.3);
            if (intensity < 0.2) return alpha(theme.palette.primary.light, 0.3);
            if (intensity < 0.4) return alpha(theme.palette.primary.light, 0.5);
            if (intensity < 0.6) return alpha(theme.palette.primary.main, 0.6);
            if (intensity < 0.8) return alpha(theme.palette.primary.main, 0.8);
            return theme.palette.primary.dark;
        };

        return (
            <Tooltip title={`${label}: ${value} movimentações`} arrow>
                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        minHeight: '32px',
                        bgcolor: getColor(intensity),
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        '&:hover': {
                            transform: 'scale(1.1)',
                            zIndex: 10,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                        }
                    }}
                />
            </Tooltip>
        );
    };

    const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
    const hours = ['6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h'];

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh', transition: 'background 0.3s ease' }}>
            <Grid container spacing={2} sx={{ mb: 6 }}>
                <Grid size={8}>
                    {/* Header Stats */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                        <StatCard title="No Depósito" value={`${stats.noDeposito}`} color={DATA_COLORS.v6} />
                        <StatCard title="Fora do Depósito" value={`${stats.foraDeposito}`} color={DATA_COLORS.v7} />
                        <StatCard title="Total" value={`${stats.total}`} color={DATA_COLORS.v8} />
                    </Stack>
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

                <Grid size={4}>
                    <Stack spacing={2} sx={{ height: '100%' }}>
                        <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>Equipamentos por Tipo</Typography>
                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
                                <PieChart
                                    series={[{
                                        data: stats.byType,
                                        innerRadius: '40%',
                                        outerRadius: '80%',
                                        paddingAngle: 4,
                                        cornerRadius: 4,
                                    }]}
                                    colors={[DATA_COLORS.v6, DATA_COLORS.v7, DATA_COLORS.v8]}
                                    slotProps={{
                                        legend: {
                                            hidden: false,
                                            direction: 'column',
                                            position: { vertical: 'middle', horizontal: 'right' },
                                            labelStyle: { fontSize: 10, fontWeight: 600 },
                                            itemMarkWidth: 8,
                                            itemMarkHeight: 8,
                                        }
                                    }}
                                    margin={{ top: 10, bottom: 10, left: 10, right: 80 }}
                                />
                            </Box>
                        </Paper>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                background: alpha(theme.palette.background.paper, 0.6),
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Movimentações por Dia
                            </Typography>
                            <Box sx={{ flex: 1, minHeight: 0 }}>
                                <BarChart
                                    xAxis={stats.weeklyMovements.xAxis}
                                    series={stats.weeklyMovements.series}
                                    margin={{ left: 10, right: 10, top: 10, bottom: 30 }}
                                    sx={{
                                        '& .MuiBarElement-root': {
                                            rx: 4,
                                        }
                                    }}
                                    slotProps={{
                                        legend: { hidden: true }
                                    }}
                                />
                            </Box>
                        </Paper>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                background: alpha(theme.palette.background.paper, 0.6),
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Horários de Movimentação
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 2, flex: 1, minHeight: 0 }}>
                                {/* Eixo Y (Horas) */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, justifyContent: 'space-around', py: 2 }}>
                                    {hours.map((hour) => (
                                        <Typography key={hour} variant="caption" sx={{ height: '32px', display: 'flex', alignItems: 'center', fontSize: '10px' }}>
                                            {hour}
                                        </Typography>
                                    ))}
                                </Box>

                                {/* Grid do Heatmap */}
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    {/* Eixo X (Dias) */}
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-around', mb: 0.5 }}>
                                        {weekdays.map((day) => (
                                            <Typography key={day} variant="caption" sx={{ width: '100%', textAlign: 'center', fontWeight: 600, fontSize: '11px' }}>
                                                {day}
                                            </Typography>
                                        ))}
                                    </Box>

                                    {/* Células do Heatmap */}
                                    {stats.heatmapData.map((row, hourIdx) => (
                                        <Box key={hourIdx} sx={{ display: 'flex', gap: 0.5 }}>
                                            {row.map((value, dayIdx) => (
                                                <HeatmapCell
                                                    key={`${hourIdx}-${dayIdx}`}
                                                    value={value}
                                                    max={stats.heatmapMax}
                                                    label={`${weekdays[dayIdx]} ${hours[hourIdx]}`}
                                                />
                                            ))}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Paper>
                    </Stack>
                </Grid>

            </Grid>
        </Box>
    );

}

export default Dashboard;