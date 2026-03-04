'use client';
import { useEffect, useState, useRef } from 'react';
import { TrendingUp, Calendar, Home, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '../../../components/Navbar/Navbar';
import { dashboardApi, listingsApi } from '../../../services/api';
import useAuthStore from '../../../store/authStore';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── easeOutCubic count-up hook ─────────────────────────────── */
function useCountUp(target, duration = 1400) {
    const [val, setVal] = useState(0);
    const started = useRef(false);
    const ref = useRef(null);

    useEffect(() => {
        if (target === 0) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                let startTime = null;
                const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
                const tick = (ts) => {
                    if (!startTime) startTime = ts;
                    const progress = Math.min((ts - startTime) / duration, 1);
                    setVal(Math.floor(easeOutCubic(progress) * target));
                    if (progress < 1) requestAnimationFrame(tick);
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

/* ── Stat card ────────────────────────────────────────────────── */
function StatCard({ label, rawValue, displayValue, icon, color, index }) {
    const [count, ref] = useCountUp(rawValue || 0);
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3, ease: 'easeOut' }}
        >
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-card)',
                boxShadow: 'var(--shadow-card)',
                border: '1px solid rgba(0,0,0,0.05)',
                padding: '20px 22px',
            }}>
                <div style={{ marginBottom: 10, color: color }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {displayValue ? displayValue : count.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
                    {label}
                </div>
            </div>
        </motion.div>
    );
}

const TABS = ['overview', 'bookings', 'listings'];

export default function HostDashboard() {
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        dashboardApi.host()
            .then(r => setData(r.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const togglePublish = async (id, currentStatus) => {
        try {
            await listingsApi.togglePublish(id, !currentStatus);
            // Optmistic UI Update
            setData(prev => ({
                ...prev,
                listings: prev.listings.map(l => l._id === id ? { ...l, isPublished: !currentStatus } : l)
            }));
        } catch (err) {
            console.error('Failed to toggle publish status');
        }
    };

    const chartData = data?.monthlyEarnings?.map(m => ({
        name: MONTHS[m.month - 1],
        Earnings: m.earnings,
        Bookings: m.bookings,
    })) || [];

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

                    {/* ── Header ────────────────────────────────────── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                                Host Dashboard
                            </p>
                            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                                Welcome back, {user?.name?.split(' ')[0]}
                            </h1>
                            {user?.isVerified ? (
                                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0FDF4', color: '#166534', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, border: '1px solid #BBF7D0' }}>
                                    Verified Host
                                </div>
                            ) : (
                                <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F3F4F6', color: '#6B7280', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 12, fontWeight: 600, border: '1px solid #E5E7EB' }}>
                                    Verification coming soon
                                </div>
                            )}
                        </div>
                        <Link href="/host/create-listing" className="btn btn-primary">
                            + New Listing
                        </Link>
                    </div>

                    {/* ── Tabs ──────────────────────────────────────── */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--border-subtle)' }}>
                        {TABS.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '10px 20px',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: 13,
                                fontWeight: 600,
                                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                borderBottom: `2px solid ${activeTab === tab ? 'var(--accent-primary)' : 'transparent'}`,
                                marginBottom: -1,
                                transition: 'color 150ms ease, border-color 150ms ease',
                                letterSpacing: '0.01em',
                                textTransform: 'capitalize',
                            }}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ── Stat cards ────────────────────────────────── */}
                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                            <StatCard index={0} label="Total Revenue" rawValue={data?.stats?.totalRevenue || 0} displayValue={`₹${((data?.stats?.totalRevenue || 0) / 100000).toFixed(1)}L`} icon={<TrendingUp size={18} />} color="var(--accent-primary)" />
                            <StatCard index={1} label="Total Bookings" rawValue={data?.stats?.totalBookings || 0} icon={<Calendar size={18} />} color="#059669" />
                            <StatCard index={2} label="Active Listings" rawValue={data?.stats?.publishedListings || 0} icon={<Home size={18} />} color="#D97706" />
                            <StatCard index={3} label="Total Listings" rawValue={data?.stats?.totalListings || 0} icon={<ClipboardList size={18} />} color="#555" />
                        </div>
                    )}

                    {/* ── Overview tab ──────────────────────────────── */}
                    {activeTab === 'overview' && !loading && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                            {/* Earnings chart */}
                            {chartData.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35, duration: 0.3 }}
                                    style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.05)', padding: '24px 28px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div>
                                            <h2 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Earnings Overview</h2>
                                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Monthly breakdown</p>
                                        </div>
                                    </div>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
                                            <defs>
                                                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#F3F4F6" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip
                                                contentStyle={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 10, boxShadow: 'var(--shadow-md)', fontSize: 13 }}
                                                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Earnings']}
                                            />
                                            <Area type="monotone" dataKey="Earnings" stroke="#4F46E5" strokeWidth={2} fill="url(#earningsGrad)" isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#4F46E5' }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* Recent bookings */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.45, duration: 0.3 }}
                                style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.05)', overflow: 'hidden' }}
                            >
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 style={{ fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Recent Bookings</h2>
                                </div>
                                {data?.recentBookings?.length > 0 ? data.recentBookings.map((b, i) => (
                                    <motion.div key={b._id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.06 }}
                                        style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{b.listing?.title}</p>
                                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                                {b.guest?.name} · {new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(b.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>₹{b.pricing?.totalPrice?.toLocaleString('en-IN')}</p>
                                            <span style={{
                                                display: 'inline-flex',
                                                marginTop: 4,
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-pill)',
                                                fontSize: 10,
                                                fontWeight: 600,
                                                background: b.status === 'confirmed' ? '#D1FAE5' : b.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                                                color: b.status === 'confirmed' ? '#065F46' : b.status === 'cancelled' ? '#991B1B' : '#92400E',
                                                textTransform: 'capitalize',
                                            }}>
                                                {b.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <p style={{ fontWeight: 600 }}>No bookings yet</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}

                    {/* ── Listings tab ──────────────────────────────── */}
                    {activeTab === 'listings' && !loading && (
                        <div>
                            {data?.listings?.length > 0 ? data.listings.map((l, i) => (
                                <motion.div key={l._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.07, duration: 0.25 }}
                                    style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(0,0,0,0.05)', padding: '16px 20px', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 150ms ease' }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                                >
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{l.title}</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                                            {l.type} · ★ {l.averageRating?.toFixed(1) || '—'} · {l.reviewCount} reviews · {l.totalBookings} bookings
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <button
                                            onClick={() => togglePublish(l._id, l.isPublished)}
                                            style={{
                                                padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 150ms ease',
                                                background: l.isPublished ? '#D1FAE5' : '#F3F4F6', color: l.isPublished ? '#065F46' : '#6B7280',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
                                            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                                        >
                                            {l.isPublished ? 'Published' : 'Draft'}
                                        </button>
                                        <Link href={`/host/edit-listing/${l._id}`} className="btn btn-ghost btn-sm">Edit</Link>
                                        <Link href={`/listings/${l._id}`} className="btn btn-ghost btn-sm" target="_blank">View</Link>
                                    </div>
                                </motion.div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontWeight: 700, fontSize: 18 }}>No listings yet</p>
                                    <Link href="/host/create-listing" className="btn btn-primary" style={{ marginTop: 20 }}>Create your first listing</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
