'use client';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const SECTIONS = [
    {
        title: '1. Information We Collect',
        body: `We collect information you provide directly to us when you create an account, make a booking, list a property, or contact us for support.

This includes:
• **Account Data** — name, email address, phone number, profile photo, and password (hashed).
• **Booking Data** — dates, number of guests, special requests, and payment details (processed via Razorpay; we never store raw card data).
• **Listing Data** — property descriptions, photos, pricing, availability, and location.
• **Communications** — messages you send to hosts or our support team through the platform.
• **Usage Data** — pages visited, features used, search queries, click events, and session duration.
• **Device Data** — IP address, browser type, operating system, and timezone.`
    },
    {
        title: '2. How We Use Your Information',
        body: `We use your information to:
• Provide, operate, and improve the BookingBnB platform.
• Process bookings, payments, and refunds.
• Facilitate communication between guests and hosts.
• Send transactional emails (booking confirmations, receipts, check-in reminders).
• Send marketing communications with your consent (you may opt out at any time).
• Detect and prevent fraud, abuse, and safety issues.
• Comply with legal obligations under Indian law (IT Act 2000, DPDPA 2023).`
    },
    {
        title: '3. Sharing Your Information',
        body: `We share your information only in the following circumstances:
• **With Hosts or Guests** — When you make or receive a booking, your name and general profile information is shared with the other party.
• **With Service Providers** — We use trusted third-party vendors (payment processors, cloud hosting, analytics) who are contractually obligated to protect your data.
• **For Legal Compliance** — We may disclose data if required by law, court order, or governmental authority in India.
• **Business Transfers** — In the event of a merger or acquisition, your data may be transferred as part of that transaction.

We do not sell your personal data to third parties.`
    },
    {
        title: '4. Cookies & Tracking',
        body: `We use cookies and similar technologies to:
• Keep you logged in across sessions.
• Remember your preferences (currency, language, search filters).
• Analyse how users interact with our platform.
• Show you relevant content.

You can manage cookie preferences via your browser settings or our Cookie Preferences centre. See our Cookie Policy for details.`
    },
    {
        title: '5. Data Storage & Security',
        body: `Your data is stored on secure cloud servers in India (AWS Mumbai region). We implement industry-standard security measures including:
• TLS encryption for all data in transit.
• AES-256 encryption for sensitive data at rest.
• Regular security audits and penetration testing.
• Two-factor authentication available for all accounts.

No system is 100% secure. We encourage you to use a strong, unique password and to enable 2FA.`
    },
    {
        title: '6. Your Rights',
        body: `Under the Digital Personal Data Protection Act 2023 (DPDPA), you have the right to:
• **Access** — Request a copy of personal data we hold about you.
• **Correction** — Ask us to correct inaccurate or incomplete data.
• **Erasure** — Request deletion of your account and associated data.
• **Withdraw Consent** — Opt out of marketing communications at any time.
• **Grievance Redressal** — Contact our Grievance Officer (details below).

To exercise these rights, email privacy@bookingbnb.in with the subject "Data Request".`
    },
    {
        title: '7. Data Retention',
        body: `We retain your data for as long as your account is active or as needed to provide services. After account deletion, we retain certain data for up to 7 years to comply with Indian tax and legal requirements.`
    },
    {
        title: '8. Grievance Officer',
        body: `In accordance with the IT Act 2000 and DPDPA 2023, our Grievance Officer is:

**Name:** Dipanjan Basak
**Email:** grievance@bookingbnb.in
**Address:** 12th Floor, UB City, Vittal Mallya Road, Bengaluru 560001
**Response Time:** Within 30 days of receipt of complaint.`
    },
    {
        title: '9. Changes to This Policy',
        body: `We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through a prominent notice on the platform. Continued use after the effective date constitutes acceptance of the updated policy.`
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
                    <span style={{ flexShrink: 0, color: 'var(--accent-primary)', fontWeight: 700, marginTop: 2 }}>•</span>
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

export default function PrivacyPage() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)' }}>
                {/* Hero */}
                <section style={{ background: '#111', padding: '72px 0 56px', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <ShieldCheck size={40} color="#4F46E5" style={{ marginBottom: 20 }} />
                            <h1 style={{ fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 14 }}>Privacy Policy</h1>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto' }}>
                                Last updated: 3 March 2026. This policy explains how BookingBnB collects, uses, and protects your personal data.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Content */}
                <section style={{ padding: '64px 0 80px', background: 'var(--bg-secondary)' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                            <div style={{ padding: '28px 32px', background: '#EEF2FF', borderBottom: '1px solid #C7D2FE' }}>
                                <p style={{ fontSize: 13, color: '#4338CA', lineHeight: 1.65 }}>
                                    <strong>Summary:</strong> We collect only what we need to run the platform, we never sell your data, and you have full control over your information.
                                </p>
                            </div>
                            {SECTIONS.map((s, i) => (
                                <motion.div key={s.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                                    style={{ padding: '28px 32px', borderBottom: i < SECTIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                                    <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.01em' }}>{s.title}</h2>
                                    {renderBody(s.body)}
                                </motion.div>
                            ))}
                        </div>
                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Questions about your privacy?</p>
                            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-primary)', color: '#fff', padding: '10px 22px', borderRadius: 50, fontSize: 13, fontWeight: 700 }}>
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
