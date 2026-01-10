const prisma = require('../models/prisma');

const analyticsService = {
    /**
     * Retorna dados agregados de movimentações por data e dia da semana
     * @param {Object} filtros - { periodo: 7|15|30, data_inicio: 'YYYY-MM-DD', data_fim: 'YYYY-MM-DD' }
     */
    async getMovimentacoesAnalytics(filtros = {}) {
        const { periodo, data_inicio, data_fim } = filtros;

        // Determinar intervalo de datas
        let startDate, endDate, periodDays;

        if (data_inicio && data_fim) {
            // Período personalizado
            startDate = new Date(data_inicio);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(data_fim);
            endDate.setHours(23, 59, 59, 999);
            periodDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        } else {
            // Período predefinido (padrão: 30 dias)
            const days = parseInt(periodo) || 30;
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days + 1);
            startDate.setHours(0, 0, 0, 0);
            periodDays = days;
        }

        // Buscar todas as movimentações no período
        const movimentacoes = await prisma.movimentacao.findMany({
            where: {
                data_movimentacao: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                data_movimentacao: 'asc'
            }
        });

        // Buscar TODAS as movimentações para estatística semanal
        const todasMovimentacoes = await prisma.movimentacao.findMany({
            orderBy: {
                data_movimentacao: 'desc'
            }
        });

        // Processar dados por data
        const porDataMap = {};

        movimentacoes.forEach((mov) => {
            const movDate = new Date(mov.data_movimentacao);
            const dateKey = movDate.toISOString().split('T')[0];

            if (!porDataMap[dateKey]) {
                porDataMap[dateKey] = { ENTRADA: 0, SAIDA: 0 };
            }
            porDataMap[dateKey][mov.tipo]++;
        });

        // Gerar array completo de datas
        const allDates = [];
        for (let i = 0; i < periodDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const dateLabel = `${day}/${month}`;

            allDates.push({ key: dateKey, label: dateLabel });

            if (!porDataMap[dateKey]) {
                porDataMap[dateKey] = { ENTRADA: 0, SAIDA: 0 };
            }
        }

        // Processar dados por dia da semana (começando na segunda-feira)
        const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
        const weeklyTotal = Array(7).fill(0);

        todasMovimentacoes.forEach((mov) => {
            const date = new Date(mov.data_movimentacao);
            const day = date.getDay(); // 0 = domingo, 1 = segunda
            const adjustedDay = day === 0 ? 6 : day - 1;
            weeklyTotal[adjustedDay]++;
        });

        // Construir resposta formatada
        return {
            porData: {
                xAxis: allDates.map(d => d.label),
                series: [
                    {
                        label: 'Entrada',
                        data: allDates.map(d => porDataMap[d.key].ENTRADA),
                        color: '#4e60ff'
                    },
                    {
                        label: 'Saída',
                        data: allDates.map(d => porDataMap[d.key].SAIDA),
                        color: '#f6ad37'
                    }
                ]
            },
            porDiaSemana: {
                xAxis: [{ scaleType: 'band', data: weekdays }],
                series: [{ data: weeklyTotal, color: '#4e60ff' }]
            },
            periodo: {
                inicio: startDate.toISOString().split('T')[0],
                fim: endDate.toISOString().split('T')[0],
                dias: periodDays
            }
        };
    },

    /**
     * Retorna dados agregados de equipamentos por tipo e status
     */
    async getEquipamentosAnalytics() {
        // Buscar todos os equipamentos não descartados
        const equipamentos = await prisma.equipamento.findMany({
            where: {
                status: {
                    not: 'DESCARTADO'
                }
            }
        });

        // Contar por tipo
        const porTipoMap = {};
        let noDeposito = 0;
        let foraDeposito = 0;

        equipamentos.forEach((eq) => {
            // Contar por tipo
            porTipoMap[eq.nome] = (porTipoMap[eq.nome] || 0) + 1;

            // Contar por status
            if (eq.status === 'NO_DEPOSITO') noDeposito++;
            if (eq.status === 'FORA_DEPOSITO') foraDeposito++;
        });

        // Converter para array e ordenar por quantidade
        const porTipo = Object.entries(porTipoMap)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        // Gerar histórico simulado (últimos 30 dias)
        const generateHistory = (baseValue) => {
            return Array.from({ length: 30 }, () => {
                const variation = Math.random() * 0.2 - 0.1; // ±10%
                return Math.max(0, Math.floor(baseValue * (1 + variation)));
            });
        };

        return {
            porTipo,
            porStatus: {
                noDeposito,
                foraDeposito,
                total: equipamentos.length,
                depositoHistory: generateHistory(noDeposito),
                foraHistory: generateHistory(foraDeposito),
                totalHistory: generateHistory(equipamentos.length)
            }
        };
    }
};

module.exports = analyticsService;
