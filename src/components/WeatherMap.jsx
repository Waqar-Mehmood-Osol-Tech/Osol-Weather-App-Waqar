// Final implementation
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Sun, Thermometer } from 'lucide-react';

// Ensure Leaflet images are properly loaded
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
// import './LeafletMap.css';  // Add this line

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }) {
    const map = useMap();
    React.useEffect(() => {
        if (map && center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

function HeatmapToggle({ showHeatmap, setShowHeatmap, currentTheme }) {
    return (
        <div className="leaflet-top leaflet-right">
            <div className="leaflet-control leaflet-bar">
                <div className={`flex items-center space-x-2 p-2 rounded-sm shadow-md ${currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                    <span className="text-sm font-medium">Heat Map</span>
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${showHeatmap ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                        <span className="sr-only">Toggle heatmap</span>
                        <span
                            className={`${showHeatmap ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                    {showHeatmap ? (
                        <Thermometer className="w-5 h-5 text-red-500" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                </div>
            </div>
        </div>
    );
}

function HeatmapPoint({ point, currentTheme, unit }) {
    const [isHovered, setIsHovered] = useState(false);

    const eventHandlers = useMemo(
        () => ({
            mouseover: () => {
                setIsHovered(true);
            },
            mouseout: () => {
                setIsHovered(false);
            },
        }),
        []
    );

    const getColor = (temp) => {
        const celsiusTemp = unit === 'imperial' ? (temp - 32) * 5 / 9 : temp;
        if (celsiusTemp < 0) return '#0000FF';  // Blue for very cold
        if (celsiusTemp < 10) return '#00FFFF'; // Cyan for cold
        if (celsiusTemp < 20) return '#00FF00'; // Green for cool
        if (celsiusTemp < 30) return '#FFFF00'; // Yellow for warm
        if (celsiusTemp < 40) return '#FF8000'; // Orange for hot
        return '#FF0000';                       // Red for very hot
    };

    const displayTemp = unit === 'imperial' ? point.intensity : point.intensity;
    const unitSymbol = unit === 'imperial' ? '°F' : '°C';

    useEffect(() => {
        document.body.className = currentTheme === 'dark' ? 'dark-theme' : '';
    }, [currentTheme]);

    return (
        <CircleMarker
            center={[point.lat, point.lng]}
            radius={isHovered ? 12 : 8}
            fillColor={getColor(point.intensity)}
            fillOpacity={0.7}
            stroke={true}
            weight={2}
            color={currentTheme === 'dark' ? 'white' : 'white'}
            eventHandlers={eventHandlers}
        >
            <Popup>
                <div
                    // className={`p-2 rounded-md ${currentTheme === 'dark'
                    //     ? 'bg-gray-800 text-white [&_.leaflet-popup-content-wrapper]:bg-gray-800'
                    //     : 'bg-white text-gray-800 [&_.leaflet-popup-content-wrapper]:bg-white'
                    //     }`}
                >
                    <p className="font-bold">Temperature: {displayTemp.toFixed(1)}{unitSymbol}</p>
                    <p>Humidity: {point.humidity}%</p>
                    <p>Wind Speed: {point.windSpeed} {unit === 'imperial' ? 'mph' : 'km/h'}</p>
                </div>
            </Popup>
        </CircleMarker>
    );
}

function HeatmapLegend({ currentTheme, unit }) {
    const legendItems = unit === 'imperial'
        ? [
            { color: 'bg-blue-500', label: 'Very Cold', range: '< 32°F' },
            { color: 'bg-cyan-500', label: 'Cold', range: '32-50°F' },
            { color: 'bg-green-500', label: 'Cool', range: '50-68°F' },
            { color: 'bg-yellow-500', label: 'Warm', range: '68-86°F' },
            { color: 'bg-orange-500', label: 'Hot', range: '86-104°F' },
            { color: 'bg-red-500', label: 'Very Hot', range: '> 104°F' },
        ]
        : [
            { color: 'bg-blue-500', label: 'Very Cold', range: '< 0°C' },
            { color: 'bg-cyan-500', label: 'Cold', range: '0-10°C' },
            { color: 'bg-green-500', label: 'Cool', range: '10-20°C' },
            { color: 'bg-yellow-500', label: 'Warm', range: '20-30°C' },
            { color: 'bg-orange-500', label: 'Hot', range: '30-40°C' },
            { color: 'bg-red-500', label: 'Very Hot', range: '> 40°C' },
        ];

    return (
        <div className="leaflet-bottom leaflet-left">
            <div className={`leaflet-control leaflet-bar p-2 rounded-md shadow-md ${currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                <h4 className="font-bold mb-2">Temperature Legend</h4>
                {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <span className={`w-4 h-4 rounded-full ${item.color}`}></span>
                        <span>{item.label} ({item.range})</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function WeatherMap({ position, carouselCities, carouselIndex, currentTheme, mainCityData, unit = 'metric' }) {
    const [showHeatmap, setShowHeatmap] = useState(false);

    const generateHeatmapData = useCallback(() => {
        if (!mainCityData || !mainCityData.data) return [];

        const { lat, lon } = mainCityData.data.coord;
        const temp = mainCityData.data.main.temp;

        const points = [];
        for (let i = 0; i < 100; i++) {
            points.push({
                lat: lat + (Math.random() - 0.5) * 0.5,
                lng: lon + (Math.random() - 0.5) * 0.5,
                intensity: temp + (Math.random() - 0.5) * 10,
                humidity: Math.round(Math.random() * 100),
                windSpeed: Math.round(Math.random() * 20),
            });
        }

        return points;
    }, [mainCityData]);

    const heatmapData = useMemo(() => generateHeatmapData(), [generateHeatmapData]);

    if (!position) {
        return <div>Loading map...</div>;
    }

    return (
        <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
                attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
            />
            {showHeatmap && (
                <>
                    {heatmapData.map((point, index) => (
                        <HeatmapPoint key={index} point={point} currentTheme={currentTheme} unit={unit} />
                    ))}
                    <HeatmapLegend currentTheme={currentTheme} unit={unit} />
                </>
            )}
            <Marker position={position}>
                <Popup>
                    {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
                        <>
                            <h3>{carouselCities[carouselIndex].data.name}</h3>
                        </>
                    )}
                </Popup>
            </Marker>
            <MapUpdater center={position} />
            <HeatmapToggle showHeatmap={showHeatmap} setShowHeatmap={setShowHeatmap} currentTheme={currentTheme} />
        </MapContainer>
    );
}