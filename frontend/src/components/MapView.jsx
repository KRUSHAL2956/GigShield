import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issue in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Custom color markers based on risk level
 */
const createCustomIcon = (risk) => {
  let color = '#29f59f'; // Default Green (Safe)
  if (risk === 'HIGH') color = '#f87171'; // Red (High Risk)
  if (risk === 'MODERATE') color = '#fbbf24'; // Yellow (Warning)

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}88;" class="animate-pulse"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

// Component to handle map center updates when activeCity changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ citiesData = [], onCityClick, activeCity }) {
  const indiaCenter = [20.5937, 78.9629];
  const zoomLevel = 5;

  // Find coordinates for the currently active city to center the map
  const activeCityData = citiesData.find(c => c.city === activeCity);
  const mapCenter = activeCityData ? [activeCityData.lat, activeCityData.lon] : indiaCenter;

  return (
    <div className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3] max-w-2xl mx-auto bg-[#f8fbf9] rounded-[var(--radius-lg)] border border-border overflow-hidden shadow-2xl shadow-forest/5">
      <MapContainer 
        center={indiaCenter} 
        zoom={zoomLevel} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        <ChangeView center={mapCenter} zoom={activeCityData ? 7 : zoomLevel} />

        {citiesData.map((city) => {
          if (!city.lat || !city.lon) return null;

          const status = city.risk === 'HIGH' ? 'High Risk' : city.risk === 'MODERATE' ? 'Warning' : 'Safe';

          return (
            <Marker 
              key={city.city}
              position={[city.lat, city.lon]}
              icon={createCustomIcon(city.risk)}
              eventHandlers={{
                mouseover: () => onCityClick?.(city),
                click: () => onCityClick?.(city)
              }}
            >
              <Popup closeButton={false} className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-forest text-sm m-0">{city.city}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-ink-muted uppercase font-bold">Temp</span>
                      <span className="text-[10px] font-black text-forest">{Math.round(city.temp)}°C</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[10px] text-ink-muted uppercase font-bold">AQI</span>
                      <span className="text-[10px] font-black text-forest">{city.aqi}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-widest text-ink-muted">Status</span>
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                         status === 'Safe' ? 'bg-mint/20 text-forest' : 
                         status === 'Warning' ? 'bg-amber-100 text-amber-700' : 
                         'bg-red-100 text-red-700'
                       }`}>
                         {status}
                       </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Abstract Overlay for AI Monitoring Feel */}
      <div className="absolute inset-0 pointer-events-none border-[12px] border-white/50 rounded-[var(--radius-lg)] z-[1000]" />
      <div className="absolute top-4 right-4 z-[1000] bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border shadow-sm flex items-center gap-2">
         <span className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-mint"></span>
         </span>
         <span className="text-[10px] font-black uppercase tracking-widest text-forest">Live Monitoring</span>
      </div>
    </div>
  );
}
