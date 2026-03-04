import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isLoading: false,
            error: null,

            setUser: (user) => set({ user }),
            setTokens: (token, refreshToken) => {
                set({ token, refreshToken });
                if (typeof window !== 'undefined') {
                    localStorage.setItem('bnb_token', token);
                    if (refreshToken) localStorage.setItem('bnb_refresh', refreshToken);
                }
            },

            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await authApi.login(credentials);
                    const { user, accessToken, refreshToken } = data.data;
                    set({ user, token: accessToken, refreshToken, isLoading: false });
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('bnb_token', accessToken);
                        localStorage.setItem('bnb_refresh', refreshToken);
                    }
                    return { success: true };
                } catch (err) {
                    const msg = err.response?.data?.message || 'Login failed';
                    set({ error: msg, isLoading: false });
                    return { success: false, message: msg };
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await authApi.register(userData);
                    const { user, accessToken, refreshToken } = data.data;
                    set({ user, token: accessToken, refreshToken, isLoading: false });
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('bnb_token', accessToken);
                        localStorage.setItem('bnb_refresh', refreshToken);
                    }
                    return { success: true };
                } catch (err) {
                    const msg = err.response?.data?.message || 'Registration failed';
                    set({ error: msg, isLoading: false });
                    return { success: false, message: msg };
                }
            },

            logout: async () => {
                try { await authApi.logout(); } catch { }
                set({ user: null, token: null, refreshToken: null });
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('bnb_token');
                    localStorage.removeItem('bnb_refresh');
                }
            },

            fetchMe: async () => {
                try {
                    const { data } = await authApi.getMe();
                    set({ user: data.data });
                } catch {
                    set({ user: null });
                }
            },

            clearError: () => set({ error: null }),

            isAuthenticated: () => !!get().token,
            isHost: () => get().user?.role === 'host',
            isAdmin: () => get().user?.role === 'admin',
            isGuest: () => get().user?.role === 'guest',
            isVerifiedHost: () => get().user?.role === 'host' && get().user?.isVerified,
        }),
        {
            name: 'bnb_auth',
            partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken }),
        }
    )
);

export default useAuthStore;
