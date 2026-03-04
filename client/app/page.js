'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import ListingCard from '../components/ListingCard/ListingCard';
import DateRangePicker from '../components/DateRangePicker/DateRangePicker';
import GuestSelector from '../components/GuestSelector/GuestSelector';
import { listingsApi } from '../services/api';

/* ─── Cinematic image strip URLs ────────────────────────────────────────────── */
const STRIP_IMAGES = [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=420&q=80', // mountain hotel
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=420&q=80', // resort pool
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=420&q=80', // rooftop
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=420&q=80', // hotel facade
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=420&q=80', // valley view
    'https://images.unsplash.com/photo-1455587734955-081b22074882?w=420&q=80', // lobby
    'https://images.unsplash.com/photo-1586611292717-f828b167408c?w=420&q=80', // beachfront
    'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=420&q=80', // forest cabin
    'https://images.unsplash.com/photo-1531088009183-5ff5b7c95f91?w=420&q=80', // heritage
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=420&q=80', // villa terrace
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=420&q=80', // penthouse
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=420&q=80', // desert resort
];

/* Interleave into two columns */
const COL_A = STRIP_IMAGES.filter((_, i) => i % 2 === 0);
const COL_B = STRIP_IMAGES.filter((_, i) => i % 2 === 1);

const STATS = [
    { value: '10,000+', label: 'Listings' },
    { value: '50,000+', label: 'Guests served' },
    { value: '1,200+', label: 'Verified hosts' },
    { value: '4.9', label: 'Average rating' },
];

const CATEGORIES = [
    { key: null, label: 'All' },
    { key: 'property', label: 'Homes' },
    { key: 'experience', label: 'Experiences' },
    { key: 'service', label: 'Services' },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function fmt(d) {
    return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '';
}
function guestStr(g) {
    const n = (g.adults || 0) + (g.children || 0);
    if (!n) return 'Add guests';
    return `${n} guest${n !== 1 ? 's' : ''}${g.infants ? `, ${g.infants} infant${g.infants !== 1 ? 's' : ''}` : ''}`;
}

/* ─── Image strip column ─────────────────────────────────────────────────────── */
function ImageColumn({ images, duration, delay = 0 }) {
    return (
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <div style={{
                animation: `stripScroll ${duration}s linear ${delay}s infinite`,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
            }}>
                {/* Double images for seamless loop */}
                {[...images, ...images].map((src, i) => (
                    <div key={i} style={{
                        borderRadius: 14,
                        overflow: 'hidden',
                        height: 180,
                        flexShrink: 0,
                        background: '#F0EDE8',
                    }}>
                        <img src={src} alt="" loading="lazy" style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            display: 'block',
                            filter: 'brightness(0.92) saturate(0.88)',
                        }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─── Main ───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
    const router = useRouter();
    const { scrollY } = useScroll();

    /* Morphing search transforms */
    const scale = useTransform(scrollY, [0, 140], [1, 0.86]);
    const yMotion = useTransform(scrollY, [0, 140], [0, -28]);
    const pillRadius = useTransform(scrollY, [0, 120], [40, 999]);
    const compactOpacity = useTransform(scrollY, [50, 130], [0, 1]);
    const fullOpacity = useTransform(scrollY, [50, 130], [1, 0]);
    const heroOpacity = useTransform(scrollY, [0, 220], [1, 0.72]);

    /* State */
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0 });
    const [activePanel, setActivePanel] = useState(null); // 'where'|'dates'|'guests'
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState(null);
    const [statsVis, setStatsVis] = useState(false);

    const searchRef = useRef(null);
    const datesRef = useRef(null);   // anchor for DateRangePicker
    const guestsRef = useRef(null);   // anchor for GuestSelector
    const statsRef = useRef(null);
    const panelRef = useRef(null); // ref for the portal panel itself
    const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });

    /* Fetch featured */
    const fetchFeatured = useCallback(async (type) => {
        setLoading(true);
        try {
            const p = { limit: 8 };
            if (type) p.type = type;
            const { data } = await listingsApi.getFeatured(p);
            setFeatured(data.data || []);
        } catch { setFeatured([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchFeatured(null); }, []);

    /* Stats intersection */
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setStatsVis(true); obs.disconnect(); }
        }, { threshold: 0.3 });
        if (statsRef.current) obs.observe(statsRef.current);
        return () => obs.disconnect();
    }, []);

    /* Close panels on outside click — checks both search bar and portal panel */
    useEffect(() => {
        const fn = (e) => {
            // Don't close if clicking inside searchRef or the portal panel
            if (searchRef.current && searchRef.current.contains(e.target)) return;
            if (panelRef.current && panelRef.current.contains(e.target)) return;
            setActivePanel(null);
        };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    /* Compute panel anchor — smart flip: opens above when not enough space below */
    const openPanel = (id) => {
        if (searchRef?.current) {
            const r = searchRef.current.getBoundingClientRect();
            // Estimated panel heights
            const estimatedHeight = id === 'dates' ? 430 : 320;
            const spaceBelow = window.innerHeight - r.bottom - 16;
            const spaceAbove = r.top - 16;

            let top;
            if (spaceBelow >= estimatedHeight || spaceBelow >= spaceAbove) {
                // Open downward
                top = r.bottom + 10;
            } else {
                // Flip upward: panel bottom aligns to top of search bar
                top = r.top - estimatedHeight - 10;
            }

            setPanelPos({
                top: Math.max(8, top),
                left: r.left,
                width: r.width,
                maxHeight: Math.min(estimatedHeight, window.innerHeight - 32),
            });
        }
        setActivePanel(prev => prev === id ? null : id);
    };

    const handleSearch = () => {
        setActivePanel(null);
        const p = new URLSearchParams();
        if (location) p.set('city', location);
        if (startDate) p.set('checkIn', startDate.toISOString().split('T')[0]);
        if (endDate) p.set('checkOut', endDate.toISOString().split('T')[0]);
        const n = (guests.adults || 0) + (guests.children || 0);
        if (n > 1) p.set('guests', n);
        router.push(`/listings?${p.toString()}`);
    };

    const panelActive = (id) => ({
        background: activePanel === id ? '#fff' : 'transparent',
        boxShadow: activePanel === id ? '0 2px 14px rgba(0,0,0,0.10)' : 'none',
        borderRadius: 36,
        cursor: 'pointer',
        padding: '10px 20px',
        transition: 'background 120ms ease, box-shadow 120ms ease',
        position: 'relative',
    });

    return (
        <>
            <Navbar />

            {/* ── Strip animation keyframes ────────────────────────────── */}
            <style>{`
        @keyframes stripScroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        .strip-wrap:hover > div { animation-play-state: paused !important; }
      `}</style>

            <motion.main style={{ background: '#fff' }}>

                {/* ═══════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════ */}
                <section style={{
                    minHeight: '100vh',
                    paddingTop: 'var(--navbar-height)',
                    display: 'flex',
                    overflow: 'hidden',
                    background: '#fff',
                }}>
                    {/* Left content */}
                    <motion.div style={{ opacity: heroOpacity, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 'max(40px, calc((100vw - 1280px) / 2 + 24px))', paddingRight: 40, paddingTop: 48, paddingBottom: 64 }}>

                        {/* Eyebrow */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#FFF1F2', color: '#E11D48', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 24, textTransform: 'uppercase', width: 'fit-content' }}>
                            Premium booking platform
                        </motion.div>

                        {/* Headline */}
                        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                            style={{ fontSize: 'clamp(42px, 5.5vw, 68px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 8, maxWidth: 600 }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.72em' }}>Find your</span><br />
                            <span style={{ fontWeight: 800 }}>Stays, Experiences</span><br />
                            <span style={{ fontWeight: 800 }}>&#38; Services</span>
                        </motion.h1>

                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                            style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 440, marginBottom: 48 }}>
                            Curated properties, immersive experiences, and on-demand services from verified hosts across India.
                        </motion.p>

                        {/* ── Morphing search bar ─────────────── */}
                        <div style={{ height: 96, position: 'relative', zIndex: 99999 }}>
                            <motion.div
                                ref={searchRef}
                                style={{
                                    scale, y: yMotion,
                                    transformOrigin: 'left center',
                                    position: 'absolute', left: 0, right: 0,
                                    borderRadius: pillRadius,
                                }}
                            >
                                <div style={{
                                    background: '#F7F7F7',
                                    borderRadius: 'inherit',
                                    border: '1px solid var(--border-subtle)',
                                    boxShadow: activePanel ? '0 6px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 66,
                                    padding: '4px',
                                    maxWidth: 820,
                                    position: 'relative',
                                    overflow: 'visible',
                                }}>

                                    {/* ── COMPACT LABEL (appears on scroll) ── */}
                                    <motion.div style={{ opacity: compactOpacity, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', paddingLeft: 22, pointerEvents: 'none' }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {location || 'Anywhere'}&nbsp;·&nbsp;
                                            {startDate ? `${fmt(startDate)}${endDate ? ` – ${fmt(endDate)}` : ''}` : 'Anytime'}&nbsp;·&nbsp;
                                            {guestStr(guests)}
                                        </span>
                                    </motion.div>

                                    {/* ── FULL LABELS (visible when at top) ── */}
                                    <motion.div style={{ opacity: fullOpacity, display: 'flex', flex: 1, alignItems: 'center' }}>

                                        {/* WHERE */}
                                        <div style={panelActive('where')} onClick={() => setActivePanel('where')}>
                                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 3 }}>Where</div>
                                            <input value={location} onChange={e => setLocation(e.target.value)}
                                                onClick={() => setActivePanel('where')} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                                placeholder="Search destinations"
                                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', color: 'var(--text-primary)', width: 160, cursor: 'text' }} />
                                        </div>

                                        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)', flexShrink: 0 }} />

                                        {/* CHECK IN */}
                                        <div ref={datesRef} style={panelActive('dates')} onClick={() => openPanel('dates')}>
                                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 3 }}>Check in</div>
                                            <span style={{ fontSize: 13, color: startDate ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: startDate ? 500 : 400 }}>
                                                {startDate ? fmt(startDate) : 'Add dates'}
                                            </span>
                                        </div>

                                        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)', flexShrink: 0 }} />

                                        {/* CHECK OUT */}
                                        <div style={panelActive('checkout')} onClick={() => setActivePanel('dates')}>
                                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 3 }}>Check out</div>
                                            <span style={{ fontSize: 13, color: endDate ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: endDate ? 500 : 400 }}>
                                                {endDate ? fmt(endDate) : 'Add dates'}
                                            </span>
                                        </div>

                                        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)', flexShrink: 0 }} />

                                        {/* WHO */}
                                        <div ref={guestsRef} style={{ ...panelActive('guests'), flex: 1 }} onClick={() => openPanel('guests')}>
                                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 3 }}>Who</div>
                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{guestStr(guests)}</span>
                                        </div>
                                    </motion.div>

                                    {/* SEARCH BUTTON */}
                                    <button onClick={handleSearch}
                                        style={{
                                            flexShrink: 0, width: 52, height: 52,
                                            background: '#E11D48', border: 'none', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', margin: '0 5px 0 8px',
                                            boxShadow: '0 2px 8px rgba(225,29,72,0.28)',
                                            transition: 'background 120ms ease, transform 100ms ease',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = '#BE123C'; e.currentTarget.style.transform = 'scale(1.07)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#E11D48'; e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <Search size={20} color="#fff" strokeWidth={2.5} />
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Fixed-position portals — escape transform stacking context ── */}
                        {activePanel === 'dates' && typeof document !== 'undefined' &&
                            createPortal(
                                <div ref={panelRef} style={{
                                    position: 'fixed',
                                    top: panelPos.top,
                                    left: Math.max(8, panelPos.left),
                                    zIndex: 2147483647,
                                    maxWidth: 'calc(100vw - 16px)',
                                    maxHeight: panelPos.maxHeight || '80vh',
                                    overflowY: 'auto',
                                    borderRadius: 20,
                                }}>
                                    <DateRangePicker
                                        startDate={startDate} endDate={endDate}
                                        onChange={({ startDate: s, endDate: e }) => { setStartDate(s); setEndDate(e); }}
                                        onClose={() => setActivePanel(null)}
                                    />
                                </div>,
                                document.body
                            )
                        }
                        {activePanel === 'guests' && typeof document !== 'undefined' &&
                            createPortal(
                                <div ref={panelRef} style={{
                                    position: 'fixed',
                                    top: panelPos.top,
                                    left: Math.max(8, Math.min(
                                        panelPos.left + (panelPos.width || 0) - 320,
                                        window.innerWidth - 336
                                    )),
                                    zIndex: 2147483647,
                                    maxHeight: panelPos.maxHeight || '80vh',
                                    overflowY: 'auto',
                                    borderRadius: 20,
                                }}>
                                    <GuestSelector
                                        value={guests} onChange={setGuests}
                                        onClose={() => setActivePanel(null)}
                                    />
                                </div>,
                                document.body
                            )
                        }

                    </motion.div>

                    {/* Right: Cinematic image strip ─────────────────────────── */}
                    <div style={{
                        width: '38%',
                        minWidth: 340,
                        flexShrink: 0,
                        height: '100vh',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        gap: 10,
                        padding: '24px 24px 24px 0',
                    }}
                        className="strip-wrap"
                    >
                        {/* Top fade mask */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, #fff 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
                        {/* Bottom fade mask */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to top, #fff 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />

                        <ImageColumn images={COL_A} duration={25} delay={0} />
                        <ImageColumn images={COL_B} duration={25} delay={-12} />
                    </div>
                </section>

                {/* ═════════════ STATS BAND ════════════════════════════════ */}
                <section ref={statsRef} style={{ background: '#FAFAFA', padding: '24px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="container" style={{ display: 'flex', gap: 52, flexWrap: 'wrap' }}>
                        {STATS.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={statsVis ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.07 }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ═════════════ FEATURED LISTINGS ════════════════════════ */}
                <section style={{ padding: '56px 0 48px', background: '#fff' }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
                            <div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
                                    {activeType ? `${activeType.charAt(0).toUpperCase() + activeType.slice(1)}s` : 'Featured across India'}
                                </h2>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Hand-picked by our team</p>
                            </div>
                            <Link href="/listings" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                                View all <ChevronRight size={14} />
                            </Link>
                        </div>

                        {/* Category chips */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
                            {CATEGORIES.map(c => (
                                <button key={c.key} onClick={() => { setActiveType(c.key); fetchFeatured(c.key); }}
                                    className={`chip ${activeType === c.key ? 'active' : ''}`} style={{ fontFamily: 'inherit' }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {/* Cards */}
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="sk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid-4">
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-card)' }}>
                                            <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
                                            <div style={{ padding: 14 }}>
                                                <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                                                <div className="skeleton" style={{ height: 11, width: '50%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : featured.length > 0 ? (
                                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid-4">
                                    {featured.map((listing, i) => (
                                        <motion.div key={listing._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                            <ListingCard listing={listing} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No listings yet</p>
                                    <p style={{ fontSize: 14 }}>Run the seed script to populate demo data</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* ═════════════ HOST CTA ══════════════════════════════════ */}
                <section style={{ background: '#1A1A1A', padding: '80px 0' }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
                        <div style={{ maxWidth: 520 }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 14 }}>For Hosts</p>
                            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 800, color: '#fff', lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 12 }}>
                                Share your space,<br />earn on your terms
                            </h2>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.50)', lineHeight: 1.65, maxWidth: 420 }}>
                                Join 1,200+ verified hosts on BookingBnB. Full control over pricing, availability, and guests.
                            </p>
                        </div>
                        <Link href="/auth?mode=register&role=host"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#1A1A1A', padding: '13px 24px', borderRadius: 'var(--radius-button)', fontWeight: 700, fontSize: 14, flexShrink: 0, transition: 'transform 150ms ease, box-shadow 150ms ease', boxShadow: '0 4px 16px rgba(0,0,0,0.20)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.30)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.20)'; }}
                        >
                            Become a host <ChevronRight size={15} />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer style={{ background: '#111', padding: '48px 0 28px' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 36, marginBottom: 36 }}>
                            <div style={{ maxWidth: 180 }}>
                                <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.03em', marginBottom: 10 }}>BookingBnB</div>
                                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>Premium multi-service booking marketplace. Verified hosts. Curated stays.</p>
                            </div>
                            {[
                                { title: 'Platform', links: [{ label: 'Homes', href: '/listings?type=property' }, { label: 'Experiences', href: '/listings?type=experience' }, { label: 'Services', href: '/listings?type=service' }] },
                                { title: 'Hosting', links: [{ label: 'Become a Host', href: '/auth?mode=register&role=host' }, { label: 'Host Dashboard', href: '/dashboard/host' }] },
                                { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: 'Contact', href: '/contact' }] },
                            ].map(col => (
                                <div key={col.title}>
                                    <h4 style={{ fontSize: 10, fontWeight: 700, color: '#fff', marginBottom: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{col.title}</h4>
                                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                        {col.links.map(({ label, href }) => (
                                            <li key={label}><Link href={href || '#'} style={{ fontSize: 13, color: '#555', transition: 'color 120ms' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#555'}>{label}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div style={{ borderTop: '1px solid #222', paddingTop: 20, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                            <p style={{ fontSize: 12, color: '#444' }}>© 2026 BookingBnB. All rights reserved. Made by Dipanjan Basak</p>
                            <div style={{ display: 'flex', gap: 16 }}>
                                {[
                                    { label: 'Privacy', href: '/privacy' },
                                    { label: 'Terms', href: '/terms' },
                                    { label: 'Cookies', href: '/cookies' },
                                ].map(({ label, href }) => (
                                    <Link key={label} href={href} style={{ fontSize: 12, color: '#444', transition: 'color 120ms' }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#777'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#444'}>{label}</Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </footer>

            </motion.main>
        </>
    );
}
