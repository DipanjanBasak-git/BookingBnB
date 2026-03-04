'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV_LINKS = [
    { label: 'Homes', href: '/listings?type=property' },
    { label: 'Experiences', href: '/listings?type=experience' },
    { label: 'Services', href: '/listings?type=service' },
];

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, isAuthenticated } = useAuthStore();

    const [scrolled, setScrolled] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [drawerOpen]);

    const handleLogout = async () => {
        await logout();
        setDropdownOpen(false);
        setDrawerOpen(false);
        router.push('/');
    };

    const getDashboardHref = () => {
        if (!user) return '/auth';
        return user.role === 'host' ? '/dashboard/host' : '/dashboard/guest';
    };

    const isActive = (href) => pathname.startsWith(href.split('?')[0]);

    return (
        <>
            <header style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                height: 'var(--navbar-height)',
                zIndex: 100,
                background: '#FFFFFF',
                borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
                boxShadow: scrolled ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                transition: 'border-color 200ms ease, box-shadow 200ms ease',
            }}>
                <div className="container" style={{
                    height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                }}>

                    {/* ── LEFT: Logo ─────────────────────────────────── */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{
                            width: 28, height: 28,
                            background: 'var(--accent-primary)',
                            borderRadius: 7,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span style={{ color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: '-0.5px' }}>B</span>
                        </div>
                        <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                            BookingBnB
                        </span>
                    </Link>

                    {/* ── CENTER: Nav links ──────────────────────────── */}
                    <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {NAV_LINKS.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${isActive(link.href) ? 'active' : ''}`}
                                style={{
                                    padding: '8px 16px',
                                    color: 'var(--text-primary)',
                                    borderRadius: 8,
                                    transition: 'background 120ms ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* ── RIGHT: CTA + Auth ─────────────────────────── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {/* Become a host — desktop */}
                        <Link
                            href="/auth?mode=register&role=host"
                            className="hide-mobile"
                            style={{
                                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                                padding: '7px 14px', borderRadius: 'var(--radius-button)',
                                border: '1.5px solid var(--border-subtle)',
                                transition: 'border-color 150ms ease, background 150ms ease',
                                display: 'inline-flex',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                        >
                            Become a host
                        </Link>

                        {isAuthenticated() && user ? (
                            <div style={{ position: 'relative' }} ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '5px 10px 5px 6px',
                                        border: '1.5px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-pill)',
                                        background: dropdownOpen ? 'var(--bg-secondary)' : '#fff',
                                        cursor: 'pointer', fontFamily: 'inherit',
                                        transition: 'box-shadow 150ms ease, border-color 150ms ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <Menu size={16} color="var(--text-secondary)" />
                                    <div style={{
                                        width: 28, height: 28, background: 'var(--text-primary)',
                                        borderRadius: '50%', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: 11, fontWeight: 700,
                                    }}>
                                        {user.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                            transition={{ duration: 0.14, ease: 'easeOut' }}
                                            style={{
                                                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                                background: '#fff', border: '1px solid var(--border-subtle)',
                                                borderRadius: 16,
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: 220,
                                                overflow: 'hidden', zIndex: 200,
                                                transformOrigin: 'top right',
                                            }}
                                        >
                                            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                                                <p style={{ fontSize: 13, fontWeight: 700 }}>{user.name}</p>
                                                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, textTransform: 'capitalize' }}>{user.role}</p>
                                            </div>
                                            {[
                                                { label: 'Dashboard', href: getDashboardHref(), Icon: LayoutDashboard },
                                                { label: 'Wishlists', href: '/dashboard/guest?tab=wishlist', Icon: Heart },
                                            ].map(item => (
                                                <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', fontSize: 13, color: 'var(--text-primary)', transition: 'background 100ms ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <item.Icon size={15} color="var(--text-secondary)" />
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                                <button onClick={handleLogout}
                                                    style={{ width: '100%', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-error)', fontFamily: 'inherit', textAlign: 'left', transition: 'background 100ms ease' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <LogOut size={15} /> Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/auth" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', padding: '7px 14px', borderRadius: 'var(--radius-button)', transition: 'background 120ms ease', display: 'inline-flex' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Log in
                            </Link>
                        )}

                        {/* Mobile hamburger */}
                        <button onClick={() => setDrawerOpen(true)} className="show-mobile"
                            style={{ display: 'none', width: 36, height: 36, border: '1.5px solid var(--border-subtle)', borderRadius: 'var(--radius-button)', background: 'transparent', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="Menu">
                            <Menu size={17} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                            onClick={() => setDrawerOpen(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.30)', zIndex: 200 }} />
                        <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                            style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 270, background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.10)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                                <span style={{ fontWeight: 800, fontSize: 15 }}>BookingBnB</span>
                                <button onClick={() => setDrawerOpen(false)} style={{ width: 32, height: 32, border: 'none', background: 'var(--bg-secondary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <nav style={{ padding: '10px 12px', flex: 1 }}>
                                {NAV_LINKS.map((link, i) => (
                                    <motion.div key={link.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 + i * 0.05 }}>
                                        <Link href={link.href} onClick={() => setDrawerOpen(false)}
                                            style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >{link.label}</Link>
                                    </motion.div>
                                ))}
                                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '10px 0' }} />
                                {isAuthenticated() ? (
                                    <>
                                        <Link href={getDashboardHref()} onClick={() => setDrawerOpen(false)} style={{ display: 'flex', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>Dashboard</Link>
                                        <button onClick={handleLogout} style={{ width: '100%', display: 'flex', padding: '12px 14px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 500, color: 'var(--color-error)', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>Sign out</button>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Link href="/auth" onClick={() => setDrawerOpen(false)} className="btn btn-secondary btn-lg" style={{ justifyContent: 'center' }}>Log in</Link>
                                        <Link href="/auth?mode=register" onClick={() => setDrawerOpen(false)} className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>Sign up</Link>
                                    </div>
                                )}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style>{`
        @media(max-width:768px){.hide-mobile{display:none!important;}.show-mobile{display:flex!important;}}
        @media(min-width:769px){.show-mobile{display:none!important;}}
      `}</style>
        </>
    );
}
