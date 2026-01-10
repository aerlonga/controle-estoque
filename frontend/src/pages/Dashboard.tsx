import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Stack from '@mui/material/Stack'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { equipamentoService, movimentacaoService } from '../services/api'
import MovimentacoesChart from '../components/charts/MovimentacoesChart'
import MovimentacoesPorDiaChart from '../components/charts/MovimentacoesPorDiaChart'
import StatCard from '../dashboard/components/StatCard'
import EquipamentosPorTipoChart from '../dashboard/components/EquipamentosPorTipoChart'

const DATA_COLORS = {
    entrada: '#4e60ff',
    saida: '#f6ad37',
}

export default function Dashboard() {
    const [periodFilter, setPeriodFilter] = useState<number | 'custom'>(30)
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null)
    const [customEndDate, setCustomEndDate] = useState<Date | null>(new Date())

    const { data: equipmentsData, isLoading: isLoadingEquipments } = useQuery({
        queryKey: ['equipamentos'],
        queryFn: () => equipamentoService.listar(),
    })

    const { data: movementsData, isLoading: isLoadingMovements } = useQuery({
        queryKey: ['movimentacoes'],
        queryFn: async () => {
            // Buscar com limite alto para pegar todas as movimentações do dashboard
            const response = await movimentacaoService.listar({ page: '1', limit: '1000' } as any)
            return response
        },
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
                equipmentsByType: [],
            }
        }

        const equipments = equipmentsData.data
        const movements = movementsData.data

        const noDeposito = equipments.filter((eq) => eq.status === 'NO_DEPOSITO').length
        const foraDeposito = equipments.filter((eq) => eq.status === 'FORA_DEPOSITO').length
        const total = equipments.filter((eq) => eq.status !== 'DESCARTADO').length

        // Processar movimentações por data (com filtro de período)
        let startDate: Date
        let endDate: Date
        let periodDays: number

        if (periodFilter === 'custom' && customStartDate && customEndDate) {
            startDate = new Date(customStartDate)
            startDate.setHours(0, 0, 0, 0)
            endDate = new Date(customEndDate)
            endDate.setHours(23, 59, 59, 999) // Incluir o dia inteiro
            periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        } else {
            const days = typeof periodFilter === 'number' ? periodFilter : 30
            endDate = new Date()
            endDate.setHours(23, 59, 59, 999)
            startDate = new Date()
            startDate.setDate(startDate.getDate() - days + 1)
            startDate.setHours(0, 0, 0, 0)
            periodDays = days
        }

        const recentMovements = movements.filter((mov) => {
            const movDate = new Date(mov.data_movimentacao)
            return movDate >= startDate && movDate <= endDate
        })

        // Criar um mapa de movimentações por data
        const movementsByDateMap: Record<string, { ENTRADA: number; SAIDA: number }> = {}

        recentMovements.forEach((mov) => {
            const movDate = new Date(mov.data_movimentacao)
            const dateKey = movDate.toISOString().split('T')[0] // YYYY-MM-DD para chave

            if (!movementsByDateMap[dateKey]) {
                movementsByDateMap[dateKey] = { ENTRADA: 0, SAIDA: 0 }
            }
            movementsByDateMap[dateKey][mov.tipo]++
        })

        // Gerar array de todas as datas do período selecionado
        const allDates: { key: string; label: string }[] = []

        // Usar startDate como base e adicionar dias
        for (let i = 0; i < periodDays; i++) {
            const date = new Date(startDate)
            date.setDate(date.getDate() + i)
            const dateKey = date.toISOString().split('T')[0]
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const dateLabel = `${day}/${month}`

            allDates.push({ key: dateKey, label: dateLabel })

            // Garantir que a data existe no mapa, mesmo sem movimentações
            if (!movementsByDateMap[dateKey]) {
                movementsByDateMap[dateKey] = { ENTRADA: 0, SAIDA: 0 }
            }
        }

        const dates = allDates.map(d => d.label)

        // Movimentações por dia da semana (começando na segunda-feira)
        const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        const weeklyTotal = Array(7).fill(0)

        movements.forEach((mov) => {
            const date = new Date(mov.data_movimentacao)
            const day = date.getDay() // 0 = domingo, 1 = segunda, ..., 6 = sábado
            // Ajustar para começar na segunda: segunda=0, terça=1, ..., domingo=6
            const adjustedDay = day === 0 ? 6 : day - 1
            weeklyTotal[adjustedDay]++
        })

        // Gerar dados históricos simulados para os StatCards (últimos 30 dias)
        const generateHistory = (baseValue: number) => {
            return Array.from({ length: 30 }, (_, _i) => {
                const variation = Math.random() * 0.2 - 0.1 // ±10%
                return Math.max(0, Math.floor(baseValue * (1 + variation)))
            })
        }

        // Processar tipos de equipamento
        const equipmentsByTypeMap: Record<string, number> = {}
        equipments.forEach((eq) => {
            if (eq.status !== 'DESCARTADO') {
                equipmentsByTypeMap[eq.nome] = (equipmentsByTypeMap[eq.nome] || 0) + 1
            }
        })

        const equipmentsByType = Object.entries(equipmentsByTypeMap)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)

        return {
            noDeposito,
            foraDeposito,
            total,
            movementsByDate: {
                xAxis: dates,
                series: [
                    {
                        data: allDates.map((d) => movementsByDateMap[d.key].ENTRADA),
                        label: 'Entrada',
                        color: DATA_COLORS.entrada,
                    },
                    {
                        data: allDates.map((d) => movementsByDateMap[d.key].SAIDA),
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
            equipmentsByType,
        }
    }, [equipmentsData, movementsData, periodFilter, customStartDate, customEndDate])

    if (isLoadingEquipments || isLoadingMovements) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
            </Box>
        )
    }

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
                    <StatCard
                        title="No Depósito"
                        value={stats.noDeposito.toString()}
                        interval="Total ativo"
                        trend="up"
                        data={stats.depositoHistory}
                        customColor={DATA_COLORS.entrada}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Fora do Depósito"
                        value={stats.foraDeposito.toString()}
                        interval="Em uso"
                        trend="neutral"
                        data={stats.foraHistory}
                        customColor={DATA_COLORS.saida}
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
                    <MovimentacoesChart
                        data={stats.movementsByDate}
                        period={typeof periodFilter === 'number' ? periodFilter : customStartDate && customEndDate ? Math.ceil((customEndDate.getTime() - customStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 30}
                    />
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                    <MovimentacoesPorDiaChart data={stats.weeklyMovements} />
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                    <EquipamentosPorTipoChart data={stats.equipmentsByType} />
                </Grid>
            </Grid>
        </Box>
    )
}
