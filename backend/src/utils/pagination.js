/**
 * Utilitários para paginação
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Extrair e validar parâmetros de paginação da query
 * @param {Object} query - req.query
 * @returns {Object} { page, limit, skip }
 */
function getPaginationParams(query = {}) {
    let page = parseInt(query.page) || DEFAULT_PAGE;
    let limit = parseInt(query.limit) || DEFAULT_LIMIT;

    if (page < 1) page = DEFAULT_PAGE;
    if (limit < 1) limit = DEFAULT_LIMIT;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;

    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

/**
 * Criar resposta paginada padronizada
 * @param {Array} data - Dados da página atual
 * @param {Number} total - Total de registros
 * @param {Number} page - Página atual
 * @param {Number} limit - Itens por página
 * @returns {Object} Resposta formatada
 */
function createPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    };
}

module.exports = {
    getPaginationParams,
    createPaginatedResponse,
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT
};
