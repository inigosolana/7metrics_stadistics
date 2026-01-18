
import axios, { AxiosInstance, AxiosError } from 'axios';

// Usa localhost como default si no hay env var
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Interceptor básico para logging de errores
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const url = error.config?.url || 'unknown';
        console.error(`API Error on ${url}:`, error.message);
        return Promise.reject(error);
    }
);
