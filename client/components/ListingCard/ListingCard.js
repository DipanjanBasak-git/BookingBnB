'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { usersApi } from '../../services/api';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';

const TYPE_COLORS = {
    property: { bg: '#F3F4F6', color: '#374151' },
    experience: { bg: '#F0FDF4', color: '#166534' },
    service: { bg: '#FFFBEB', color: '#92400E' },
};

const INR = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
});

function formatPrice(price, priceType) {
    if (!price) return '—';
    const suffix = priceType === 'per_person' ? '/person' : priceType === 'flat' ? '' : '/night';
    return `${INR.format(price)}${suffix}`;
}

export default function ListingCard({ listing, compact = false }) {
    const { isAuthenticated } = useAuthStore();
    const { load, loaded, syncIds } = useWishlistStore();

    const [imgLoaded, setImgLoaded] = useState(false);
    // Local state for the heart — immune to global store re-renders
    const [isWished, setIsWished] = useState(false);
    const [saving, setSaving] = useState(false);
    const initialised = useRef(false);

    // Load the wishlist store if not yet loaded
    useEffect(() => {
        if (isAuthenticated() && !loaded) {
            load();
        }
    }, []); // eslint-disable-line

    // Once the store finishes loading, initialise local state from it — once only
    useEffect(() => {
        if (loaded && !initialised.current) {
            initialised.current = true;
            const storeIds = useWishlistStore.getState().ids;
            setIsWished(storeIds.has(listing?._id));
        }
    }, [loaded, listing?._id]);

    const primaryImage = listing?.images?.[0]?.url ||
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
    const typeColors = TYPE_COLORS[listing?.type] || TYPE_COLORS.property;

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated() || saving) return;

        const next = !isWished;
        setIsWished(next);   // instant local flip — no global store involved
        setSaving(true);

        try {
            const res = await usersApi.toggleWishlist(listing._id);
            // Sync the global store with server truth so dashboard stays in sync
            const serverIds = res.data?.data?.wishlistIds;
            if (serverIds) {
                syncIds(serverIds);
                // Also reconcile local state with server truth
                setIsWished(serverIds.includes(listing._id));
            }
        } catch {
            setIsWished(!next); // revert on network error
        } finally {
            setSaving(false);
        }
    };

    return (
        <Link href={`/listings/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <motion.article
                whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.10)' }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-card)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    willChange: 'transform, box-shadow',
                }}
            >
                {/* Image */}
                <div style={{ position: 'relative', height: compact ? 180 : 220, overflow: 'hidden', background: '#EFEFEF' }}>
                    <img
                        src={primaryImage}
                        alt={listing.title}
                        onLoad={() => setImgLoaded(true)}
                        className={imgLoaded ? 'img-loaded' : ''}
                        style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            opacity: imgLoaded ? 1 : 0,
                            transition: 'transform 300ms ease',
                        }}
                        onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    />
                    {!imgLoaded && <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />}

                    {/* Category pill */}
                    <div style={{
                        position: 'absolute', top: 10, left: 10,
                        background: 'rgba(255,255,255,0.92)',
                        backdropFilter: 'blur(4px)',
                        color: typeColors.color,
                        padding: '3px 9px', borderRadius: 'var(--radius-pill)',
                        fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
                        zIndex: 1,
                    }}>
                        {listing.category
                            ? listing.category.charAt(0).toUpperCase() + listing.category.slice(1)
                            : listing.type?.charAt(0).toUpperCase() + listing.type?.slice(1)}
                    </div>

                    {/* Wishlist heart button */}
                    {isAuthenticated() && (
                        <button
                            onClick={handleWishlist}
                            disabled={saving}
                            style={{
                                position: 'absolute', top: 10, right: 10, zIndex: 10,
                                width: 34, height: 34,
                                background: isWished ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)',
                                backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: saving ? 'wait' : 'pointer',
                                boxShadow: isWished ? '0 2px 8px rgba(225,29,72,0.25)' : '0 1px 6px rgba(0,0,0,0.12)',
                                transition: 'transform 150ms ease, box-shadow 150ms ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Heart
                                size={16}
                                color={isWished ? '#E11D48' : '#666'}
                                fill={isWished ? '#E11D48' : 'none'}
                                strokeWidth={isWished ? 2.5 : 2}
                            />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={{ padding: compact ? '12px 14px' : '14px 16px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                        <h3 style={{
                            fontSize: 14, fontWeight: 600, lineHeight: 1.35,
                            color: 'var(--text-primary)', flex: 1,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                            {listing.title}
                        </h3>
                        {listing.reviewCount > 0 && (
                            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <span style={{ color: '#222', fontSize: 12 }}>★</span>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {listing.averageRating?.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>
                        {listing.location?.city}, {listing.location?.country}
                    </p>

                    {!compact && listing.capacity?.guests && (
                        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 1 }}>
                            Up to {listing.capacity.guests} guests
                            {listing.capacity.bedrooms ? ` · ${listing.capacity.bedrooms} bed` : ''}
                        </p>
                    )}

                    {/* Verified — small, muted, professional */}
                    {(listing.host?.isVerified || listing.hostVerified) && (
                        <div style={{ marginTop: 6, marginBottom: 0 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                Verified host
                            </span>
                        </div>
                    )}

                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatPrice(listing.pricing?.basePrice, listing.pricing?.priceType)}
                        </span>
                    </div>
                </div>
            </motion.article>
        </Link>
    );
}
