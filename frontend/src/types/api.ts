// ===============================================
// TIPOS BASE DA API
// ===============================================

export type StatusEquipamento = 'NO_DEPOSITO' | 'FORA_DEPOSITO' | 'DESCARTADO'
export type StatusUsuario = 'ATIVO' | 'INATIVO'
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA'
export type Role = 'ADMIN' | 'USUARIO'

// ===============================================
// INTERFACES DE ENTIDADES
// ===============================================

export interface Usuario {
    id: number
    nome: string
    email: string
    senha?: string
    role: Role
    status_usuario: StatusUsuario
    created_at?: string
    updated_at?: string
}

export interface Equipamento {
    id: number
    nome: string
    descricao?: string | null
    tipo: string
    numero_serie?: string | null
    patrimonio?: string | null
    status: StatusEquipamento
    usuario_id?: number | null
    created_at?: string
    updated_at?: string
    usuario?: Usuario
}

export interface Movimentacao {
    id: number
    equipamento_id: number
    usuario_id: number
    tipo: TipoMovimentacao
    data_movimentacao: string
    observacao?: string | null
    created_at?: string
    equipamento?: Equipamento
    usuario?: Usuario
}

// ===============================================
// TIPOS DE FORMULÁRIO
// ===============================================

export interface EquipamentoFormData {
    nome: string
    descricao?: string
    tipo: string
    numero_serie?: string
    patrimonio?: string
    status: StatusEquipamento
    usuario_id?: number
}

export interface UsuarioFormData {
    nome: string
    email: string
    senha?: string
    role: Role
    status_usuario?: StatusUsuario
}

export interface MovimentacaoFormData {
    equipamento_id: number
    tipo: TipoMovimentacao
    observacao?: string
}

export interface LoginFormData {
    email: string
    senha: string
}

// ===============================================
// TIPOS DE RESPOSTA DA API
// ===============================================

export interface ApiResponse<T> {
    data: T
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface AuthResponse {
    token: string
    user: Usuario
}

// ===============================================
// TIPOS DE FILTROS
// ===============================================

export interface EquipamentoFiltros {
    status?: StatusEquipamento
    tipo?: string
    usuario_id?: number
    search?: string
}

export interface MovimentacaoFiltros {
    tipo?: TipoMovimentacao
    equipamento_id?: number
    usuario_id?: number
    data_inicio?: string
    data_fim?: string
}
