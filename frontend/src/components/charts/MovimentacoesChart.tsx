import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { LineChart } from '@mui/x-charts/LineChart'

interface MovimentacoesChartProps {
    data: {
        xAxis: string[]
        series: {
            data: number[]
            label: string
            color: string
        }[]
    }
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

export default function MovimentacoesChart({ data }: MovimentacoesChartProps) {
    const theme = useTheme()

    const total = data.series.reduce((sum, serie) => {
        return sum + serie.data.reduce((s, v) => s + v, 0)
    }, 0)

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    Movimentações
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
                        <Chip size="small" color="success" label="Últimos dias" />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Entradas e saídas de equipamentos
                    </Typography>
                </Stack>
                <LineChart
                    xAxis={[
                        {
                            scaleType: 'point',
                            data: data.xAxis,
                            tickInterval: (index, i) => (i + 1) % 5 === 0,
                            height: 24,
                        },
                    ]}
                    yAxis={[{ width: 50 }]}
                    series={data.series.map((serie, index) => ({
                        id: serie.label.toLowerCase(),
                        label: serie.label,
                        showMark: false,
                        curve: 'linear',
                        stack: 'total',
                        area: true,
                        stackOrder: 'ascending',
                        data: serie.data,
                        color: serie.color,
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
            </CardContent>
        </Card>
    )
}
