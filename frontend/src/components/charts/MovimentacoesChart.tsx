import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { LineChart } from '@mui/x-charts/LineChart'
import { formatNumber } from '../../utils/formatters'

interface MovimentacoesChartProps {
    data: {
        xAxis: string[]
        series: {
            data: number[]
            label: string
            color: string
        }[]
    }
    period: number
}

function AreaGradient({ color, id }: { color: string; id: string }) {
    return (
        <defs>
            <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
        </defs>
    )
}

export default function MovimentacoesChart({ data, period }: MovimentacoesChartProps) {
    const theme = useTheme()

    return (
        <Card variant="outlined" sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography component="h2" variant="subtitle2">
                        Movimentações
                    </Typography>
                    <Chip size="small" color="success" label={`Últimos ${period} dias`} />
                </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                    Entradas e saídas de equipamentos
                </Typography>
                <LineChart
                    xAxis={[
                        {
                            scaleType: 'point',
                            data: data.xAxis,
                            tickInterval: (_index, i) => (i + 1) % 5 === 0,
                            height: 24,
                        },
                    ]}
                    yAxis={[{ width: 50 }]}
                    series={data.series.map((serie, _index) => ({
                        id: serie.label.toLowerCase(),
                        label: serie.label,
                        showMark: false,
                        curve: 'linear',
                        stack: 'total',
                        area: true,
                        stackOrder: 'ascending',
                        data: serie.data,
                        color: serie.color,
                        valueFormatter: (value) => formatNumber(value ?? 0),
                    }))}
                    height={250}
                    margin={{ left: 0, right: 20, top: 20, bottom: 0 }}
                    grid={{ horizontal: true }}
                    sx={{
                        '& .MuiAreaElement-series-entrada': {
                            fill: "url('#entrada-gradient')",
                        },
                        '& .MuiAreaElement-series-saída': {
                            fill: "url('#saida-gradient')",
                        },
                    }}
                    hideLegend
                >
                    <AreaGradient color={data.series[0]?.color || theme.palette.primary.main} id="entrada-gradient" />
                    <AreaGradient color={data.series[1]?.color || theme.palette.secondary.main} id="saida-gradient" />
                </LineChart>
                <Stack
                    direction="row"
                    sx={{
                        alignContent: { xs: 'center', sm: 'flex-start' },
                        alignItems: 'center',
                        gap: 2,
                        mt: 2,
                        justifyContent: 'center',
                    }}
                >
                    {data.series.map((serie) => (
                        <Stack
                            key={serie.label}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: serie.color,
                                }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {serie.label}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    )
}
