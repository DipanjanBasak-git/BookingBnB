import { create } from 'zustand';
import { usersApi } from '../services/api';

/**
 * Wishlist store — keeps a set of listing IDs that the current user has saved.
 * This allows ListingCard to instantly show the correct heart state without
 * an extra API call per card.
 */
const useWishlistStore = create((set, get) => ({
    /** Set of listing ID strings */
    ids: new Set(),
    loaded: false,
    loading: false,

    /** Load wishlist IDs from the server (call once on login / app mount) */
    load: async () => {
        if (get().loading || get().loaded) return;
        set({ loading: true });
        try {
            const res = await usersApi.getWishlist();
            const listings = res.data.data || [];
            set({ ids: new Set(listings.map(l => l._id)), loaded: true });
        } catch {
            set({ loaded: true });
        } finally {
            set({ loading: false });
        }
    },

    /** Optimistic toggle — flips the id in the local set immediately */
    toggle: (listingId) => {
        const ids = new Set(get().ids);
        if (ids.has(listingId)) {
            ids.delete(listingId);
        } else {
            ids.add(listingId);
        }
        set({ ids });
    },

    /** Sync store to server ground-truth (call after successful API toggle) */
    syncIds: (idArray) => {
        set({ ids: new Set(idArray) });
    },

    /** Check if a listing is in the wishlist */
    has: (listingId) => get().ids.has(listingId),

    /** Reset (on logout) */
    reset: () => set({ ids: new Set(), loaded: false }),
}));

export default useWishlistStore;
