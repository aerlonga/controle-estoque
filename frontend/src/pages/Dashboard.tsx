import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { equipamentoService, movimentacaoService } from '../services/api'
import MovimentacoesChart from '../components/charts/MovimentacoesChart'
import MovimentacoesPorDiaChart from '../components/charts/MovimentacoesPorDiaChart'
import StatCard from '../dashboard/components/StatCard'
import ColorModeIconDropdown from '../shared-theme/ColorModeIconDropdown'

const DATA_COLORS = {
    entrada: '#4e60ff',
    saida: '#f6ad37',
}

export default function Dashboard() {
    const { data: equipmentsData, isLoading: isLoadingEquipments } = useQuery({
        queryKey: ['equipamentos'],
        queryFn: () => equipamentoService.listar(),
    })

    const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
        queryKey: ['movimentacoes'],
        queryFn: () => movimentacaoService.listar({}),
    })

    const stats = useMemo(() => {
        if (!equipmentsData?.data || !movementsData?.data) {
            return {
                noDeposito: 0,
                foraDeposito: 0,
                total: 0,
                movementsByDate: { xAxis: [], series: [] },
                weeklyMovements: { xAxis: [{ scaleType: 'band' as const, data: [] }], series: [{ data: [], color: DATA_COLORS.entrada }] },
                depositoHistory: [],
                foraHistory: [],
                totalHistory: [],
            }
        }

        const equipments = equipmentsData.data
        const movements = movementsData.data

        const noDeposito = equipments.filter((eq) => eq.status === 'NO_DEPOSITO').length
        const foraDeposito = equipments.filter((eq) => eq.status === 'FORA_DEPOSITO').length
        const total = equipments.filter((eq) => eq.status !== 'DESCARTADO').length

        // Processar movimentações por data
        const movementsByDateMap: Record<string, { ENTRADA: number; SAIDA: number }> = {}
        const sortedMovements = [...movements].sort(
            (a, b) => new Date(a.data_movimentacao).getTime() - new Date(b.data_movimentacao).getTime()
        )

        sortedMovements.forEach((mov) => {
            const date = new Date(mov.data_movimentacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
            })
            if (!movementsByDateMap[date]) movementsByDateMap[date] = { ENTRADA: 0, SAIDA: 0 }
            movementsByDateMap[date][mov.tipo]++
        })

        const dates = Object.keys(movementsByDateMap)

        // Movimentações por dia da semana
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        const weeklyTotal = Array(7).fill(0)

        movements.forEach((mov) => {
            const date = new Date(mov.data_movimentacao)
            const day = date.getDay()
            weeklyTotal[day]++
        })

        // Gerar dados históricos simulados para os StatCards (últimos 30 dias)
        const generateHistory = (baseValue: number) => {
            return Array.from({ length: 30 }, (_, _i) => {
                const variation = Math.random() * 0.2 - 0.1 // ±10%
                return Math.max(0, Math.floor(baseValue * (1 + variation)))
            })
        }

        return {
            noDeposito,
            foraDeposito,
            total,
            movementsByDate: {
                xAxis: dates,
                series: [
                    {
                        data: dates.map((d) => movementsByDateMap[d].ENTRADA),
                        label: 'Entrada',
                        color: DATA_COLORS.entrada,
                    },
                    {
                        data: dates.map((d) => movementsByDateMap[d].SAIDA),
                        label: 'Saída',
                        color: DATA_COLORS.saida,
                    },
                ],
            },
            weeklyMovements: {
                xAxis: [{ scaleType: 'band' as const, data: weekdays }],
                series: [{ data: weeklyTotal, color: DATA_COLORS.entrada }],
            },
            depositoHistory: generateHistory(noDeposito),
            foraHistory: generateHistory(foraDeposito),
            totalHistory: generateHistory(total),
        }
    }, [equipmentsData, movementsData])

    if (isLoadingEquipments || isLoadingMovements) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography component="h2" variant="h6">
                    Visão Geral
                </Typography>
                <ColorModeIconDropdown />
            </Box>

            {/* Cards de Estatísticas */}
            <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(2) }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="No Depósito"
                        value={stats.noDeposito.toString()}
                        interval="Total ativo"
                        trend="up"
                        data={stats.depositoHistory}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Fora do Depósito"
                        value={stats.foraDeposito.toString()}
                        interval="Em uso"
                        trend="neutral"
                        data={stats.foraHistory}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Total de Equipamentos"
                        value={stats.total.toString()}
                        interval="Equipamentos ativos"
                        trend="up"
                        data={stats.totalHistory}
                    />
                </Grid>
            </Grid>

            {/* Gráficos */}
            <Grid container spacing={2} columns={12}>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MovimentacoesChart data={stats.movementsByDate} />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MovimentacoesPorDiaChart data={stats.weeklyMovements} />
                </Grid>
            </Grid>
        </Box>
    )
}
