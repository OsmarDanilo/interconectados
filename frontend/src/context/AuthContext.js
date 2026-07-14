import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { checkAuth(); }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        try {
            const res = await api.get('/auth/verify');
            if (res.data.success) setUser(res.data.user);
            else localStorage.removeItem('token');
        } catch { localStorage.removeItem('token'); }
        finally { setLoading(false); }
    };

    const login = async (identifier, password) => {
        try {
            const res = await api.post('/auth/login', { identifier, password });
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                setUser(res.data.user);
                toast.success('Login realizado!');
                return { success: true, user: res.data.user };
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Erro');
            return { success: false };
        }
    };

   const register = async (name, phone, password) => {
    try {
        const res = await api.post('/auth/register', { name, phone, password });
        if (res.data.success) {
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            toast.success('Cadastro realizado!');
            return { success: true, user: res.data.user };
        }
    } catch (error) {
        toast.error(error.response?.data?.error || 'Erro');
        return { success: false };
    }
};

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.success('Logout!');
    };

    return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};