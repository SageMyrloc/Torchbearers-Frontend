import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('playerId');
            localStorage.removeItem('roles');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (data) => api.post('/api/auth/register', data),
    getMe: () => api.get('/api/auth/me'),
};

// Character endpoints
export const characterAPI = {
    getMyCharacters: () => api.get('/api/characters/my'),
    getCharacter: (id) => api.get(`/api/characters/${id}`),
    createCharacter: (data) => api.post('/api/characters', data),
    deleteCharacter: (id) => api.delete(`/api/characters/${id}`),
};

// DM endpoints
export const dmAPI = {
    getPendingCharacters: () => api.get('/api/dm/characters/pending'),
    getAllCharacters: () => api.get('/api/dm/characters/all'),
    approveCharacter: (id) => api.post(`/api/dm/characters/${id}/approve`),
    rejectCharacter: (id, reason) =>
        api.post(`/api/dm/characters/${id}/reject`, { reason }),
    updateCharacterStatus: (id, status) =>
        api.put(`/api/dm/characters/${id}/status`, { status }),
};

// Admin endpoints
export const adminAPI = {
    getUsers: () => api.get('/api/admin/users'),
    getUser: (id) => api.get(`/api/admin/users/${id}`),
    getRoles: () => api.get('/api/admin/roles'),
    assignRole: (userId, roleId) =>
        api.post(`/api/admin/users/${userId}/roles/${roleId}`),
    removeRole: (userId, roleId) =>
        api.delete(`/api/admin/users/${userId}/roles/${roleId}`),
};

export default api;