import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import { authClient } from '../services/auth-client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('ftmm_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            console.log("🔐 initAuth: Checking session...");

            // Safety timeout after 5 seconds
            const timeout = setTimeout(() => {
                console.warn("⏳ initAuth: Session check taking too long, proceeding...");
                setLoading(false);
            }, 5000);

            try {
                // ... session check logic ...
                const { data: session } = await authClient.getSession();
                if (session) {
                    console.log("✅ initAuth: Session found:", session.user.email);
                    setUser(session.user);
                    localStorage.setItem('ftmm_user', JSON.stringify(session.user));
                    socket.connect();
                    clearTimeout(timeout);
                    setLoading(false);
                    return;
                }
                console.log("ℹ️ initAuth: No session found");

                // 2. Check Legacy Token
                const token = localStorage.getItem('ftmm_token');
                if (token) {
                    console.log("🔑 initAuth: Checking legacy token...");
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);
                    localStorage.setItem('ftmm_user', JSON.stringify(res.data.user));
                    socket.connect();
                }
            } catch (err) {
                console.error("❌ initAuth error:", err);
                // logout(); // Don't logout on init error unless it's a 401
            } finally {
                clearTimeout(timeout);
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('ftmm_token', token);
        localStorage.setItem('ftmm_user', JSON.stringify(user));
        setUser(user);
        socket.connect();
        return user;
    };

    const register = async (data) => {
        const res = await api.post('/auth/register', data);
        const { token, user } = res.data;
        localStorage.setItem('ftmm_token', token);
        localStorage.setItem('ftmm_user', JSON.stringify(user));
        setUser(user);
        socket.connect();
        return user;
    };

    const logout = async () => {
        await authClient.signOut();
        localStorage.removeItem('ftmm_token');
        localStorage.removeItem('ftmm_user');
        setUser(null);
        socket.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
