'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar/Navbar';
import { listingsApi, bookingsApi, reviewsApi, paymentsApi } from '../../../services/api';
import useAuthStore from '../../../store/authStore';
import toast from 'react-hot-toast';

const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export default function ListingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [listing, setListing] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);
    const [booking, setBooking] = useState({ checkIn: '', checkOut: '', guests: 1, specialRequests: '' });
    const [bookingLoading, setBookingLoading] = useState(false);
    const [availability, setAvailability] = useState(null);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            listingsApi.getById(id),
            reviewsApi.getListing(id, { limit: 5 }),
        ]).then(([lRes, rRes]) => {
            setListing(lRes.data.data);
            setReviews(rRes.data.data || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    const checkAvail = async () => {
        if (!booking.checkIn || !booking.checkOut) return;
        try {
            const { data } = await bookingsApi.checkAvailability({ listingId: id, checkIn: booking.checkIn, checkOut: booking.checkOut });
            setAvailability(data.data.available);
        } catch { }
    };

    const nights = booking.checkIn && booking.checkOut
        ? Math.max(0, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000))
        : 0;
    const subtotal = nights * (listing?.pricing?.basePrice || 0);
    const total = subtotal + (listing?.pricing?.cleaningFee || 0) + (listing?.pricing?.serviceFee || 0);

    const handleBook = async () => {
        if (!isAuthenticated()) return router.push('/auth');
        if (!booking.checkIn || !booking.checkOut) return toast.error('Please select dates');
        if (availability === false) return toast.error('Dates not available');
        setBookingLoading(true);
        try {
            // Step 1: Create booking intent + payment intent
            const { data: intentData } = await bookingsApi.create({ listingId: id, ...booking });
            const intent = intentData.data;

            // Step 2: Simulate payment verification (Mock provider)
            const mockPaymentDetails = {
                orderId: intent.paymentIntent.orderId,
                paymentId: `MOCK_PAY_${Date.now()}`,
                signature: 'mock_signature',
            };

            // Step 3: Confirm booking with payment
            const { data: confirmed } = await bookingsApi.confirm({
                listingId: id,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: { adults: parseInt(booking.guests) },
                specialRequests: booking.specialRequests,
                paymentDetails: mockPaymentDetails,
                paymentProvider: 'mock',
            });

            toast.success(`Booking confirmed! Code: ${confirmed.data.confirmationCode} 🎉`);
            router.push('/dashboard/guest');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)', padding: '72px 0' }}>
                <div className="container">
                    <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)', marginBottom: 32 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
                        <div>
                            <div className="skeleton" style={{ height: 32, width: '60%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 100 }} />
                        </div>
                        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
                    </div>
                </div>
            </div>
        </>
    );

    if (!listing) return null;

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'calc(var(--navbar-height) + 40px)', minHeight: '100vh', background: 'var(--bg-primary)' }}>
                <div className="container" style={{ paddingBottom: 80 }}>
                    {/* Title + Meta */}
                    <h1 style={{
                        fontSize: 'clamp(24px, 3.5vw, 36px)',
                        fontWeight: 800,
                        letterSpacing: '-0.03em',
                        color: 'var(--text-primary)',
                        marginBottom: 12,
                        lineHeight: 1.15,
                        maxWidth: 760,
                    }}>{listing.title}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                        {listing.averageRating > 0 && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                <span style={{ color: '#F59E0B', fontSize: 16 }}>★</span>
                                <strong style={{ fontWeight: 700 }}>{listing.averageRating?.toFixed(2)}</strong>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>({listing.reviewCount} {listing.reviewCount === 1 ? 'review' : 'reviews'})</span>
                            </span>
                        )}
                        <span style={{ color: 'var(--border-medium)', fontSize: 16, userSelect: 'none' }}>·</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {listing.location?.city}, {listing.location?.country}
                        </span>
                        {listing.host?.isVerified && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                padding: '4px 12px',
                                background: '#E11D48',
                                color: '#ffffff',
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                lineHeight: 1.6,
                                letterSpacing: '0.01em',
                                flexShrink: 0,
                            }}>
                                ✓ Verified Host
                            </span>
                        )}
                    </div>

                    {/* Image gallery */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: 32, maxHeight: 400 }}>
                        <img src={listing.images?.[activeImg]?.url || listing.images?.[0]?.url}
                            alt={listing.title}
                            style={{ width: '100%', height: 400, objectFit: 'cover' }} />
                        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8 }}>
                            {listing.images?.slice(1, 3).map((img, i) => (
                                <img key={i} src={img.url} alt=""
                                    onClick={() => setActiveImg(i + 1)}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', opacity: activeImg === i + 1 ? 0.8 : 1 }} />
                            ))}
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {listing.images?.length > 3 && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
                            {listing.images.map((img, i) => (
                                <img key={i} src={img.url} alt=""
                                    onClick={() => setActiveImg(i)}
                                    style={{ width: 72, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${activeImg === i ? 'var(--color-primary)' : 'transparent'}`, flexShrink: 0 }} />
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, alignItems: 'flex-start' }}>
                        {/* Left: Details */}
                        <div>
                            {/* Host */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 24, borderBottom: '1px solid var(--color-border)', marginBottom: 24 }}>
                                <div style={{ width: 50, height: 50, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700 }}>
                                    {listing.host?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700 }}>Hosted by {listing.host?.name}</p>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                        {listing.host?.isVerified ? '✓ Verified Host' : ''} · Member since {new Date(listing.host?.createdAt).getFullYear()}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
                                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 12 }}>About this {listing.type}</h2>
                                <p style={{ lineHeight: 1.7, color: 'var(--color-text-muted)' }}>{listing.description}</p>
                            </div>

                            {/* Capacity */}
                            {listing.capacity && (
                                <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
                                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 12 }}>Details</h2>
                                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                                        {[
                                            { label: 'Max guests', value: listing.capacity.guests, icon: '👥' },
                                            ...(listing.capacity.bedrooms ? [{ label: 'Bedrooms', value: listing.capacity.bedrooms, icon: '🛏' }] : []),
                                            ...(listing.capacity.bathrooms ? [{ label: 'Bathrooms', value: listing.capacity.bathrooms, icon: '🚿' }] : []),
                                        ].map(d => (
                                            <div key={d.label} style={{ textAlign: 'center' }}>
                                                <p style={{ fontSize: 24, marginBottom: 4 }}>{d.icon}</p>
                                                <p style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>{d.value}</p>
                                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{d.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Amenities */}
                            {listing.amenities?.length > 0 && (
                                <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--color-border)' }}>
                                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 16 }}>Amenities</h2>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                                        {listing.amenities.map(a => (
                                            <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F9FAFB', borderRadius: 'var(--radius-md)' }}>
                                                <span style={{ fontSize: 20 }}>{a.icon}</span>
                                                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            {reviews.length > 0 && (
                                <div>
                                    <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 16 }}>
                                        ★ {listing.averageRating?.toFixed(2)} · {listing.reviewCount} Reviews
                                    </h2>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {reviews.map(r => (
                                            <div key={r._id} className="card" style={{ padding: 18 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                                    <div style={{ width: 36, height: 36, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700 }}>
                                                        {r.guest?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{r.guest?.name}</p>
                                                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                                                    </div>
                                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                                                        {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: s <= r.rating?.overall ? '#F59E0B' : '#E5E7EB', fontSize: 14 }}>★</span>)}
                                                    </div>
                                                </div>
                                                <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{r.comment}</p>
                                                {r.hostReply?.text && (
                                                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)', background: '#F9FAFB', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginLeft: 20 }}>
                                                        <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginBottom: 4 }}>🏠 Host reply:</p>
                                                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{r.hostReply.text}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Booking widget */}
                        <div style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 20px)' }}>
                            <div className="card" style={{ padding: 24 }}>
                                <div style={{ marginBottom: 20 }}>
                                    <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--color-primary)' }}>
                                        {formatPrice(listing.pricing?.basePrice)}
                                    </span>
                                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                        {' '}/ {listing.pricing?.priceType === 'per_person' ? 'person' : 'night'}
                                    </span>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12 }}>
                                    <div style={{ padding: '10px 12px', borderRight: '1px solid var(--color-border)' }}>
                                        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: 4 }}>CHECK IN</label>
                                        <input type="date" value={booking.checkIn}
                                            onChange={e => { setBooking(p => ({ ...p, checkIn: e.target.value })); setAvailability(null); }}
                                            onBlur={checkAvail}
                                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 'var(--font-size-sm)', fontFamily: 'inherit' }} />
                                    </div>
                                    <div style={{ padding: '10px 12px' }}>
                                        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: 4 }}>CHECK OUT</label>
                                        <input type="date" value={booking.checkOut}
                                            onChange={e => { setBooking(p => ({ ...p, checkOut: e.target.value })); setAvailability(null); }}
                                            onBlur={checkAvail}
                                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 'var(--font-size-sm)', fontFamily: 'inherit' }} />
                                    </div>
                                </div>

                                <div style={{ border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '10px 12px', marginBottom: 12 }}>
                                    <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: 4 }}>GUESTS</label>
                                    <input type="number" min={1} max={listing.capacity?.guests} value={booking.guests}
                                        onChange={e => setBooking(p => ({ ...p, guests: e.target.value }))}
                                        style={{ border: 'none', outline: 'none', width: '100%', fontSize: 'var(--font-size-sm)', fontFamily: 'inherit' }} />
                                </div>

                                {availability === false && (
                                    <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', marginBottom: 12, border: '1px solid #FECACA' }}>
                                        ⚠️ These dates are not available
                                    </div>
                                )}
                                {availability === true && (
                                    <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', marginBottom: 12 }}>
                                        ✓ Dates are available!
                                    </div>
                                )}

                                <button onClick={handleBook} disabled={bookingLoading || availability === false} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 'var(--font-size-md)', marginBottom: 16 }}>
                                    {bookingLoading ? 'Processing…' : isAuthenticated() ? 'Reserve Now' : 'Sign in to Book'}
                                </button>

                                {/* Price breakdown */}
                                {nights > 0 && (
                                    <div style={{ fontSize: 'var(--font-size-sm)' }}>
                                        {[
                                            { label: `${formatPrice(listing.pricing?.basePrice)} × ${nights} nights`, value: formatPrice(subtotal) },
                                            ...(listing.pricing?.cleaningFee ? [{ label: 'Cleaning fee', value: formatPrice(listing.pricing.cleaningFee) }] : []),
                                            ...(listing.pricing?.serviceFee ? [{ label: 'Service fee', value: formatPrice(listing.pricing.serviceFee) }] : []),
                                        ].map(row => (
                                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: 'var(--color-text-muted)' }}>
                                                <span>{row.label}</span><span>{row.value}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 12, borderTop: '1px solid var(--color-border)', marginTop: 8 }}>
                                            <span>Total</span><span>{formatPrice(total)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
