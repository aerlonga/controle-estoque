import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTheme } from '@mui/material/styles'

interface MovimentacoesPorDiaChartProps {
    data: {
        xAxis: { scaleType: 'band'; data: string[] }[]
        series: { data: number[]; color: string }[]
    }
}

export default function MovimentacoesPorDiaChart({ data }: MovimentacoesPorDiaChartProps) {
    const theme = useTheme()

    const total = data.series[0]?.data.reduce((sum, v) => sum + v, 0) || 0

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    Movimentações por Dia da Semana
                </Typography>
                <Stack sx={{ justifyContent: 'space-between' }}>
                    <Stack
                        direction="row"
                        sx={{
                            alignContent: { xs: 'center', sm: 'flex-start' },
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Typography variant="h4" component="p">
                            {total}
                        </Typography>
                        <Chip size="small" color="primary" label="Total" />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Distribuição semanal de movimentações
                    </Typography>
                </Stack>
                <BarChart
                    borderRadius={8}
                    colors={[data.series[0]?.color || theme.palette.primary.main]}
                    xAxis={data.xAxis}
                    yAxis={[{ width: 50 }]}
                    series={data.series}
                    height={250}
                    margin={{ left: 0, right: 0, top: 20, bottom: 0 }}
                    grid={{ horizontal: true }}
                    hideLegend
                />
            </CardContent>
        </Card>
    )
}
