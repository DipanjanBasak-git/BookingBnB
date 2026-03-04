'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageSquare, Users, Headphones, Send, CheckCircle } from 'lucide-react';

const TOPICS = ['General Enquiry', 'Booking Support', 'Host Support', 'Press & Media', 'Partnerships', 'Report an Issue', 'Job Application'];

const OFFICES = [
    { city: 'Bengaluru (HQ)', address: '12th Floor, UB City, Vittal Mallya Road, Bengaluru 560001', phone: '+91 80 4567 8900' },
    { city: 'Mumbai', address: 'Level 8, One BKC, Bandra Kurla Complex, Mumbai 400051', phone: '+91 22 6789 0100' },
    { city: 'Delhi', address: 'Suite 504, DLF Cyber City, Gurugram, Haryana 122002', phone: '+91 124 456 7800' },
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate submit
        await new Promise(r => setTimeout(r, 1200));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)' }}>

                {/* Hero */}
                <section style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)', padding: '80px 0 64px', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <MessageSquare size={36} color="rgba(255,255,255,0.7)" style={{ marginBottom: 20 }} />
                            <h1 style={{ fontSize: 'clamp(28px, 4vw, 50px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 16 }}>How can we help?</h1>
                            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 480, margin: '0 auto' }}>
                                Our team is here for guests, hosts, and partners Monday–Sunday, 9 AM–9 PM IST.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Quick actions */}
                <section style={{ background: '#fff', padding: '48px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="container">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                            {[
                                { Icon: Headphones, title: 'Guest Support', desc: 'Issues with bookings, payments, or check-in?', cta: 'Get Help', color: 'var(--accent-primary)' },
                                { Icon: Users, title: 'Host Support', desc: 'Questions about listings, payouts, or reviews?', cta: 'Get Help', color: '#059669' },
                                { Icon: Mail, title: 'Press & Media', desc: 'Media kit, interviews, or partnership enquiries?', cta: 'Email PR', color: '#D97706' },
                            ].map((c, i) => (
                                <motion.div key={c.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    style={{ background: 'var(--bg-secondary)', borderRadius: 18, padding: '24px 22px', border: '1px solid var(--border-subtle)' }}>
                                    <c.Icon size={26} color={c.color} style={{ marginBottom: 14 }} />
                                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{c.title}</h3>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{c.desc}</p>
                                    <button style={{ background: c.color, color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 50, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{c.cta}</button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Form + info */}
                <section style={{ padding: '80px 0', background: 'var(--bg-secondary)' }}>
                    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 48, alignItems: 'start' }}>

                        {/* Form */}
                        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                            style={{ background: '#fff', borderRadius: 24, padding: '36px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                            {submitted ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <CheckCircle size={48} color="#059669" style={{ marginBottom: 20 }} />
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>Message sent!</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>We&#39;ll get back to you within 24 hours.</p>
                                    <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', topic: '', message: '' }); }}
                                        style={{ marginTop: 20, background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 50, font: '700 13px inherit', cursor: 'pointer' }}>
                                        Send another
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 28 }}>Send us a message</h2>
                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Name *</label>
                                                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                                    placeholder="Dipanjan Basak"
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email *</label>
                                                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                                    placeholder="you@example.com"
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Topic *</label>
                                            <select required value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 14, fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box', outline: 'none' }}>
                                                <option value="">Select a topic</option>
                                                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Message *</label>
                                            <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                                placeholder="Tell us how we can help..."
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-subtle)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                                        </div>
                                        <button type="submit" disabled={loading}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '13px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
                                            {loading ? 'Sending…' : <><Send size={15} /> Send Message</>}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>

                        {/* Contact info */}
                        <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div style={{ background: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                                <Clock size={20} color="var(--accent-primary)" style={{ marginBottom: 14 }} />
                                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>Support Hours</h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Monday – Sunday<br />9:00 AM – 9:00 PM IST<br /><br />Emergency support available 24/7 for active bookings.</p>
                            </div>
                            {OFFICES.map(o => (
                                <div key={o.city} style={{ background: '#fff', borderRadius: 20, padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <MapPin size={16} color="var(--accent-primary)" />
                                        <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{o.city}</h3>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{o.address}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <Phone size={13} color="var(--text-secondary)" />
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{o.phone}</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
}
