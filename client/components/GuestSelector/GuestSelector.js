'use client';
import { useRef, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

const GUEST_TYPES = [
    { key: 'adults', label: 'Adults', sub: 'Ages 13+' },
    { key: 'children', label: 'Children', sub: 'Ages 2–12' },
    { key: 'infants', label: 'Infants', sub: 'Under 2' },
];

/**
 * GuestSelector — clean dropdown with +/- controls
 *
 * Props:
 *   value { adults, children, infants }
 *   onChange(newValue)
 *   onClose()
 *   maxGuests (int)
 */
export default function GuestSelector({ value, onChange, onClose, maxGuests = 16 }) {
    const ref = useRef(null);

    useEffect(() => {
        const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, [onClose]);

    const totalPeople = (value.adults || 0) + (value.children || 0);

    const adjust = (key, delta) => {
        const next = Math.max(0, (value[key] || 0) + delta);
        if (key !== 'infants' && delta > 0 && totalPeople >= maxGuests) return;
        if (key === 'adults' && next < 1) return; // min 1 adult
        onChange({ ...value, [key]: next });
    };

    return (
        <div ref={ref} style={{
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0,0,0,0.14)',
            border: '1px solid var(--border-subtle)',
            padding: '20px 24px',
            minWidth: 300,
        }}>
            {GUEST_TYPES.map((type, i) => (
                <div key={type.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 0',
                    borderBottom: i < GUEST_TYPES.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                    <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{type.label}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{type.sub}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button
                            onClick={() => adjust(type.key, -1)}
                            disabled={type.key === 'adults' ? (value.adults || 1) <= 1 : (value[type.key] || 0) <= 0}
                            style={{
                                width: 30, height: 30, borderRadius: '50%',
                                border: '1.5px solid var(--border-subtle)',
                                background: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'border-color 120ms ease',
                                opacity: (type.key === 'adults' ? (value.adults || 1) <= 1 : (value[type.key] || 0) <= 0) ? 0.35 : 1,
                            }}
                            onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                        >
                            <Minus size={13} />
                        </button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 16, textAlign: 'center', color: 'var(--text-primary)' }}>
                            {value[type.key] || 0}
                        </span>
                        <button
                            onClick={() => adjust(type.key, 1)}
                            style={{
                                width: 30, height: 30, borderRadius: '50%',
                                border: '1.5px solid var(--border-subtle)',
                                background: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'border-color 120ms ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                        >
                            <Plus size={13} />
                        </button>
                    </div>
                </div>
            ))}

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={onClose}
                    style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'var(--text-primary)', border: 'none', cursor: 'pointer', padding: '8px 20px', borderRadius: 8, fontFamily: 'inherit' }}>
                    Done
                </button>
            </div>
        </div>
    );
}
