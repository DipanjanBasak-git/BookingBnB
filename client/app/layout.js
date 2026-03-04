import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
    title: 'BookingBnB – Premium Multi-Service Booking Platform',
    description: 'Discover and book premium stays, experiences, and services. BookingBnB connects guests with verified hosts worldwide.',
    keywords: 'booking, stays, experiences, services, travel, premium',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '13px',
                            borderRadius: '10px',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
                            background: '#fff',
                            color: '#222222',
                            padding: '12px 16px',
                        },
                        success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#E11D48', secondary: '#fff' } },
                    }}
                />
            </body>
        </html>
    );
}
