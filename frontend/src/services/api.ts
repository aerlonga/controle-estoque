import api from '../lib/axios'
import type {
    Usuario,
    Equipamento,
    Movimentacao,
    UsuarioFormData,
    EquipamentoFormData,
    MovimentacaoFormData,
    LoginFormData,
    AuthResponse,
    ApiResponse,
    MovimentacaoFiltros,
} from '../types/api'

export const authService = {
    async login(usuario_rede: string, senha: string): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', {
            usuario_rede,
            senha,
        })
        return response.data
    },
}

export const usuarioService = {
    async listar(): Promise<ApiResponse<Usuario[]>> {
        const response = await api.get<ApiResponse<Usuario[]>>('/usuarios')
        return response.data
    },

    async buscarPorId(id: number): Promise<ApiResponse<Usuario>> {
        const response = await api.get<ApiResponse<Usuario>>(`/usuarios/${id}`)
        return response.data
    },

    async criar(dados: UsuarioFormData): Promise<ApiResponse<Usuario>> {
        const response = await api.post<ApiResponse<Usuario>>('/usuarios', dados)
        return response.data
    },

    async atualizar(id: number, dados: Partial<UsuarioFormData>): Promise<ApiResponse<Usuario>> {
        const response = await api.put<ApiResponse<Usuario>>(`/usuarios/${id}`, dados)
        return response.data
    },

    async desativar(id: number): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>(`/usuarios/${id}`)
        return response.data
    },
}

export const equipamentoService = {
    async listar(): Promise<ApiResponse<Equipamento[]>> {
        const response = await api.get<ApiResponse<Equipamento[]>>('/equipamentos')
        return response.data
    },

    async buscarPorId(id: number): Promise<ApiResponse<Equipamento>> {
        const response = await api.get<ApiResponse<Equipamento>>(`/equipamentos/${id}`)
        return response.data
    },

    async criar(dados: EquipamentoFormData): Promise<ApiResponse<Equipamento>> {
        const response = await api.post<ApiResponse<Equipamento>>('/equipamentos', dados)
        return response.data
    },

    async atualizar(
        id: number,
        dados: Partial<EquipamentoFormData>
    ): Promise<ApiResponse<Equipamento>> {
        const response = await api.put<ApiResponse<Equipamento>>(`/equipamentos/${id}`, dados)
        return response.data
    },

    async descartar(id: number): Promise<ApiResponse<void>> {
        const response = await api.delete<ApiResponse<void>>(`/equipamentos/${id}`)
        return response.data
    },

    async movimentar(
        id: number,
        dados: Omit<MovimentacaoFormData, 'equipamento_id'>
    ): Promise<ApiResponse<Movimentacao>> {
        const response = await api.post<ApiResponse<Movimentacao>>('/movimentacoes', {
            equipamento_id: id,
            ...dados,
        })
        return response.data
    },
}

export const movimentacaoService = {
    async listar(filtros?: MovimentacaoFiltros): Promise<ApiResponse<Movimentacao[]>> {
        const params = new URLSearchParams(filtros as Record<string, string>)
        const response = await api.get<ApiResponse<Movimentacao[]>>(`/movimentacoes?${params}`)
        return response.data
    },

    async buscarPorId(id: number): Promise<ApiResponse<Movimentacao>> {
        const response = await api.get<ApiResponse<Movimentacao>>(`/movimentacoes/${id}`)
        return response.data
    },

    async criar(dados: MovimentacaoFormData): Promise<ApiResponse<Movimentacao>> {
        const response = await api.post<ApiResponse<Movimentacao>>('/movimentacoes', dados)
        return response.data
    },

    async listarPorEquipamento(equipamentoId: number): Promise<ApiResponse<Movimentacao[]>> {
        const response = await api.get<ApiResponse<Movimentacao[]>>(
            `/movimentacoes/equipamento/${equipamentoId}`
        )
        return response.data
    },

    async listarPorUsuario(usuarioId: number): Promise<ApiResponse<Movimentacao[]>> {
        const response = await api.get<ApiResponse<Movimentacao[]>>(
            `/movimentacoes/usuario/${usuarioId}`
        )
        return response.data
    },
}
