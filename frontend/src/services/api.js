import api from '../lib/axios';

export const authService = {
    async login(usuario_rede, senha) {
        const response = await api.post('/auth/login', {
            usuario_rede,
            senha,
        });
        return response.data;
    },
};

export const usuarioService = {
    async listar() {
        const response = await api.get('/usuarios');
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    async criar(dados) {
        const response = await api.post('/usuarios', dados);
        return response.data;
    },

    async atualizar(id, dados) {
        const response = await api.put(`/usuarios/${id}`, dados);
        return response.data;
    },

    async desativar(id) {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    },
};

export const equipamentoService = {
    async listar() {
        const response = await api.get('/equipamentos');
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/equipamentos/${id}`);
        return response.data;
    },

    async criar(dados) {
        const response = await api.post('/equipamentos', dados);
        return response.data;
    },

    async atualizar(id, dados) {
        const response = await api.put(`/equipamentos/${id}`, dados);
        return response.data;
    },

    async descartar(id) {
        const response = await api.delete(`/equipamentos/${id}`);
        return response.data;
    },

    async movimentar(id, dados) {
        const response = await api.post(`/movimentacoes`, {
            equipamento_id: id,
            ...dados
        });
        return response.data;
    },
};

export const movimentacaoService = {
    async listar(filtros) {
        const params = new URLSearchParams(filtros);
        const response = await api.get(`/movimentacoes?${params}`);
        return response.data;
    },

    async buscarPorId(id) {
        const response = await api.get(`/movimentacoes/${id}`);
        return response.data;
    },

    async criar(dados) {
        const response = await api.post('/movimentacoes', dados);
        return response.data;
    },

    async listarPorEquipamento(equipamentoId) {
        const response = await api.get(`/movimentacoes/equipamento/${equipamentoId}`);
        return response.data;
    },

    async listarPorUsuario(usuarioId) {
        const response = await api.get(`/movimentacoes/usuario/${usuarioId}`);
        return response.data;
    },
};
