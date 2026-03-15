import React from 'react';

// A simple interactive SVG map of India with clickable/hoverable dots for major cities
export default function MapView({ citiesData = [], onCityClick, activeCity }) {
  // Rough relative coordinates for a simple abstract map representation 
  // x, y percentages
  const PLACEMENTS = {
    'Delhi': { top: '25%', left: '38%' },
    'Mumbai': { top: '65%', left: '28%' },
    'Bangalore': { top: '80%', left: '42%' },
    'Chennai': { top: '85%', left: '50%' },
    'Pune': { top: '68%', left: '32%' },
    'Hyderabad': { top: '70%', left: '45%' },
    'Kolkata': { top: '55%', left: '75%' },
  };

  const getRiskColor = (risk) => {
    switch(risk?.toUpperCase()) {
      case 'HIGH': return 'bg-coral shadow-[0_0_15px_rgba(255,107,107,0.6)]';
      case 'MODERATE': return 'bg-amber shadow-[0_0_15px_rgba(217,119,6,0.6)]';
      default: return 'bg-teal shadow-[0_0_10px_rgba(13,148,136,0.4)]';
    }
  };

  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] max-w-lg mx-auto bg-surface-sunken rounded-[var(--radius)] border border-border overflow-hidden">
      {/* India Map Outline SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.15] text-indigo" viewBox="0 0 800 1000" fill="currentColor">
        <path d="M380,50 L420,70 L460,90 L480,120 L500,160 L520,200 L530,250 L560,280 L600,300 L630,330 L650,380 L660,430 L640,480 L600,520 L560,560 L530,600 L510,650 L500,700 L480,750 L450,800 L420,850 L380,900 L340,930 L300,950 L260,900 L230,850 L210,800 L200,750 L190,700 L180,650 L170,600 L160,550 L150,500 L160,450 L180,400 L210,350 L240,300 L270,250 L290,200 L310,150 L330,100 L350,70 Z" />
      </svg>

      {/* Abstract Map Background Pattern */}
      <div className="absolute inset-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(var(--indigo) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      {citiesData.map((data) => {
        const pos = PLACEMENTS[data.city];
        if (!pos) return null;
        
        const isHovered = activeCity === data.city;
        const colorClass = getRiskColor(data.risk);

        return (
          <div 
            key={data.city}
            className="absolute group transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10"
            style={{ top: pos.top, left: pos.left }}
            onClick={() => onCityClick?.(data)}
            onMouseEnter={() => onCityClick?.(data)}
            onMouseLeave={() => onCityClick?.(null)}
          >
            {/* Pulsing ring for high risk */}
            {data.risk?.toUpperCase() === 'HIGH' && (
              <span className="absolute inset-0 rounded-full animate-ping bg-coral opacity-40 h-full w-full"></span>
            )}
            
            {/* Dashboard Preview */}
            <div className="absolute -top-2 -right-24 w-48 h-32 bg-surface/90 backdrop-blur-md rounded-lg border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 pointer-events-none">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-indigo mr-1"></span>
                  <span className="text-xs font-semibold text-text-light">Live Data</span>
                </div>
                <svg className="w-3 h-3 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-sunken rounded p-1">
                  <div className="text-[8px] text-text-lighter">Temp</div>
                  <div className="text-xs font-bold text-text">{data.temp !== undefined ? `${Math.round(data.temp)}°C` : '--'}</div>
                </div>
                <div className="bg-surface-sunken rounded p-1">
                  <div className="text-[8px] text-text-lighter">Weather</div>
                  <div className="text-xs font-bold text-text truncate">{data.weatherCondition || '--'}</div>
                </div>
                <div className="bg-surface-sunken rounded p-1 col-span-2">
                  <div className="text-[8px] text-text-lighter">Air Quality</div>
                  <div className="text-xs font-bold text-text flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-1 ${data.aqi > 150 ? 'bg-coral' : 'bg-teal'}`}></span>
                    {data.aqi ? `AQI ${data.aqi}` : 'Good'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Central Dot */}
            <div className={`relative w-4 h-4 rounded-full border-2 border-white ${colorClass} transition-transform ${isHovered ? 'scale-125' : ''}`} />
            
            {/* Tooltip Label */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-max px-2 py-1 bg-ink text-white text-[10px] font-bold rounded shadow-lg transition-opacity ${isHovered ? 'opacity-100 z-20' : 'opacity-0'} pointer-events-none`}>
              {data.city}: {data.status || 'Active'}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-ink"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
