// Final implementation
import React, { useState, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ensure Leaflet images are properly loaded
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
                <div className={`p-2 rounded-md ${currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                    <p className="font-bold">Temperature: {displayTemp.toFixed(1)}{unitSymbol}</p>
                    <p>Humidity: {point.humidity}%</p>
                    <p>Wind Speed: {point.windSpeed} {unit === 'imperial' ? 'mph' : 'km/h'}</p>
                </div>
            </Popup>
        </CircleMarker>
    );
}


export default function HeatMap({ position, carouselCities, carouselIndex, currentTheme, mainCityData, unit = 'metric' }) {
    const [showHeatmap, setShowHeatmap] = useState(true);

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
        </MapContainer>
    );
}