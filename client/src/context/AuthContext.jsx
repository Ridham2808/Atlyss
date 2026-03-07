import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('atlyss_token');
            if (!token) { setLoading(false); return; }
            try {
                const { data } = await api.get('/auth/me');
                setUser(data.user);
            } catch {
                localStorage.removeItem('atlyss_token');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('atlyss_token', data.token);
            setUser(data.user);
            toast.success(`Welcome back, ${data.user.name}!`);
            return data.user;
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
            toast.error(msg);
            throw err;
        }
    };

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('atlyss_token', data.token);
        setUser(data.user);
        toast.success('Account created successfully!');
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('atlyss_token');
        setUser(null);
        toast.success('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
