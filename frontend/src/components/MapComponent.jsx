import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && Array.isArray(center) && center.length === 2) {
            map.setView(center, 10);
        }
    }, [center, map]);
    return null;
};

const MapComponent = ({ center = [41.9028, 12.4964], height = '400px' }) => {
    return (
        <div style={{ height }}>
            <MapContainer
                center={center}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapUpdater center={center} />
                <Marker position={center} />
            </MapContainer>
        </div>
    );
};

export default MapComponent;
