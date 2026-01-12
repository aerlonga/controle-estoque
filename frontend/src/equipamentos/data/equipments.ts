/**
 * Data layer para Equipamentos
 * Wrapper simples que usa o equipamentoService existente
 * Todo processamento de dados é feito no backend
 */

import { equipamentoService } from '../../services/api';
import type { Equipamento, EquipamentoFormData } from '../../types/api';

export type Equipment = Equipamento;

export interface GetManyParams {
    paginationModel?: { page: number; pageSize: number };
    sortModel?: { field: string; sort: 'asc' | 'desc' }[];
    filterModel?: { items: { field: string; operator: string; value: string }[] };
}

export interface GetManyResult {
    items: Equipment[];
    itemCount: number;
}

export async function getMany(params: GetManyParams = {}): Promise<GetManyResult> {
    try {
        const { paginationModel = { page: 0, pageSize: 10 } } = params;

        const queryParams: Record<string, any> = {
            page: paginationModel.page + 1, 
            limit: paginationModel.pageSize,
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
