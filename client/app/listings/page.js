'use client';
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Map, List, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import ListingCard from '../../components/ListingCard/ListingCard';
import { listingsApi } from '../../services/api';

// ── Lazy-load map (client only, never SSR) ────────────────────────────────────
const ListingsMap = dynamic(
    () => import('../../components/ListingsMap/ListingsMap'),
    {
        ssr: false, loading: () => (
            <div style={{ width: '100%', height: '100%', background: '#F0EDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 13, color: '#9A9A9A', fontWeight: 500 }}>Loading map…</div>
            </div>
        )
    }
);

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const TYPES = [
    { value: '', label: 'All' },
    { value: 'property', label: 'Homes' },
    { value: 'experience', label: 'Experiences' },
    { value: 'service', label: 'Services' },
];

function FilterSidebar({ filters, setFilters, show, onClose }) {
    const update = (k, v) => setFilters(p => ({ ...p, [k]: v }));
    const clear = () => setFilters({ type: '', city: '', checkIn: '', checkOut: '', guests: '', minPrice: '', maxPrice: '', minRating: '', sortBy: '' });

    const inputStyle = {
        width: '100%', padding: '9px 12px',
        border: '1.5px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13, outline: 'none',
        fontFamily: 'inherit', background: '#fff',
        transition: 'border-color 120ms ease',
    };

    return (
        <aside style={{
            width: 280,
            flexShrink: 0,
            background: '#fff',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)',
            border: '1px solid var(--border-subtle)',
            padding: 20,
            position: 'sticky',
            top: 'calc(var(--navbar-height) + 16px)',
            maxHeight: 'calc(100vh - var(--navbar-height) - 40px)',
            overflowY: 'auto',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Filters</h3>
                <button onClick={clear} style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                    Clear all
                </button>
            </div>

            {/* Type */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10, color: 'var(--text-secondary)' }}>Type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {TYPES.map(t => (
                        <button key={t.value} onClick={() => update('type', t.value)}
                            style={{
                                padding: '5px 13px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
                                background: filters.type === t.value ? 'var(--text-primary)' : '#fff',
                                color: filters.type === t.value ? '#fff' : 'var(--text-secondary)',
                                border: `1.5px solid ${filters.type === t.value ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                                transition: 'all 120ms ease',
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* City */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>City</label>
                <input type="text" placeholder="Goa, Mumbai, Jaipur…" value={filters.city}
                    onChange={e => update('city', e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
            </div>

            {/* Dates */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>Dates</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input type="date" value={filters.checkIn} onChange={e => update('checkIn', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="date" value={filters.checkOut} onChange={e => update('checkOut', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
            </div>

            {/* Guests */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>Guests</label>
                <input type="number" min={1} placeholder="1" value={filters.guests}
                    onChange={e => update('guests', e.target.value)} style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
            </div>

            {/* Price */}
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>Price (₹/night)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => update('minPrice', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => update('maxPrice', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                </div>
            </div>

            {/* Rating */}
            <div style={{ marginBottom: 6 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8, color: 'var(--text-secondary)' }}>Min Rating</label>
                <select value={filters.minRating} onChange={e => update('minRating', e.target.value)} style={{ ...inputStyle }}>
                    <option value="">Any</option>
                    {[4, 4.5, 4.8].map(r => <option key={r} value={r}>{r}+ stars</option>)}
                </select>
            </div>
        </aside>
    );
}

function DistanceBadge({ meters }) {
    if (!meters) return null;
    const km = (meters / 1000).toFixed(1);
    return (
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {km} km away
        </span>
    );
}

function ListingsPageContent() {
    const searchParams = useSearchParams();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [mapMode, setMapMode] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [distances, setDistances] = useState({}); // {listingId: meters}
    const boundsRef = useRef(null);
    const debounceRef = useRef(null);

    const [filters, setFilters] = useState({
        type: searchParams.get('type') || '',
        city: searchParams.get('city') || '',
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        guests: searchParams.get('guests') || '',
        minPrice: '', maxPrice: '', minRating: '', sortBy: '',
    });

    // ── Fetch listings ───────────────────────────────────────────────────
    const fetchListings = useCallback(async (p = 1, extraParams = {}) => {
        setLoading(true);
        try {
            const params = { page: p, limit: 12 };
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            Object.assign(params, extraParams);
            const { data } = await listingsApi.getAll(params);
            const results = data.data || [];
            setListings(results);
            setTotal(data.meta?.pagination?.total || 0);

            // Extract distance if API returns it
            const distMap = {};
            results.forEach(l => { if (l.distance) distMap[l._id] = l.distance; });
            if (Object.keys(distMap).length) setDistances(distMap);
        } catch { setListings([]); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { fetchListings(1); setPage(1); }, [filters]);

    // ── Get user geolocation when entering map mode ──────────────────────
    useEffect(() => {
        if (!mapMode) return;
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => { /* denied — fallback to listing bounds */ },
            { timeout: 6000 }
        );
    }, [mapMode]);

    // ── Viewport-based map filter (debounced 300ms) ─────────────────────
    const handleBoundsChange = useCallback((bounds) => {
        boundsRef.current = bounds;
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (!bounds) return;
            fetchListings(1, {
                swLat: bounds.swLat, swLng: bounds.swLng,
                neLat: bounds.neLat, neLng: bounds.neLng,
            });
        }, 300);
    }, [fetchListings]);

    const mapCenter = userLocation
        || (listings[0]?.location?.coordinates
            ? { lat: listings[0].location.coordinates[1], lng: listings[0].location.coordinates[0] }
            : null);

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh', background: 'var(--bg-primary)' }}>

                {/* ── Topbar ──────────────────────────────────────────────── */}
                <div style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: '#fff',
                    position: 'sticky',
                    top: 'var(--navbar-height)',
                    zIndex: 50,
                }}>
                    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                                {filters.city ? `Stays in ${filters.city}` : 'Explore listings'}
                            </h1>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                                {loading ? 'Searching…' : `${total.toLocaleString('en-IN')} listing${total !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {/* Sort */}
                            <select value={filters.sortBy} onChange={e => setFilters(p => ({ ...p, sortBy: e.target.value }))}
                                style={{ padding: '8px 12px', border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-button)', fontSize: 12, outline: 'none', fontFamily: 'inherit', background: '#fff', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500 }}>
                                <option value="">Recommended</option>
                                <option value="price_asc">Price: Low → High</option>
                                <option value="price_desc">Price: High → Low</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                            </select>
                            {/* Map / List toggle */}
                            <button onClick={() => setMapMode(m => !m)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 'var(--radius-button)', fontFamily: 'inherit',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    background: mapMode ? 'var(--text-primary)' : '#fff',
                                    color: mapMode ? '#fff' : 'var(--text-primary)',
                                    border: '1.5px solid var(--border-subtle)',
                                    transition: 'all 150ms ease',
                                }}>
                                {mapMode ? <><List size={14} /> List view</> : <><Map size={14} /> Map view</>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Main content ────────────────────────────────────────── */}
                <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

                        {/* Sidebar */}
                        <FilterSidebar filters={filters} setFilters={setFilters} />

                        {/* Listings Grid */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {loading ? (
                                <div style={{ display: 'grid', gridTemplateColumns: mapMode ? '1fr' : 'repeat(auto-fill, minmax(256px, 1fr))', gap: 18 }}>
                                    {[...Array(8)].map((_, i) => (
                                        <div key={i} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: '#fff', boxShadow: 'var(--shadow-card)' }}>
                                            <div className="skeleton" style={{ height: 200, borderRadius: 0 }} />
                                            <div style={{ padding: 14 }}>
                                                <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                                                <div className="skeleton" style={{ height: 11, width: '50%' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : listings.length > 0 ? (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: mapMode ? '1fr' : 'repeat(auto-fill, minmax(256px, 1fr))', gap: 18 }}>
                                        {listings.map(l => (
                                            <div key={l._id}>
                                                <ListingCard listing={l} compact={mapMode} />
                                                {mapMode && distances[l._id] && (
                                                    <div style={{ marginTop: 4, paddingLeft: 2 }}>
                                                        <DistanceBadge meters={distances[l._id]} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Pagination */}
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                                        {page > 1 && (
                                            <button onClick={() => { const np = page - 1; setPage(np); fetchListings(np); }}
                                                className="btn btn-ghost btn-sm">Previous</button>
                                        )}
                                        <span style={{ padding: '7px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>Page {page}</span>
                                        {listings.length === 12 && (
                                            <button onClick={() => { const np = page + 1; setPage(np); fetchListings(np); }}
                                                className="btn btn-ghost btn-sm">Next</button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
                                    <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No listings found</p>
                                    <p style={{ fontSize: 14 }}>Try adjusting your filters or zooming out on the map</p>
                                </div>
                            )}
                        </div>

                        {/* Sticky Map Panel */}
                        {mapMode && (
                            <div style={{
                                width: 440,
                                flexShrink: 0,
                                position: 'sticky',
                                top: 'calc(var(--navbar-height) + 70px)',
                                height: 'calc(100vh - var(--navbar-height) - 90px)',
                                borderRadius: 'var(--radius-card)',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-md)',
                                border: '1px solid var(--border-subtle)',
                            }}>
                                <ListingsMap
                                    listings={listings}
                                    userLocation={userLocation}
                                    onBoundsChange={handleBoundsChange}
                                    center={mapCenter}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// Wrap in Suspense for useSearchParams
export default function ListingsPage() {
    return (
        <Suspense fallback={<div style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh' }} />}>
            <ListingsPageContent />
        </Suspense>
    );
}
