'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const ROLES = [
    { key: 'guest', label: 'Guest', emoji: '🧳', desc: 'Book stays, experiences & services' },
    { key: 'host', label: 'Host', emoji: '🏠', desc: 'List your property, service or experience' },
];

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, register, isAuthenticated, user, isLoading, error, clearError } = useAuthStore();

    const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
    const [role, setRole] = useState(searchParams.get('role') || 'guest');
    const [step, setStep] = useState(searchParams.get('mode') === 'register' ? 0 : 1); // 0=role select, 1=form
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isAuthenticated() && user) {
            const dest = user.role === 'host' ? '/dashboard/host' : user.role === 'admin' ? '/dashboard/admin' : '/dashboard/guest';
            router.replace(dest);
        }
    }, [user]);

    useEffect(() => { clearError(); }, [mode]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (mode === 'login') {
            result = await login({ email: form.email, password: form.password });
        } else {
            result = await register({ ...form, role });
        }
        if (result.success) {
            toast.success(mode === 'login' ? 'Welcome back!' : 'Account created! Welcome to BookingBnB 🎉');
        } else {
            toast.error(result.message || 'Something went wrong');
        }
    };

    const inputStyle = {
        width: '100%', padding: '11px 14px',
        border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-size-base)',
        outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
    };

    return (
        <>
            <Navbar />
            <div style={{
                minHeight: '100vh',
                paddingTop: 'var(--navbar-height)',
                background: 'linear-gradient(145deg, #EEF2FF 0%, #F5F3FF 50%, #FAFAFA 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '60px 16px',
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-xl)',
                    width: '100%', maxWidth: 460,
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '28px 32px 20px',
                        borderBottom: '1px solid var(--color-border)',
                        background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                            <div style={{ width: 44, height: 44, background: 'var(--gradient-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>B</span>
                            </div>
                        </div>
                        <h1 style={{ textAlign: 'center', fontSize: 'var(--font-size-xl)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            {mode === 'login' ? 'Welcome back' : step === 0 ? 'Join BookingBnB' : `Register as ${role}`}
                        </h1>
                        <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 6 }}>
                            {mode === 'login' ? 'Sign in to your account' : step === 0 ? 'Choose how you want to use BookingBnB' : 'Fill in your details to get started'}
                        </p>
                    </div>

                    <div style={{ padding: '28px 32px 32px' }}>
                        {/* Mode toggle */}
                        <div style={{ display: 'flex', gap: 6, padding: 4, background: '#F3F4F6', borderRadius: 'var(--radius-md)', marginBottom: 24 }}>
                            {['login', 'register'].map(m => (
                                <button key={m} onClick={() => { setMode(m); setStep(m === 'register' ? 0 : 1); }}
                                    style={{
                                        flex: 1, padding: '8px 0',
                                        border: 'none', borderRadius: 'calc(var(--radius-md) - 2px)',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        fontSize: 'var(--font-size-sm)', fontWeight: 600,
                                        background: mode === m ? '#fff' : 'transparent',
                                        color: mode === m ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                        boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                                        transition: 'all var(--transition-fast)',
                                    }}>
                                    {m === 'login' ? 'Sign In' : 'Register'}
                                </button>
                            ))}
                        </div>

                        {/* REGISTER: Role select step */}
                        {mode === 'register' && step === 0 && (
                            <div>
                                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 12, color: 'var(--color-text-muted)' }}>
                                    I want to…
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {ROLES.map(r => (
                                        <button key={r.key} onClick={() => setRole(r.key)} style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '14px 16px',
                                            border: `2px solid ${role === r.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                            borderRadius: 'var(--radius-lg)',
                                            background: role === r.key ? '#EEF2FF' : 'transparent',
                                            cursor: 'pointer', textAlign: 'left', transition: 'all var(--transition-fast)',
                                            fontFamily: 'inherit',
                                        }}>
                                            <span style={{ fontSize: 28 }}>{r.emoji}</span>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: role === r.key ? 'var(--color-primary)' : 'var(--color-text)' }}>
                                                    {r.label}
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{r.desc}</div>
                                            </div>
                                            {role === r.key && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontSize: 18 }}>✓</span>}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setStep(1)} className="btn btn-primary" style={{ width: '100%', marginTop: 20, padding: '13px' }}>
                                    Continue as {ROLES.find(r => r.key === role)?.label} →
                                </button>
                            </div>
                        )}

                        {/* Form step */}
                        {(mode === 'login' || step === 1) && (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {mode === 'register' && (
                                    <div>
                                        <label className="label">Full Name</label>
                                        <input type="text" placeholder="Arjun Sharma" required value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                            style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                                            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="label">Email</label>
                                    <input type="email" placeholder="you@example.com" required value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>
                                <div>
                                    <label className="label">Password</label>
                                    <input type="password" placeholder={mode === 'register' ? 'Min 8 chars, uppercase, number' : '••••••••'} required value={form.password}
                                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                        style={inputStyle}
                                        onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                    />
                                </div>

                                {error && (
                                    <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', border: '1px solid #FECACA' }}>
                                        ⚠️ {error}
                                    </div>
                                )}

                                {mode === 'register' && (
                                    <button type="button" onClick={() => setStep(0)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)',
                                        textAlign: 'left', padding: 0,
                                    }}>
                                        ← Change role ({role})
                                    </button>
                                )}

                                <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ padding: '13px', fontSize: 'var(--font-size-md)' }}>
                                    {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                                </button>

                                {mode === 'login' && (
                                    <p style={{ textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        Demo: guest@bookingbnb.com / Guest123!
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
