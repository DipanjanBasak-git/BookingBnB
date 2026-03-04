'use client';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import Link from 'next/link';

const SECTIONS = [
    {
        title: '1. What are Cookies?',
        body: `Cookies are small text files downloaded to your device when you visit a website. They help the platform recognise your device and remember information about your visit. We also use similar tracking technologies like web beacons, local storage, and tracking pixels.`
    },
    {
        title: '2. Types of Cookies We Use',
        body: `We categorise cookies into four main types:

• **Strictly Necessary Cookies:** Essential for the platform to function. They let you log in, make secure payments, and access core features. These cannot be switched off.
• **Performance Cookies:** Help us understand how visitors use BookingBnB by collecting anonymous information about pages visited, loading times, and errors.
• **Functional Cookies:** Allow the platform to remember your choices (e.g., your preferred language, currency, or location) and provide enhanced, more personal features.
• **Targeting & Advertising Cookies:** Used to deliver advertisements more relevant to you and your interests. They may be set by us or our trusted third-party partners.`
    },
    {
        title: '3. Third-Party Cookies',
        body: `Some cookies are set by third-party services that appear on our pages. These include:
• Analytics providers (e.g., Google Analytics).
• Security and anti-fraud monitoring services.
• Payment gateways (e.g., Razorpay embedded iframes).
• Social media partners (if you choose to sign in via Google or Facebook).

We do not control the cookies set by third parties. You should refer to their respective privacy policies for more information.`
    },
    {
        title: '4. Managing Your Cookie Preferences',
        body: `You have control over your cookies. You can manage them in several ways:
• **Browser Settings:** Most browsers allow you to block or delete cookies. Note that if you block Strictly Necessary Cookies, parts of BookingBnB will not work.
• **Cookie Banner:** When you first visit, you can choose which non-essential cookies to allow via our Cookie Preferences centre.
• **Mobile Devices:** Your mobile operating system may let you opt out of having your device identifier used for targeted advertising.`
    },
    {
        title: '5. Updates to this Policy',
        body: `We may update this Cookie Policy periodically to reflect changes in our technologies or legal requirements. Please revisit this page to stay informed about our use of cookies.`
    },
];

function renderBody(text) {
    return text.split('\n').map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        if (line.startsWith('•')) {
            const content = line.slice(1).trim();
            const parts = content.split(/\*\*(.*?)\*\*/g);
            return (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ flexShrink: 0, color: 'var(--accent-primary)', fontWeight: 700 }}>•</span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)' }}>{p}</strong> : p)}
                    </span>
                </div>
            );
        }
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return <p key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 4 }}>
            {parts.map((p, j) => j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)' }}>{p}</strong> : p)}
        </p>;
    });
}

export default function CookiesPage() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)' }}>
                <section style={{ background: '#111', padding: '72px 0 56px', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <Cookie size={40} color="#4F46E5" style={{ marginBottom: 20 }} />
                            <h1 style={{ fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 14 }}>Cookie Policy</h1>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto' }}>
                                Last updated: 3 March 2026. How we use cookies to improve your BookingBnB experience.
                            </p>
                        </motion.div>
                    </div>
                </section>
                <section style={{ padding: '64px 0 80px', background: 'var(--bg-secondary)' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                            <div style={{ padding: '28px 32px', background: '#ECFEFF', borderBottom: '1px solid #A5F3FC' }}>
                                <p style={{ fontSize: 13, color: '#0891B2', lineHeight: 1.65 }}>
                                    <strong>TL;DR:</strong> We use cookies to keep you logged in, remember your preferences, and understand how the site is used. We don&#39;t use invasive tracking.
                                </p>
                            </div>
                            {SECTIONS.map((s, i) => (
                                <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                                    style={{ padding: '24px 32px', borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12, letterSpacing: '-0.01em' }}>{s.title}</h2>
                                    {renderBody(s.body)}
                                </motion.div>
                            ))}
                        </div>
                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Need to adjust your preferences?</p>
                            <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-primary)', color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                                onClick={() => alert('Cookie Preferences modal would open here.')}>
                                Manage Cookies
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
