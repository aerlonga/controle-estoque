import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { analyticsService } from '../services/api'
import MovimentacoesChart from '../components/charts/MovimentacoesChart'
import MovimentacoesPorDiaChart from '../components/charts/MovimentacoesPorDiaChart'
import StatCard from '../dashboard/components/StatCard'
import EquipamentosPorTipoChart from '../dashboard/components/EquipamentosPorTipoChart'

const DATA_COLORS = {
    entrada: '#4e60ff',
    saida: '#f6ad37',
}

// Componente de Skeleton para StatCard
function StatCardSkeleton() {
    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" height={80} sx={{ mt: 2, borderRadius: 1 }} />
            </CardContent>
        </Card>
    )
}

// Componente de Skeleton para Charts
function ChartSkeleton() {
    return (
        <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
                <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
            </CardContent>
        </Card>
    )
}

export default function Dashboard() {
    const [periodFilter, setPeriodFilter] = useState<number | 'custom'>(30)
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
    const [customEndDate, setCustomEndDate] = useState<Date | null>(new Date())

    // Query para dados de movimentações
    const { data: movimentacoesAnalytics, isLoading: isLoadingMovimentacoes } = useQuery({
        queryKey: ['analytics-movimentacoes', periodFilter, customStartDate, customEndDate],
        queryFn: async () => {
            const filtros: any = {}

            if (periodFilter === 'custom' && customStartDate && customEndDate) {
                const startDate = new Date(customStartDate)
                const endDate = new Date(customEndDate)
                filtros.data_inicio = startDate.toISOString().split('T')[0]
                filtros.data_fim = endDate.toISOString().split('T')[0]
            } else if (typeof periodFilter === 'number') {
                filtros.periodo = periodFilter.toString()
            }

            return analyticsService.getMovimentacoesAnalytics(filtros)
        },
    })

    // Query para dados de equipamentos
    const { data: equipamentosAnalytics, isLoading: isLoadingEquipamentos } = useQuery({
        queryKey: ['analytics-equipamentos'],
        queryFn: () => analyticsService.getEquipamentosAnalytics(),
    })

    // Calcular período para display no chip
    const periodoDias = useMemo(() => {
        if (periodFilter === 'custom' && customStartDate && customEndDate) {
            return Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24))
        }
        return typeof periodFilter === 'number' ? periodFilter : 30
    }, [periodFilter, customStartDate, customEndDate])

    // Usar skeleton loaders ao invés de CircularProgress
    const isLoading = isLoadingMovimentacoes || isLoadingEquipamentos

    const movData = movimentacoesAnalytics?.data
    const eqData = equipamentosAnalytics?.data

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '100%' } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <Typography component="h2" variant="h6">
                    Visão Geral
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            value={periodFilter}
                            onChange={(e) => setPeriodFilter(e.target.value as number | 'custom')}
                            displayEmpty
                        >
                            <MenuItem value={7}>7 dias</MenuItem>
                            <MenuItem value={15}>15 dias</MenuItem>
                            <MenuItem value={30}>30 dias</MenuItem>
                            <MenuItem value="custom">Personalizado</MenuItem>
                        </Select>
                    </FormControl>
                    {periodFilter === 'custom' && (
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Data inicial"
                                value={customStartDate}
                                onChange={(newValue) => setCustomStartDate(newValue as Date | null)}
                                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                                format="dd/MM/yyyy"
                            />
                            <DatePicker
                                label="Data final"
                                value={customEndDate}
                                onChange={(newValue) => setCustomEndDate(newValue as Date | null)}
                                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
                                format="dd/MM/yyyy"
                            />
                        </LocalizationProvider>
                    )}
                </Stack>
            </Box>

            {/* Cards de Estatísticas */}
            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="No Depósito"
                            value={eqData?.porStatus.noDeposito?.toString() || '0'}
                            interval="Total"
                            trend="neutral"
                            data={eqData?.porStatus.depositoHistory || []}
                            customColor={DATA_COLORS.entrada}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Fora do Depósito"
                            value={eqData?.porStatus.foraDeposito?.toString() || '0'}
                            interval="Em uso"
                            trend="neutral"
                            data={eqData?.porStatus.foraHistory || []}
                            customColor={DATA_COLORS.saida}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    {isLoading ? (
                        <StatCardSkeleton />
                    ) : (
                        <StatCard
                            title="Total de Equipamentos"
                            value={eqData?.porStatus.total?.toString() || '0'}
                            interval="Total"
                            trend="neutral"
                            data={eqData?.porStatus.totalHistory || []}
                        />
                    )}
                </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <MovimentacoesChart
                            data={movData?.porData || { xAxis: [], series: [] }}
                            period={periodoDias}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <MovimentacoesPorDiaChart
                            data={movData?.porDiaSemana || { xAxis: [{ scaleType: 'band' as const, data: [] }], series: [] }}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    {isLoading ? (
                        <ChartSkeleton />
                    ) : (
                        <EquipamentosPorTipoChart
                            data={eqData?.porTipo || []}
                        />
                    )}
                </Grid>
            </Grid>
        </Box>
    )
}
