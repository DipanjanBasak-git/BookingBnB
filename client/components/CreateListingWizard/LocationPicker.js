'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leafet default marker icon issue in Next.js
const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function LocationPicker({ value, onChange }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Try to get user location if they haven't set one yet
        if (value.lat === 20.5937 && value.lng === 78.9629) { // default India center
            navigator.geolocation.getCurrentPosition(
                (pos) => onChange({ ...value, lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log('Geolocation denied or failed', err)
            );
        }
    }, [value, onChange]);

    if (!mounted) {
        return <div style={{ height: 400, background: '#F3F4F6', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Loading Map...</div>;
    }

    const pos = { lat: value.lat, lng: value.lng };

    return (
        <div style={{ height: 400, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
            <MapContainer center={pos} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                />
                <LocationMarker position={pos} setPosition={(newPos) => onChange({ ...value, ...newPos })} />
            </MapContainer>
        </div>
    );
}
