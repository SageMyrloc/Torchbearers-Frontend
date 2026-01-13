import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.getMe();
            setUser({
                username: response.data.username,
                playerId: response.data.id,
                roles: response.data.roles,
                discordId: response.data.discordId
            });
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        const { token, username, playerId, roles, discordId } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('playerId', playerId);
        localStorage.setItem('roles', JSON.stringify(roles));
        if (discordId) {
            localStorage.setItem('discordId', discordId);
        }

        setUser({ username, playerId, roles, discordId });
        setIsAuthenticated(true);

        return response.data;
    };

    const register = async (data) => {
        const response = await authAPI.register(data);
        const { token, username, playerId, roles, discordId } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        localStorage.setItem('playerId', playerId);
        localStorage.setItem('roles', JSON.stringify(roles));
        if (discordId) {
            localStorage.setItem('discordId', discordId);
        }

        setUser({ username, playerId, roles, discordId });
        setIsAuthenticated(true);

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('playerId');
        localStorage.removeItem('roles');
        localStorage.removeItem('discordId');
        setUser(null);
        setIsAuthenticated(false);
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                register,
                logout,
                hasRole,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};