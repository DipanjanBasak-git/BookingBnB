'use client';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, CheckCircle, Star, Heart, TrendingUp, Luggage, ClipboardList, BookMarked } from 'lucide-react';
import Navbar from '../../../components/Navbar/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { dashboardApi, usersApi } from '../../../services/api';
import useAuthStore from '../../../store/authStore';
import useWishlistStore from '../../../store/wishlistStore';
import ListingCard from '../../../components/ListingCard/ListingCard';
function useCountUp(target, duration = 1200) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!target) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                let t0 = null;
                const ease = (t) => 1 - Math.pow(1 - t, 3);
                const tick = (ts) => {
                    if (!t0) t0 = ts;
                    const p = Math.min((ts - t0) / duration, 1);
                    setVal(Math.floor(ease(p) * target));
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
                obs.disconnect();
            }
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [target, duration]);
    return [val, ref];
}

function StatCard({ label, rawValue, displayValue, icon, color, index }) {
    const [count, ref] = useCountUp(rawValue || 0);
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.28 }}
        >
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.05)', padding: '18px 20px' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {displayValue || count.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 5, fontWeight: 500 }}>{label}</div>
            </div>
        </motion.div>
    );
}

const STATUS_COLORS = {
    confirmed: { bg: '#D1FAE5', text: '#065F46' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
    pending: { bg: '#FEF3C7', text: '#92400E' },
};

function BookingCard({ b, type, index }) {
    const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.25 }}
            style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.05)', padding: '20px', display: 'flex', gap: 16, alignItems: 'center' }}
        >
            <img
                src={b.listing?.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200'}
                alt={b.listing?.title}
                style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>{b.listing?.title}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    {b.listing?.location?.city} · {fmt(b.checkIn)} – {fmt(b.checkOut)}
                </p>
                {b.confirmationCode && (
                    <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                        Ref: <strong style={{ color: 'var(--text-secondary)' }}>{b.confirmationCode}</strong>
                    </p>
                )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>
                    ₹{b.pricing?.totalPrice?.toLocaleString('en-IN')}
                </p>
                <span style={{ padding: '3px 9px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.text, textTransform: 'capitalize' }}>
                    {b.status}
                </span>
                {type === 'past' && !b.isReviewed && (
                    <div style={{ marginTop: 8 }}>
                        <Link href={`/reviews/new?bookingId=${b._id}&listingId=${b.listing?._id}`} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                            ★ Review
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

const TABS = [
    { key: 'upcoming', label: 'Upcoming', Icon: Calendar },
    { key: 'past', label: 'Past Stays', Icon: CheckCircle },
    { key: 'wishlist', label: 'Wishlists', Icon: BookMarked },
];

export default function GuestDashboard() {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    // Subscribe to ids so wishlist tab re-fetches when hearts are toggled
    const wishlistIds = useWishlistStore(state => state.ids);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(searchParams?.get('tab') || 'upcoming');
    const [wishlist, setWishlist] = useState([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    useEffect(() => {
        dashboardApi.guest()
            .then(r => setData(r.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (activeTab === 'wishlist') {
            setLoadingWishlist(true);
            usersApi.getWishlist()
                .then(res => setWishlist(res.data.data || []))
                .catch(() => { })
                .finally(() => setLoadingWishlist(false));
        }
    }, [activeTab, wishlistIds]); // re-fetch on tab switch AND when ids change

    return (
        <>
            <Navbar />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh', background: 'var(--bg-primary)' }}
            >
                <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>

                    {/* ── Header ───────────────────────────────────── */}
                    <div style={{ marginBottom: 40 }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                            My Dashboard
                        </p>
                        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                            Hello, {user?.name?.split(' ')[0]} 👋
                        </h1>
                    </div>

                    {/* ── Stats ─────────────────────────────────────── */}
                    {!loading && data?.stats && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 40 }}>
                            <StatCard index={0} label="Upcoming Trips" rawValue={data.upcomingBookings?.length || 0} icon={<Calendar size={16} />} color="var(--accent-primary)" />
                            <StatCard index={1} label="Past Stays" rawValue={data.stats.totalStays} icon={<CheckCircle size={16} />} color="#059669" />
                            <StatCard index={2} label="Reviews Written" rawValue={data.stats.reviewsWritten} icon={<Star size={16} />} color="#D97706" />
                            <StatCard index={3} label="Saved Listings" rawValue={data.stats.wishlistCount} icon={<Heart size={16} />} color="#E11D48" />
                            <StatCard index={4} label="Total Spent" rawValue={data.stats.totalSpent || 0} icon={<TrendingUp size={16} />} color="#555"
                                displayValue={`₹${((data.stats.totalSpent || 0) / 1000).toFixed(1)}K`}
                            />
                        </div>
                    )}

                    {/* ── Tabs ─────────────────────────────────────── */}
                    <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', marginBottom: 28 }}>
                        {TABS.map(tab => (
                            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                                padding: '10px 18px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: 13,
                                fontWeight: 600,
                                color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                borderBottom: `2px solid ${activeTab === tab.key ? 'var(--accent-primary)' : 'transparent'}`,
                                marginBottom: -1,
                                transition: 'color 150ms ease, border-color 150ms ease',
                                display: 'flex', alignItems: 'center', gap: 6,
                            }}>
                                <tab.Icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab content ──────────────────────────────── */}
                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'upcoming' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {data?.upcomingBookings?.length > 0 ? (
                                        data.upcomingBookings.map((b, i) => <BookingCard key={b._id} b={b} type="upcoming" index={i} />)
                                    ) : (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                                <Luggage size={52} strokeWidth={1.2} color="var(--text-tertiary)" />
                                            </div>
                                            <p style={{ fontWeight: 700, fontSize: 18 }}>No upcoming trips</p>
                                            <Link href="/listings" className="btn btn-primary" style={{ marginTop: 20 }}>Explore Listings</Link>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'past' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {data?.pastBookings?.length > 0 ? (
                                        data.pastBookings.map((b, i) => <BookingCard key={b._id} b={b} type="past" index={i} />)
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                                <ClipboardList size={52} strokeWidth={1.2} color="var(--text-tertiary)" />
                                            </div>
                                            <p style={{ fontWeight: 700, fontSize: 18 }}>No past stays yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                loadingWishlist ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 1fr))', gap: 18 }}>
                                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 300, borderRadius: 16 }} />)}
                                    </div>
                                ) : wishlist?.length > 0 ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(256px, 1fr))', gap: 18 }}>
                                        {wishlist.map(l => (
                                            <ListingCard key={l._id} listing={l} />
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                                            <BookMarked size={52} strokeWidth={1.2} color="var(--text-tertiary)" />
                                        </div>
                                        <p style={{ fontWeight: 700, fontSize: 18 }}>Your Wishlists</p>
                                        <p style={{ marginTop: 8, fontSize: 14 }}>Heart listings while browsing to save them here</p>
                                        <Link href="/listings" className="btn btn-secondary" style={{ marginTop: 20 }}>Browse Listings</Link>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </>
    );
}
