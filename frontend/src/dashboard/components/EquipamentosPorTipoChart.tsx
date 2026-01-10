import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

interface EquipamentoTipoData {
    label: string;
    value: number;
}

interface EquipamentosPorTipoChartProps {
    data: EquipamentoTipoData[];
}

interface StyledTextProps {
    variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({ theme }) => ({
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fill: (theme.vars || theme).palette.text.secondary,
    variants: [
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontSize: theme.typography.h5.fontSize,
            },
        },
        {
            props: ({ variant }) => variant !== 'primary',
            style: {
                fontSize: theme.typography.body2.fontSize,
            },
        },
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontWeight: theme.typography.h5.fontWeight,
            },
        },
        {
            props: ({ variant }) => variant !== 'primary',
            style: {
                fontWeight: theme.typography.body2.fontWeight,
            },
        },
    ],
}));

interface PieCenterLabelProps {
    primaryText: string;
    secondaryText: string;
}

function PieCenterLabel({ primaryText, secondaryText }: PieCenterLabelProps) {
    const { width, height, left, top } = useDrawingArea();
    const primaryY = top + height / 2 - 10;
    const secondaryY = primaryY + 24;

    return (
        <React.Fragment>
            <StyledText variant="primary" x={left + width / 2} y={primaryY}>
                {primaryText}
            </StyledText>
            <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
                {secondaryText}
            </StyledText>
        </React.Fragment>
    );
}

const colors = [
    'hsl(220, 20%, 65%)',
    'hsl(220, 20%, 42%)',
    'hsl(220, 20%, 35%)',
    'hsl(220, 20%, 25%)',
    'hsl(220, 20%, 15%)',
];

export default function EquipamentosPorTipoChart({ data }: EquipamentosPorTipoChartProps) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <Card
            variant="outlined"
            sx={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}
        >
            <CardContent>
                <Typography component="h2" variant="subtitle2">
                    Tipos de Equipamento
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' }, gap: 4 }}>
                    {/* Chart Section */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PieChart
                            colors={colors}
                            margin={{
                                left: 0,
                                right: 0,
                                top: 0,
                                bottom: 0,
                            }}
                            series={[
                                {
                                    data: data.map((item, index) => ({
                                        id: index,
                                        value: item.value,
                                        label: item.label,
                                    })),
                                    innerRadius: 75,
                                    outerRadius: 100,
                                    paddingAngle: 0,
                                    highlightScope: { fade: 'global', highlight: 'item' },
                                },
                            ]}
                            height={260}
                            width={260}
                            hideLegend
                        >
                            <PieCenterLabel primaryText={total.toString()} secondaryText="Total" />
                        </PieChart>
                    </Box>

                    {/* Legend Section (Side) */}
                    <Stack sx={{ flexGrow: 1, width: '100%', pt: 2, gap: 2 }}>
                        {data.map((item, index) => (
                            <Stack key={item.label} direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                                <Box
                                    sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: colors[index % colors.length],
                                        flexShrink: 0,
                                    }}
                                />
                                <Stack sx={{ gap: 1, flexGrow: 1 }}>
                                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                            {item.label}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            {item.value}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.round((item.value / total) * 100)}
                                        sx={{
                                            [`& .${linearProgressClasses.bar}`]: {
                                                backgroundColor: colors[index % colors.length],
                                            },
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}
