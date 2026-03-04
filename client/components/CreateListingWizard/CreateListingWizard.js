import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Check, ChevronRight, ChevronLeft, MapPin, Image as ImageIcon, Home, List, DollarSign, Star, AlertCircle } from 'lucide-react';
import { listingsApi } from '../../services/api';
import useAuthStore from '../../store/authStore';

// Dynamically import LocationPicker so Leaflet doesn't crash on SSR
const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false, loading: () => <div style={{ height: 400, background: '#f3f4f6', borderRadius: 16 }} /> });

export default function CreateListingWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    // Master Form State
    const [formData, setFormData] = useState({
        type: 'property', // property, experience, service
        category: '',     // hotel, villa, tour, chef, etc.
        title: '',
        description: '',
        tags: [],
        location: {
            address: '',
            city: '',
            state: '',
            country: 'India',
            zip: '',
            lat: 20.5937,
            lng: 78.9629,
        },
        capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
        pricing: { basePrice: 2500, cleaningFee: 0, priceType: 'per_night' },
        amenities: [],
        images: [], // File objects
    });

    const STEPS = [
        { id: 1, label: 'Type' },
        { id: 2, label: 'Basics' },
        { id: 3, label: 'Location' },
        { id: 4, label: 'Details' },
        { id: 5, label: 'Amenities' },
        { id: 6, label: 'Photos' },
        { id: 7, label: 'Publish' }
    ];

    const [error, setError] = useState('');

    const validateStep = (s) => {
        setError('');
        if (s === 1 && !formData.category) { setError('Please select a specific category'); return false; }
        if (s === 2 && (formData.title.length < 5 || formData.description.length < 20)) { setError('Please provide a title (min 5 chars) and description (min 20 chars)'); return false; }
        if (s === 3 && (!formData.location.city || !formData.location.country)) { setError('City and Country are required'); return false; }
        if (s === 6 && formData.images.length < 3) { setError('Please upload at least 3 photos'); return false; }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(s => Math.min(s + 1, 7));
    };
    const prevStep = () => {
        setError('');
        setStep(s => Math.max(s - 1, 1));
    };

    const handleSubmit = async (isPublished) => {
        if (!validateStep(6)) return; // Final verification before submission

        try {
            setSubmitting(true);
            setError('');

            const data = new FormData();
            data.append('type', formData.type);
            data.append('category', formData.category);
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('isPublished', isPublished);

            // Nested objects turned to JSON strings for backend parser
            data.append('location', JSON.stringify(formData.location));
            data.append('capacity', JSON.stringify(formData.capacity));
            data.append('pricing', JSON.stringify(formData.pricing));
            data.append('amenities', JSON.stringify(formData.amenities));
            data.append('tags', JSON.stringify(formData.tags));

            // Append each file under 'images'
            formData.images.forEach(f => data.append('images', f));

            await listingsApi.create(data);
            router.push('/dashboard/host?tab=listings');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create listing');
            setSubmitting(false);
        }
    };

    return (
        <div style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 600 }}>
            {/* ── Header Progress ── */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-subtle)', background: '#FAFAFA' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    {STEPS.map(s => (
                        <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: step >= s.id ? 'var(--accent-primary)' : '#E5E7EB',
                                color: step >= s.id ? '#fff' : '#9CA3AF',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, zIndex: 2,
                                transition: 'all 300ms ease'
                            }}>
                                {step > s.id ? <Check size={14} strokeWidth={3} /> : s.id}
                            </div>
                            <span style={{ fontSize: 11, fontWeight: step === s.id ? 700 : 500, color: step >= s.id ? 'var(--text-primary)' : '#9CA3AF', marginTop: 8 }}>
                                {s.label}
                            </span>
                            {/* Connecting line */}
                            {s.id < 7 && (
                                <div style={{ position: 'absolute', top: 14, left: '50%', right: '-50%', height: 2, background: step > s.id ? 'var(--accent-primary)' : '#E5E7EB', zIndex: 1, transition: 'background 300ms ease' }} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '40px 48px', flex: 1, position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.02em' }}>What type of listing is this?</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                                    {[
                                        { id: 'property', icon: <Home size={24} />, title: 'Property', desc: 'Homes, apartments, villas' },
                                        { id: 'experience', icon: <MapPin size={24} />, title: 'Experience', desc: 'Tours, events, workshops' },
                                        { id: 'service', icon: <List size={24} />, title: 'Service', desc: 'Chefs, guides, wellness' }
                                    ].map(type => (
                                        <div
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, type: type.id, category: '' })}
                                            style={{
                                                padding: '24px', borderRadius: 16, cursor: 'pointer', transition: 'all 200ms ease',
                                                border: formData.type === type.id ? '2px solid var(--accent-primary)' : '2px solid var(--border-subtle)',
                                                background: formData.type === type.id ? '#EEF2FF' : '#fff',
                                            }}
                                        >
                                            <div style={{ color: formData.type === type.id ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: 12 }}>{type.icon}</div>
                                            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{type.title}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{type.desc}</div>
                                        </div>
                                    ))}
                                </div>

                                {formData.type && (
                                    <div style={{ marginTop: 32 }}>
                                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>Select specific category</h3>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input"
                                            style={{ maxWidth: 300 }}
                                        >
                                            <option value="">Choose category...</option>
                                            {formData.type === 'property' && ['hotel', 'villa', 'apartment', 'cabin'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                            {formData.type === 'experience' && ['tour', 'event', 'workshop'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                            {formData.type === 'service' && ['chef', 'photographer', 'guide', 'wellness'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.02em' }}>Tell us about your listing</h2>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Listing Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. Sunset Villa with Private Pool"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Min 5 chars, max 100.</p>
                                </div>

                                <div style={{ marginBottom: 24 }}>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Description</label>
                                    <textarea
                                        className="input"
                                        placeholder="Describe what makes your space or experience unique..."
                                        style={{ minHeight: 140, resize: 'vertical' }}
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Min 20 chars.</p>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Tags (Optional, comma separated)</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. beachfront, luxury, family-friendly"
                                        value={formData.tags.join(', ')}
                                        onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Where is your place located?</h2>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Guests will only get your exact address once they've booked.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 32, alignItems: 'start' }}>
                                    <div>
                                        <div style={{ marginBottom: 16 }}>
                                            <LocationPicker
                                                value={{ lat: formData.location.lat, lng: formData.location.lng }}
                                                onChange={pos => setFormData({ ...formData, location: { ...formData.location, lat: pos.lat, lng: pos.lng } })}
                                            />
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>You can drag the map or click to drop a pin on your exact location.</p>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Street Address</label>
                                            <input type="text" className="input" placeholder="House name, street..." value={formData.location.address} onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>City</label>
                                            <input type="text" className="input" placeholder="e.g. Mumbai" value={formData.location.city} onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>State/Province</label>
                                            <input type="text" className="input" placeholder="e.g. Maharashtra" value={formData.location.state} onChange={e => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Country</label>
                                            <input type="text" className="input" value={formData.location.country} onChange={e => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24, letterSpacing: '-0.02em' }}>Capacity & Pricing</h2>

                                <div style={{ display: 'flex', gap: 32 }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Capacity</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, background: '#FAFAFA', padding: 20, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                                            {['guests', 'bedrooms', 'beds', 'bathrooms'].map(key => (
                                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>{key}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <button
                                                            onClick={() => setFormData({ ...formData, capacity: { ...formData.capacity, [key]: Math.max(1, formData.capacity[key] - 1) } })}
                                                            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff' }}
                                                        >-</button>
                                                        <span style={{ width: 24, textAlign: 'center', fontWeight: 600 }}>{formData.capacity[key]}</span>
                                                        <button
                                                            onClick={() => setFormData({ ...formData, capacity: { ...formData.capacity, [key]: formData.capacity[key] + 1 } })}
                                                            style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#fff', color: '#111827' }}
                                                        >+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Pricing</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Base Price (₹ / night)</label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 16, top: 13, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>₹</span>
                                                    <input
                                                        type="number" className="input" style={{ paddingLeft: 32 }} min="1"
                                                        value={formData.pricing.basePrice}
                                                        onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, basePrice: Number(e.target.value) } })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Cleaning Fee (₹) [Optional]</label>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: 16, top: 13, fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>₹</span>
                                                    <input
                                                        type="number" className="input" style={{ paddingLeft: 32 }} min="0"
                                                        value={formData.pricing.cleaningFee}
                                                        onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, cleaningFee: Number(e.target.value) } })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Price Type</label>
                                                <select className="input" value={formData.pricing.priceType} onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, priceType: e.target.value } })}>
                                                    <option value="per_night">Per Night</option>
                                                    <option value="per_person">Per Person</option>
                                                    <option value="flat">Flat Fee (Events/Services)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {step === 5 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>What amenities do you offer?</h2>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Select all that apply to your space.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                                    {['Wifi', 'Air conditioning', 'Kitchen', 'Pool', 'Free parking', 'TV', 'Washer', 'Heating', 'Workspace', 'Gym', 'Breakfast'].map(amenity => {
                                        const isSelected = formData.amenities.includes(amenity);
                                        return (
                                            <div
                                                key={amenity}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        amenities: isSelected
                                                            ? formData.amenities.filter(a => a !== amenity)
                                                            : [...formData.amenities, amenity]
                                                    });
                                                }}
                                                style={{
                                                    padding: '12px 16px', borderRadius: 12, border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                                                    background: isSelected ? '#FAFAFA' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 150ms ease'
                                                }}
                                            >
                                                <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid var(--text-primary)', background: isSelected ? 'var(--text-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                                </div>
                                                <span style={{ fontSize: 13, fontWeight: 600 }}>{amenity}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Add some photos of your place</h2>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>You'll need at least 3 photos to publish. You can add more or make changes later.</p>

                                <div
                                    style={{
                                        border: '2px dashed var(--border-subtle)', borderRadius: 16, padding: '40px 20px', textAlign: 'center',
                                        background: '#FAFAFA', cursor: 'pointer', transition: 'border 200ms ease', marginBottom: 24
                                    }}
                                    onClick={() => document.getElementById('image-upload').click()}
                                >
                                    <ImageIcon size={48} color="#9CA3AF" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>Click to upload photos</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Select up to 10 images (JPEG, PNG, WebP)</p>
                                    <input
                                        id="image-upload" type="file" multiple accept="image/jpeg, image/jpg, image/png, image/webp"
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            if (e.target.files) {
                                                const newFiles = Array.from(e.target.files);
                                                setFormData({ ...formData, images: [...formData.images, ...newFiles].slice(0, 10) });
                                            }
                                        }}
                                    />
                                </div>

                                {formData.images.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                                        {formData.images.map((file, i) => (
                                            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Upload preview ${i + 1}`}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFormData({ ...formData, images: formData.images.filter((_, index) => index !== i) });
                                                    }}
                                                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                >×</button>
                                                {i === 0 && (
                                                    <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'var(--text-primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>Cover</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {step === 7 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Review your listing</h2>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 32 }}>Here's a preview of how it will appear to guests.</p>

                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ width: 340, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
                                        <div style={{ height: 320, background: '#F3F4F6', position: 'relative' }}>
                                            {formData.images.length > 0 ? (
                                                <img src={URL.createObjectURL(formData.images[0])} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF' }}><ImageIcon size={32} /></div>
                                            )}
                                        </div>
                                        <div style={{ padding: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {formData.title || 'Untitled Listing'}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                                                    <Star size={12} fill="currentColor" /> New
                                                </div>
                                            </div>
                                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 2 }}>{formData.location.city || 'City'}, {formData.location.country || 'Country'}</p>
                                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>{formData.capacity.guests} guests · {formData.category}</p>
                                            <p style={{ fontSize: 15 }}>
                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{formData.pricing.basePrice.toLocaleString('en-IN')}</span>
                                                <span style={{ color: 'var(--text-secondary)' }}> {formData.pricing.priceType === 'per_night' ? 'night' : formData.pricing.priceType.replace('_', ' ')}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Footer Controls ── */}
            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-subtle)', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={prevStep}
                    disabled={step === 1 || submitting}
                    className="btn btn-ghost"
                    style={{ opacity: step === 1 ? 0.3 : 1 }}
                >
                    <ChevronLeft size={18} /> Back
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626', fontSize: 13, fontWeight: 600 }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    {step < 7 ? (
                        <button onClick={nextStep} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => handleSubmit(false)} disabled={submitting} className="btn btn-secondary">Save as Draft</button>
                            <button onClick={() => handleSubmit(true)} disabled={submitting} className="btn btn-primary" style={{ background: '#059669', border: 'none' }}>
                                {submitting ? 'Publishing...' : 'Publish Listing'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
