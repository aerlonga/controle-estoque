/**
 * Formata número com separador de milhares no padrão brasileiro
 * Exemplos:
 * - 100 -> "100"
 * - 1000 -> "1.000"
 * - 3487 -> "3.487"
 * - 10000 -> "10.000"
 * - 1234567 -> "1.234.567"
 */
export function formatNumber(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '0';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0';

    return num.toLocaleString('pt-BR');
}

/**
 * Formata valor monetário no padrão brasileiro
 * Exemplo: 1234.56 -> "R$ 1.234,56"
 */
export function formatCurrency(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return 'R$ 0,00';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return 'R$ 0,00';

    return num.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

/**
 * Formata porcentagem
 * Exemplo: 0.1234 -> "12,34%"
 */
export function formatPercent(value: number | string | null | undefined, decimals: number = 2): string {
    if (value === null || value === undefined) return '0%';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '0%';

    return (num * 100).toLocaleString('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }) + '%';
}
