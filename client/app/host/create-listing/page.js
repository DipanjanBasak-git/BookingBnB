'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar/Navbar';
import CreateListingWizard from '../../../components/CreateListingWizard/CreateListingWizard';

export default function CreateListingPage() {
    const router = useRouter();

    return (
        <div style={{ minHeight: '100vh', background: '#F8F7F5', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, paddingTop: 'calc(var(--navbar-height) + 24px)', paddingBottom: 64, display: 'flex', flexDirection: 'column' }}
                className="container"
            >
                <div style={{ maxWidth: 840, width: '100%', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>Create a Listing</h1>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Share your space or experience with the world.</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/host')}
                            className="btn btn-ghost"
                            style={{ fontWeight: 600 }}
                        >
                            Cancel
                        </button>
                    </div>

                    {/* The wizard logic handles the multi-step form and submission */}
                    <CreateListingWizard />
                </div>
            </motion.main>
        </div>
    );
}
