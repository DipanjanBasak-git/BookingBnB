'use client';
import Navbar from '../../components/Navbar/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Globe, Star, ShieldCheck, Heart, TrendingUp, ArrowRight } from 'lucide-react';

const STATS = [
    { value: '1,200+', label: 'Verified Hosts' },
    { value: '22,000+', label: 'Happy Guests' },
    { value: '380+', label: 'Curated Listings' },
    { value: '4.8★', label: 'Average Rating' },
];

const VALUES = [
    { Icon: ShieldCheck, title: 'Trust & Safety', desc: 'Every host is verified manually. Every listing is reviewed before going live. We put safety above everything.' },
    { Icon: Heart, title: 'Genuine Hospitality', desc: 'We believe travel is about human connection. We curate experiences that feel personal, not transactional.' },
    { Icon: Globe, title: 'Local Discovery', desc: 'From mountain treehouses to city rooftops, we celebrate the incredible diversity of India\'s spaces and experiences.' },
    { Icon: TrendingUp, title: 'Host Empowerment', desc: 'We give hosts full pricing control, real-time analytics, and a community of peers to grow their hosting business.' },
];

const TEAM = [
    { name: 'Dipanjan Basak', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
    { name: 'Priya Sharma', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
    { name: 'Arjun Singh', role: 'Head of Engineering', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
    { name: 'Neha Gupta', role: 'Head of Host Success', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
];

export default function AboutPage() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)' }}>

                {/* Hero */}
                <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', padding: '100px 0 80px', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 16 }}>Our Story</p>
                            <h1 style={{ fontSize: 'clamp(32px, 5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: '-0.04em', marginBottom: 24 }}>
                                We&#39;re building the future<br />of Indian hospitality
                            </h1>
                            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px' }}>
                                BookingBnB started with a simple belief: every traveller deserves a home that feels personal, and every host deserves a platform that respects their hard work.
                            </p>
                            <Link href="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#111', padding: '13px 26px', borderRadius: 50, fontWeight: 700, fontSize: 14 }}>
                                Explore Listings <ArrowRight size={15} />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Stats */}
                <section style={{ background: '#fff', padding: '56px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 24, textAlign: 'center' }}>
                            {STATS.map((s, i) => (
                                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                                    <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.value}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
                    <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <Users size={36} color="var(--accent-primary)" style={{ marginBottom: 20 }} />
                            <h2 style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 20 }}>
                                Our Mission
                            </h2>
                            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                                To connect curious travellers with exceptional hosts across India — making every stay, experience, or service feel like it was made just for you. We believe great hospitality doesn&#39;t need to be standardised. It needs to be personal.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Values */}
                <section style={{ padding: '80px 0', background: '#fff' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 40, textAlign: 'center' }}>What we stand for</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                            {VALUES.map((v, i) => (
                                <motion.div key={v.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: '28px 24px', border: '1px solid var(--border-subtle)' }}>
                                    <v.Icon size={28} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{v.title}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{v.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 40, textAlign: 'center' }}>Meet the team</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                            {TEAM.map((m, i) => (
                                <motion.div key={m.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    style={{ textAlign: 'center', background: '#fff', borderRadius: 20, padding: '28px 20px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                                    <img src={m.img} alt={m.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 14, border: '3px solid var(--border-subtle)' }} />
                                    <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{m.name}</p>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{m.role}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ background: '#111', padding: '64px 0', textAlign: 'center' }}>
                    <div className="container">
                        <Star size={32} color="#F59E0B" style={{ marginBottom: 20 }} />
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16 }}>Ready to explore?</h2>
                        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>Join thousands of travellers discovering curated stays across India.</p>
                        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/listings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#111', padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: 14 }}>
                                Browse Listings
                            </Link>
                            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#fff', padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: 14, border: '1px solid rgba(255,255,255,0.2)' }}>
                                Get in Touch
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
