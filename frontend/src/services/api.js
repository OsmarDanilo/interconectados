import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Gerar ID de sessão único (persiste no localStorage)
const getSessionId = () => {
    let sessionId = localStorage.getItem('session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('session_id', sessionId);
        console.log('Nova sessão criada:', sessionId);
    }
    return sessionId;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': getSessionId()
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Garantir que o sessionId está sempre presente
    config.headers['X-Session-Id'] = getSessionId();
    return config;
});

export default api;