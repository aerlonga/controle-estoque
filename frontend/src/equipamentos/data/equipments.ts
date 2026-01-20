/**
 * Data layer para Equipamentos
 * Wrapper simples que usa o equipamentoService existente
 * Todo processamento de dados é feito no backend
 */

import { equipamentoService } from '../../services/api';
import type { Equipamento, EquipamentoFormData } from '../../types/api';
import type { FilterState } from '../components/EquipmentFilter';

export type Equipment = Equipamento;

export interface GetManyParams {
    paginationModel?: { page: number; pageSize: number };
    sortModel?: { field: string; sort: 'asc' | 'desc' }[];
    filters?: FilterState;
}

export interface GetManyResult {
    items: Equipment[];
    itemCount: number;
}

function buildQueryParams(filters?: FilterState): Record<string, any> {
    const queryParams: Record<string, any> = {};

    if (!filters) return queryParams;

    if (filters.nome?.trim()) queryParams.nome = filters.nome.trim();
    if (filters.modelo?.trim()) queryParams.modelo = filters.modelo.trim();
    if (filters.numero_serie?.trim()) queryParams.numero_serie = filters.numero_serie.trim();
    if (filters.patrimonio?.trim()) queryParams.patrimonio = filters.patrimonio.trim();
    if (filters.local?.trim()) queryParams.local = filters.local.trim();
    if (filters.status) queryParams.status = filters.status;
    if (filters.usuario_id) queryParams.usuario_id = filters.usuario_id;
    if (filters.created_at) queryParams.created_at = filters.created_at.format('YYYY-MM-DD');

    return queryParams;
}

export async function getMany(params: GetManyParams = {}): Promise<GetManyResult> {
    try {
        const { paginationModel = { page: 0, pageSize: 10 }, filters } = params;

        const queryParams: Record<string, any> = {
            page: paginationModel.page + 1,
            limit: paginationModel.pageSize,
            ...buildQueryParams(filters),
        };

        const response = await equipamentoService.listar(queryParams);

        const items = Array.isArray(response.data) ? response.data : [];
        const itemCount = response.meta?.total ?? 0;

        return {
            items,
            itemCount,
        };
    } catch (error) {
        console.error('Erro ao buscar equipamentos:', error);
        return {
            items: [],
            itemCount: 0,
        };
    }
}

export async function getAll(params: GetManyParams = {}): Promise<Equipment[]> {
    try {
        const { filters } = params;

        const queryParams = buildQueryParams(filters);

        const response = await equipamentoService.listarTodos(queryParams);

        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Erro ao buscar todos os equipamentos:', error);
        return [];
    }
}

export async function getOne(id: number): Promise<Equipment> {
    const response = await equipamentoService.buscarPorId(id);
    return response.data;
}

export async function createOne(data: EquipamentoFormData): Promise<Equipment> {
    const response = await equipamentoService.criar(data);
    return response.data;
}

export async function updateOne(id: number, data: Partial<EquipamentoFormData>): Promise<Equipment> {
    const response = await equipamentoService.atualizar(id, data);
    return response.data;
}

export async function deleteOne(id: number): Promise<void> {
    await equipamentoService.descartar(id);
}

// Validação simples no frontend (validação completa é feita no backend)
export function validate(values: Partial<EquipamentoFormData>): { issues?: { path: string[]; message: string }[] } {
    const issues: { path: string[]; message: string }[] = [];

    if (!values.nome || values.nome.trim().length < 3) {
        issues.push({ path: ['nome'], message: 'Nome deve ter pelo menos 3 caracteres' });
    }

    if (!values.modelo || values.modelo.trim().length < 2) {
        issues.push({ path: ['modelo'], message: 'Modelo deve ter pelo menos 2 caracteres' });
    }

    if (!values.numero_serie || values.numero_serie.trim().length < 3) {
        issues.push({ path: ['numero_serie'], message: 'Número de série deve ter pelo menos 3 caracteres' });
    }

    return issues.length > 0 ? { issues } : {};
}
