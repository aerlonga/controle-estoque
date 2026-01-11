import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'

const api: AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
            // Token expirado ou inválido
            localStorage.removeItem('token')
            localStorage.removeItem('usuario')
            localStorage.removeItem('auth-storage')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

export default api
