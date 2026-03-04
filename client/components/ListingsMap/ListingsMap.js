'use client';
import { useEffect, useRef, useMemo, useCallback } from 'react';

// Leaflet must only run client-side
let L;
if (typeof window !== 'undefined') {
    L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    // Fix Leaflet's broken default icon paths in Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
}

// Grayscale tile URL (CartoDB Positron — clean, minimal, no API key)
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

// Custom rose-red accent marker SVG
function createAccentIcon(isUser = false) {
    if (!L) return null;
    const color = isUser ? '#1A1A1A' : '#E11D48';
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: '',
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -36],
    });
}

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/**
 * ListingsMap — Leaflet/OSM map, zero API keys.
 *
 * Props:
 *   listings       [{_id, title, location.coordinates:[lng,lat], pricing}]
 *   userLocation   {lat, lng} | null
 *   onBoundsChange (boundsObj) => void   — debounced by parent
 *   center         {lat, lng}            — initial map center
 */
export default function ListingsMap({ listings = [], userLocation, onBoundsChange, center }) {
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const markersRef = useRef([]);
    const userMarkerRef = useRef(null);
    const moveTimerRef = useRef(null);

    // ── Init map ───────────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined' || !L) return;
        if (leafletMapRef.current) return; // already mounted

        // Always produce valid [lat, lng] — strict guards prevent undefined crash
        const INDIA = [20.5937, 78.9629];
        const isValidCoord = (lat, lng) =>
            typeof lat === 'number' && typeof lng === 'number' &&
            isFinite(lat) && isFinite(lng);

        let initialCenter = INDIA;
        if (center && isValidCoord(center.lat, center.lng)) {
            initialCenter = [center.lat, center.lng];
        } else if (userLocation && isValidCoord(userLocation.lat, userLocation.lng)) {
            initialCenter = [userLocation.lat, userLocation.lng];
        }

        const map = L.map(mapRef.current, {
            center: initialCenter,
            zoom: 5,
            zoomControl: false,
            attributionControl: true,
        });

        L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 18 }).addTo(map);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Emit bounds on move (debounced)
        map.on('moveend', () => {
            clearTimeout(moveTimerRef.current);
            moveTimerRef.current = setTimeout(() => {
                const b = map.getBounds();
                onBoundsChange?.({
                    swLat: b.getSouth(), swLng: b.getWest(),
                    neLat: b.getNorth(), neLng: b.getEast(),
                });
            }, 300);
        });

        leafletMapRef.current = map;

        return () => {
            clearTimeout(moveTimerRef.current);
            map.remove();
            leafletMapRef.current = null;
        };
    }, []); // deliberate empty deps — map only init once

    // ── User location marker ───────────────────────────────────────────
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map || !userLocation || !L) return;

        if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
            userMarkerRef.current = L.marker(
                [userLocation.lat, userLocation.lng],
                { icon: createAccentIcon(true), zIndexOffset: 1000 }
            ).addTo(map).bindPopup('<b>You are here</b>');
        }
        map.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 1.2 });
    }, [userLocation]);

    // ── Listing markers ─────────────────────────────────────────────────
    useEffect(() => {
        const map = leafletMapRef.current;
        if (!map || !L) return;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        listings.forEach(listing => {
            // Handle both data shapes:
            // 1. Flat array:                  listing.location.coordinates = [lng, lat]
            // 2. GeoJSON sub-doc (Mongoose):  listing.location.coordinates = { type:'Point', coordinates:[lng,lat] }
            const raw = listing.location?.coordinates;
            let coordArr = null;
            if (Array.isArray(raw) && raw.length >= 2) {
                coordArr = raw; // flat array
            } else if (raw && Array.isArray(raw.coordinates) && raw.coordinates.length >= 2) {
                coordArr = raw.coordinates; // nested GeoJSON
            }
            if (!coordArr || (coordArr[0] === 0 && coordArr[1] === 0)) return;
            const [lng, lat] = coordArr;
            if (!isFinite(lat) || !isFinite(lng)) return;

            const price = listing.pricing?.basePrice
                ? `${INR.format(listing.pricing.basePrice)}`
                : '';

            const icon = L.divIcon({
                html: `<div style="
          background:#E11D48; color:#fff; font-size:11px; font-weight:700;
          padding:4px 9px; border-radius:20px; white-space:nowrap;
          box-shadow:0 2px 8px rgba(225,29,72,0.30); font-family:Inter,sans-serif;
          border:2px solid #fff;
        ">${price}</div>`,
                className: '',
                iconSize: null,
                iconAnchor: [0, 0],
                popupAnchor: [0, -8],
            });

            const marker = L.marker([lat, lng], { icon })
                .addTo(map)
                .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px">
            <strong style="font-size:13px;color:#222">${listing.title}</strong>
            <div style="font-size:12px;color:#6A6A6A;margin-top:4px">${listing.location?.city || ''}</div>
            <div style="font-size:13px;font-weight:700;color:#E11D48;margin-top:6px">${price}/night</div>
          </div>
        `, { closeButton: false, maxWidth: 220 });

            markersRef.current.push(marker);
        });

        // Fit bounds if listings are present and no user location override
        if (listings.length > 1 && !userLocation) {
            const validCoords = listings.reduce((acc, l) => {
                const r = l.location?.coordinates;
                const arr = Array.isArray(r) ? r : (r?.coordinates || null);
                if (arr && arr.length >= 2 && (arr[0] !== 0 || arr[1] !== 0)) {
                    acc.push([arr[1], arr[0]]); // [lat, lng] for Leaflet
                }
                return acc;
            }, []);
            if (validCoords.length > 1) {
                map.fitBounds(validCoords, { padding: [40, 40], maxZoom: 13 });
            }
        }
    }, [listings]);

    return (
        <div
            ref={mapRef}
            style={{ width: '100%', height: '100%', background: '#F0EDE8' }}
        />
    );
}
