'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface LiveMapProps {
    origin: { lat: number; lng: number; address: string };
    destination: { lat: number; lng: number; address: string };
    currentLocation: { lat: number; lng: number; speed_kmh: number };
    waypoints?: Array<{ lat: number; lng: number; address: string }>;
}

export default function LiveMap({ origin, destination, currentLocation, waypoints = [] }: LiveMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const markersInitialized = useRef(false);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Initialize map only once
        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: true,
                attributionControl: true
            }).setView(
                [currentLocation.lat, currentLocation.lng],
                13
            );

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            mapRef.current = map;
        }

        // Add markers only once
        if (!markersInitialized.current && mapRef.current) {
            const map = mapRef.current;

            // Add origin marker (green)
            const originIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });
            L.marker([origin.lat, origin.lng], { icon: originIcon })
                .addTo(map)
                .bindPopup(`<b>Origin</b><br/>${origin.address}`);

            // Add destination marker (red)
            const destIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
            });
            L.marker([destination.lat, destination.lng], { icon: destIcon })
                .addTo(map)
                .bindPopup(`<b>Destination</b><br/>${destination.address}`);

            // Add waypoint markers (yellow)
            waypoints.forEach((waypoint, index) => {
                const waypointIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: #f59e0b; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-weight: bold; color: white; font-size: 12px;">
                        ${index + 1}
                    </div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 28],
                });
                L.marker([waypoint.lat, waypoint.lng], { icon: waypointIcon })
                    .addTo(map)
                    .bindPopup(`<b>Stop ${index + 1}</b><br/>${waypoint.address}`);
            });

            // Draw route line
            const routePoints: [number, number][] = [
                [origin.lat, origin.lng],
                ...waypoints.map(w => [w.lat, w.lng] as [number, number]),
                [destination.lat, destination.lng]
            ];
            L.polyline(routePoints, {
                color: '#8b5cf6',
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
            }).addTo(map);

            // Add driver marker (blue, animated)
            const driverIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div style="position: relative;">
                    <div style="position: absolute; width: 48px; height: 48px; background-color: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                    <div style="background-color: #3b82f6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"></rect><path d="M9 9h.01"></path><path d="M15 9h.01"></path><path d="M9 15h6"></path></svg>
                    </div>
                </div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 24],
            });
            driverMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon: driverIcon })
                .addTo(map)
                .bindPopup(`<b>Driver Location</b><br/>Speed: ${currentLocation.speed_kmh.toFixed(0)} km/h`);

            // Fit bounds to show all markers
            const bounds = L.latLngBounds([
                [origin.lat, origin.lng],
                [destination.lat, destination.lng],
                [currentLocation.lat, currentLocation.lng],
                ...waypoints.map(w => [w.lat, w.lng] as [number, number])
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });

            markersInitialized.current = true;
        }

        // Update driver marker position on location changes
        if (driverMarkerRef.current && mapRef.current) {
            driverMarkerRef.current.setLatLng([currentLocation.lat, currentLocation.lng]);
            driverMarkerRef.current.setPopupContent(`<b>Driver Location</b><br/>Speed: ${currentLocation.speed_kmh.toFixed(0)} km/h`);

            // Smoothly pan to driver location
            mapRef.current.panTo([currentLocation.lat, currentLocation.lng], { animate: true, duration: 1 });
        }

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.remove();
                } catch (e) {
                    // Ignore errors during cleanup
                }
                mapRef.current = null;
                driverMarkerRef.current = null;
                markersInitialized.current = false;
            }
        };
    }, [currentLocation.lat, currentLocation.lng, currentLocation.speed_kmh]);

    return (
        <>
            <style jsx global>{`
                @keyframes ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
            <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '300px' }} />
        </>
    );
}
