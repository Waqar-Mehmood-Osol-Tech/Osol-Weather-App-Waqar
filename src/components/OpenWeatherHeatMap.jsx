// 


import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { Sun, Thermometer } from 'lucide-react';
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

const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual API key

function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
}

function WeatherLayerSelector({ currentTheme }) {
    return (
        <div className={`leaflet-top leaflet-right ${currentTheme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 p-2 rounded-md shadow-md">
                <h4 className="font-bold mb-2">Weather Layers</h4>
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="OpenStreetMap">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.Overlay name="Clouds">
                        <TileLayer
                            url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                            attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Precipitation">
                        <TileLayer
                            url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                            attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Sea Level Pressure">
                        <TileLayer
                            url={`https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                            attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Wind Speed">
                        <TileLayer
                            url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                            attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                        />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="Temperature">
                        <TileLayer
                            url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                            attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                        />
                    </LayersControl.Overlay>
                </LayersControl>
            </div>
        </div>
    );
}

export default function WeatherMapOpen({ position, carouselCities, carouselIndex, currentTheme, mainCityData, unit = 'metric' }) {
    const [showWeatherLayers, setShowWeatherLayers] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    useEffect(() => {
        setMapKey(prevKey => prevKey + 1);
    }, [position]);

    if (!position || !Array.isArray(position) || position.length !== 2) {
        return <div>Loading map...</div>;
    }

    return (
        <div className="relative w-full h-[400px]">
            <MapContainer 
                key={mapKey}
                center={position} 
                zoom={10} 
                zoomControl={false} 
                style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
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
                {showWeatherLayers && <WeatherLayerSelector currentTheme={currentTheme} />}
            </MapContainer>
            <div className="absolute top-4 right-4 z-[1000]">
                <button
                    onClick={() => setShowWeatherLayers(!showWeatherLayers)}
                    className={`flex items-center space-x-2 p-2 rounded-lg shadow-md ${
                        currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    }`}
                >
                    <span className="text-sm font-medium">Weather Layers</span>
                    {showWeatherLayers ? (
                        <Thermometer className="w-5 h-5 text-red-500" />
                    ) : (
                        <Sun className="w-5 h-5 text-yellow-500" />
                    )}
                </button>
            </div>
        </div>
    );
}