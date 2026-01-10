import api from '../lib/axios'
import type { ApiResponse } from '../types/api'

export interface MovimentacoesAnalytics {
    porData: {
        xAxis: string[]
        series: {
            label: string
            data: number[]
            color: string
        }[]
    }
    porDiaSemana: {
        xAxis: { scaleType: 'band'; data: string[] }[]
        series: { data: number[]; color: string }[]
    }
    periodo: {
        inicio: string
        fim: string
        dias: number
    }
}

export interface EquipamentosAnalytics {
    porTipo: {
        label: string
        value: number
    }[]
    porStatus: {
        noDeposito: number
        foraDeposito: number
        total: number
        depositoHistory: number[]
        foraHistory: number[]
        totalHistory: number[]
    }
}

export interface AnalyticsFiltros {
    periodo?: '7' | '15' | '30'
    data_inicio?: string
    data_fim?: string
}

export const analyticsService = {
    async getMovimentacoesAnalytics(
        filtros?: AnalyticsFiltros
    ): Promise<ApiResponse<MovimentacoesAnalytics>> {
        const params = new URLSearchParams(filtros as Record<string, string>)
        const response = await api.get<ApiResponse<MovimentacoesAnalytics>>(
            `/analytics/movimentacoes?${params}`
        )
        return response.data
    },

    async getEquipamentosAnalytics(): Promise<ApiResponse<EquipamentosAnalytics>> {
        const response = await api.get<ApiResponse<EquipamentosAnalytics>>('/analytics/equipamentos')
        return response.data
    },
}
