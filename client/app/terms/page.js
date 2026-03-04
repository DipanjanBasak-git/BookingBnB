'use client';
import Navbar from '../../components/Navbar/Navbar';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Link from 'next/link';

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        body: `By accessing or using the BookingBnB platform (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Platform.

These Terms constitute a legally binding agreement between you and BookingBnB Technologies Pvt. Ltd. ("BookingBnB", "we", "us", or "our"), incorporated under the Companies Act 2013 with its registered office at 12th Floor, UB City, Bengaluru 560001.`
    },
    {
        title: '2. Eligibility',
        body: `You must be at least 18 years old to use the Platform. By using BookingBnB, you represent that:
• You are at least 18 years of age.
• You have the legal capacity to enter into a binding contract under Indian law.
• All information you provide is accurate and up to date.`
    },
    {
        title: '3. User Accounts',
        body: `When you create an account, you are responsible for:
• Maintaining the confidentiality of your login credentials.
• All activity that occurs under your account.
• Notifying us immediately of any unauthorized use at security@bookingbnb.in.

We reserve the right to suspend or terminate accounts that violate these Terms.`
    },
    {
        title: '4. Bookings and Payments',
        body: `• **Booking Confirmation** — A booking is confirmed only when payment is successfully processed and a confirmation email is sent.
• **Pricing** — All prices are in Indian Rupees (INR) unless stated otherwise. Taxes applicable under GST are included where specified.
• **Payment Processing** — Payments are processed via Razorpay. BookingBnB does not store raw card data.
• **Host Payouts** — Hosts receive payouts within 5 business days of a guest's check-in date, subject to verification.
• **Service Fee** — BookingBnB charges a service fee of 5%–15% on each booking, displayed at checkout.`
    },
    {
        title: '5. Cancellation & Refund Policy',
        body: `Cancellation terms are set by individual hosts and displayed on each listing. General rules:
• **Flexible** — Full refund if cancelled 24 hours before check-in.
• **Moderate** — Full refund if cancelled 5 days before check-in.
• **Strict** — 50% refund if cancelled 7+ days before check-in; no refund thereafter.

The BookingBnB service fee is non-refundable in all cases. For experiences and services, all sales are final unless the host cancels.`
    },
    {
        title: '6. Host Responsibilities',
        body: `By listing on BookingBnB, hosts agree to:
• Provide accurate, up-to-date information about their listing.
• Maintain the listing in the condition described.
• Honour confirmed bookings except in documented emergencies.
• Comply with all applicable local laws, zoning regulations, and tax obligations.
• Treat guests with courtesy and without discrimination.`
    },
    {
        title: '7. Guest Responsibilities',
        body: `By making a booking, guests agree to:
• Respect the host\'s property and house rules.
• Check out by the stated time.
• Not exceed the maximum guest count stated in the listing.
• Report any damages to the host and BookingBnB promptly.
• Not engage in illegal activities on the premises.`
    },
    {
        title: '8. Intellectual Property',
        body: `All content on the Platform — including text, graphics, logos, software, and data compilations — is owned by or licensed to BookingBnB and is protected by Indian copyright law and international conventions. You may not reproduce, distribute, or create derivative works without our written permission.

User-generated content (reviews, listing photos, etc.) remains your property, but you grant BookingBnB a worldwide, royalty-free licence to use, display, and distribute it on the Platform.`
    },
    {
        title: '9. Limitation of Liability',
        body: `To the maximum extent permitted by Indian law, BookingBnB shall not be liable for:
• Any indirect, incidental, or consequential damages arising from use of the Platform.
• Disputes between guests and hosts.
• Acts or omissions of third parties (payment processors, airlines, event organisers).

Our total aggregate liability shall not exceed the amount paid by you to BookingBnB in the 12 months preceding the claim.`
    },
    {
        title: '10. Dispute Resolution',
        body: `Any dispute arising out of these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to binding arbitration under the Arbitration and Conciliation Act 1996, with arbitration seated in Bengaluru, Karnataka. The governing law is the law of India.

You may also contact our Grievance Officer at grievance@bookingbnb.in.`
    },
    {
        title: '11. Modifications to Terms',
        body: `We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a notice on the Platform at least 14 days before the effective date. Continued use after the effective date constitutes acceptance.`
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

export default function TermsPage() {
    return (
        <>
            <Navbar />
            <div style={{ paddingTop: 'var(--navbar-height)' }}>
                <section style={{ background: '#111', padding: '72px 0 56px', textAlign: 'center' }}>
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <FileText size={40} color="#4F46E5" style={{ marginBottom: 20 }} />
                            <h1 style={{ fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 14 }}>Terms of Service</h1>
                            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto' }}>
                                Last updated: 3 March 2026. By using BookingBnB, you agree to these terms. Please read them carefully.
                            </p>
                        </motion.div>
                    </div>
                </section>
                <section style={{ padding: '64px 0 80px', background: 'var(--bg-secondary)' }}>
                    <div className="container" style={{ maxWidth: 760 }}>
                        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                            <div style={{ padding: '28px 32px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
                                <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.65 }}>
                                    <strong>Plain English Summary:</strong> Use the platform honestly, pay for what you book, treat hosts and guests with respect, and contact us if something goes wrong. We&#39;re here to help.
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
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Have questions about these terms?</p>
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
