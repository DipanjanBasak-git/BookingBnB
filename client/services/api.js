import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});

// ─── Request Interceptor: Attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('bnb_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Response Interceptor: Handle 401 ────────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            if (typeof window !== 'undefined') {
                const refreshToken = localStorage.getItem('bnb_refresh');
                if (refreshToken) {
                    try {
                        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                        const newToken = data.data.accessToken;
                        localStorage.setItem('bnb_token', newToken);
                        original.headers.Authorization = `Bearer ${newToken}`;
                        return api(original);
                    } catch {
                        localStorage.removeItem('bnb_token');
                        localStorage.removeItem('bnb_refresh');
                        window.location.href = '/auth';
                    }
                }
            }
        }
        return Promise.reject(error);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
};

// ─── Listings ─────────────────────────────────────────────────────────────────
export const listingsApi = {
    getAll: (params) => api.get('/listings', { params }),
    getFeatured: (params) => api.get('/listings/featured', { params }),
    getById: (id) => api.get(`/listings/${id}`),
    create: (data) => api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id, data) => api.put(`/listings/${id}`, data),
    delete: (id) => api.delete(`/listings/${id}`),
    togglePublish: (id, isPublished) => api.patch(`/listings/${id}/publish`, { isPublished }),
    getHostListings: (params) => api.get('/listings/host/my-listings', { params }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsApi = {
    create: (data) => api.post('/bookings', data),
    confirm: (data) => api.post('/bookings/confirm', data),
    cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
    getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
    getHostBookings: (params) => api.get('/bookings/host', { params }),
    getById: (id) => api.get(`/bookings/${id}`),
    checkAvailability: (params) => api.get('/bookings/availability', { params }),
};

// ─── Reviews ──────────────────────────────────────────────────────────────────
export const reviewsApi = {
    getListing: (listingId, params) => api.get(`/reviews/listing/${listingId}`, { params }),
    create: (data) => api.post('/reviews', data),
    edit: (id, data) => api.put(`/reviews/${id}`, data),
    reply: (id, reply) => api.post(`/reviews/${id}/reply`, { reply }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
    getMe: () => api.get('/users/me'),
    update: (data) => api.put('/users/me', data),
    submitVerification: (formData) => api.post('/users/verify', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    getWishlist: () => api.get('/users/wishlist'),
    toggleWishlist: (listingId) => api.post(`/users/wishlist/${listingId}`),
    getPendingVerifications: () => api.get('/users/verifications/pending'),
    reviewVerification: (id, data) => api.post(`/users/verifications/${id}`, data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
    guest: () => api.get('/dashboard/guest'),
    host: () => api.get('/dashboard/host'),
    admin: () => api.get('/dashboard/admin'),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsApi = {
    createIntent: (data) => api.post('/payments/create-intent', data),
    verify: (data) => api.post('/payments/verify', data),
};

export default api;
