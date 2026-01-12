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
            window.location.href = '/';
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
    updateCharacter: (id, data) => api.put(`/api/characters/${id}`, data),
    retireCharacter: (id) => api.post(`/api/characters/${id}/retire`),
    uploadCharacterImage: (id, formData) => api.post(`/api/characters/${id}/image`, formData),
};

// DM endpoints
export const dmAPI = {
    getPendingCharacters: () => api.get('/api/dm/characters/pending'),
    getAllCharacters: () => api.get('/api/dm/characters'),
    approveCharacter: (id) => api.post(`/api/dm/characters/${id}/approve`),
    killCharacter: (id) => api.post(`/api/dm/characters/${id}/kill`),
    activateCharacter: (id) => api.post(`/api/dm/characters/${id}/activate`),
};

// Admin endpoints - matches backend AdminController routes
export const adminAPI = {
    // GET /api/admin/players
    getUsers: () => api.get('/api/admin/players'),
    // GET /api/admin/roles
    getRoles: () => api.get('/api/admin/roles'),
    // POST /api/admin/players/{playerId}/roles/{roleId}
    assignRole: (playerId, roleId) =>
        api.post(`/api/admin/players/${playerId}/roles/${roleId}`),
    // DELETE /api/admin/players/{playerId}/roles/{roleId}
    removeRole: (playerId, roleId) =>
        api.delete(`/api/admin/players/${playerId}/roles/${roleId}`),
    // PUT /api/admin/characters/{id}/gold
    updateCharacterGold: (id, gold) =>
        api.put(`/api/admin/characters/${id}/gold`, { gold }),
    // PUT /api/admin/characters/{id}/experience
    updateCharacterExperience: (id, xp) =>
        api.put(`/api/admin/characters/${id}/experience`, { xp }),
    // DELETE /api/admin/characters/{id}
    deleteCharacter: (id) => api.delete(`/api/admin/characters/${id}`),
    // PUT /api/admin/players/{id}/slots
    updatePlayerSlots: (id, maxSlots) =>
        api.put(`/api/admin/players/${id}/slots`, { maxSlots }),
};

// Session endpoints (player-facing)
export const sessionAPI = {
    getUpcomingSessions: () => api.get('/api/sessions'),
    getSession: (id) => api.get(`/api/sessions/${id}`),
    getMySessions: () => api.get('/api/sessions/my'),
    signUp: (sessionId, characterId) =>
        api.post(`/api/sessions/${sessionId}/signup`, { characterId }),
    withdraw: (sessionId, characterId) =>
        api.delete(`/api/sessions/${sessionId}/signup/${characterId}`),
};

// DM Session endpoints
export const dmSessionAPI = {
    getMySessions: () => api.get('/api/dm/sessions'),
    createSession: (data) => api.post('/api/dm/sessions', data),
    updateSession: (id, data) => api.put(`/api/dm/sessions/${id}`, data),
    startSession: (id) => api.post(`/api/dm/sessions/${id}/start`),
    completeSession: (id, rewards) =>
        api.post(`/api/dm/sessions/${id}/complete`, rewards),
    cancelSession: (id) => api.post(`/api/dm/sessions/${id}/cancel`),
};

export default api;