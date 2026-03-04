'use client';
import Navbar from '../../components/Navbar/Navbar';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, Zap, Globe, Users, Heart, ArrowRight, MapPin } from 'lucide-react';

const PERKS = [
    { Icon: Zap, title: 'Move Fast', desc: 'We ship features weekly, not quarterly. If you thrive in fast-paced environments, you\'ll love it here.' },
    { Icon: Globe, title: 'Remote-Friendly', desc: 'Work from anywhere in India. We have hubs in Bengaluru, Mumbai, and Delhi — fully optional.' },
    { Icon: Heart, title: 'Great Benefits', desc: 'Competitive salary, ESOP, health cover, unlimited PTO, and an annual travel credit of ₹50,000.' },
    { Icon: Users, title: 'Small Teams', desc: 'No bureaucracy. Small, autonomous squads own full product surfaces end-to-end.' },
];

const OPENINGS = [
    { title: 'Senior Full-Stack Engineer', team: 'Engineering', location: 'Bengaluru / Remote', type: 'Full-time' },
    { title: 'Product Designer (UI/UX)', team: 'Design', location: 'Mumbai / Remote', type: 'Full-time' },
    { title: 'Growth Marketing Lead', team: 'Marketing', location: 'Delhi / Remote', type: 'Full-time' },
    { title: 'Host Success Manager', team: 'Operations', location: 'Remote', type: 'Full-time' },
    { title: 'Data Analyst', team: 'Data', location: 'Bengaluru / Remote', type: 'Full-time' },
    { title: 'Backend Engineer (Node.js)', team: 'Engineering', location: 'Remote', type: 'Full-time' },
];

const TEAM_COLORS = {
    Engineering: { bg: '#EEF2FF', text: '#4338CA' },
    Design: { bg: '#FDF2F8', text: '#9D174D' },
    Marketing: { bg: '#ECFDF5', text: '#065F46' },
    Operations: { bg: '#FFFBEB', text: '#92400E' },
    Data: { bg: '#EFF6FF', text: '#1D4ED8' },
};

export default function CareersPage() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)' }}>

                {/* Hero */}
                <section style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', padding: '100px 0 80px', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, padding: '6px 16px', marginBottom: 24 }}>
                                <Briefcase size={13} color="rgba(255,255,255,0.6)" />
                                <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>We&#39;re Hiring</span>
                            </div>
                            <h1 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 900, color: '#fff', lineHeight: 1.06, letterSpacing: '-0.04em', marginBottom: 20 }}>
                                Build the future of<br />Indian travel with us
                            </h1>
                            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px' }}>
                                Join a passionate team on a mission to transform how India travels, stays, and experiences the world.
                            </p>
                            <a href="#openings" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#111', padding: '13px 26px', borderRadius: 50, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                See Open Roles <ArrowRight size={15} />
                            </a>
                        </motion.div>
                    </div>
                </section>

                {/* Perks */}
                <section style={{ padding: '80px 0', background: '#fff' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8, textAlign: 'center' }}>Why BookingBnB?</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 15, marginBottom: 48 }}>A place where great people do the best work of their careers.</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                            {PERKS.map((p, i) => (
                                <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: '28px 24px', border: '1px solid var(--border-subtle)' }}>
                                    <p.Icon size={28} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{p.title}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{p.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Open roles */}
                <section id="openings" style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Open Roles</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 36 }}>{OPENINGS.length} positions available across all teams</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {OPENINGS.map((job, i) => {
                                const tc = TEAM_COLORS[job.team] || TEAM_COLORS.Engineering;
                                return (
                                    <motion.div key={job.title} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        style={{ background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, boxShadow: 'var(--shadow-card)', cursor: 'pointer', transition: 'box-shadow 150ms ease' }}
                                        onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                                    >
                                        <div>
                                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{job.title}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.text, padding: '2px 9px', borderRadius: 50 }}>{job.team}</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    <MapPin size={11} /> {job.location}
                                                </span>
                                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.type}</span>
                                            </div>
                                        </div>
                                        <Link href={`/contact?subject=Application for ${encodeURIComponent(job.title)}`}
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-primary)', color: '#fff', padding: '9px 18px', borderRadius: 50, fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                            Apply <ArrowRight size={13} />
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Culture CTA */}
                <section style={{ background: '#111', padding: '64px 0', textAlign: 'center' }}>
                    <div className="container">
                        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 14 }}>Don&#39;t see your role?</h2>
                        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>We&#39;re always looking for exceptional people. Send us your profile.</p>
                        <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#111', padding: '12px 24px', borderRadius: 50, fontWeight: 700, fontSize: 14 }}>
                            Get in Touch
                        </Link>
                    </div>
                </section>
            </div>
        </>
    );
}
