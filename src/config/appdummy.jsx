import { useState, useEffect } from "react";
import Icon from "react-icons-kit";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { search } from "react-icons-kit/feather/search";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { droplet } from "react-icons-kit/feather/droplet";
import { wind } from "react-icons-kit/feather/wind";
import { activity } from "react-icons-kit/feather/activity";
import { useDispatch, useSelector } from "react-redux";
import { get5DaysForecast, getCityData, getMainCityData, addCityToFavorites, removeCity } from "./Store/Slices/WeatherSlice.js";
import { SphereSpinner } from "react-spinners-kit";
import { toggleTheme } from "./Store/Slices/ThemeSlice";

const myIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function App() {
  // Map Position
  const [position, setPosition] = useState(null);
  // Date Formatting
  const now = new Date();
  const dayOptions = { weekday: 'long' };
  const dateOptions = { day: '2-digit' };
  const monthOptions = { month: 'short' };
  const yearOptions = { year: '2-digit' };
  const day = now.toLocaleDateString('en-GB', dayOptions);
  const date = now.toLocaleDateString('en-GB', dateOptions);
  const month = now.toLocaleDateString('en-GB', monthOptions);
  const year = now.toLocaleDateString('en-GB', yearOptions);
  const formattedDate = `${day}, ${date} ${month} ${year}`;
  // metric = C and imperial = F
  const [city, setCity] = useState("Lahore");
  const [unit, setUnit] = useState("metric");
  // Get the current theme
  const { currentTheme } = useSelector((state) => state.theme);

  // For add Favourite Cities (up to 3)
  const [cityInput, setCityInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();
  // redux state
  const {
    mainCityData,
    mainCityLoading,
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
    selectedCities,
  } = useSelector((state) => state.weather);

  const [loadings, setLoadings] = useState(true);
  const allLoadings = [mainCityLoading, citySearchLoading, forecastLoading];

  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  useEffect(() => {
    dispatch(getMainCityData({ city, unit }));
  }, [dispatch, city, unit]);

  useEffect(() => {
    const isAnyChildLoading = [mainCityLoading].some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [mainCityLoading]);

  useEffect(() => {
    if (mainCityData && mainCityData.data) {
      dispatch(
        get5DaysForecast({
          lat: mainCityData.data.coord.lat,
          lon: mainCityData.data.coord.lon,
          unit,
        })
      );
    }
  }, [mainCityData, dispatch, unit]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setPosition([latitude, longitude]);
    });
  }, []);

  const handleCitySearch = (e) => {
    e.preventDefault();
    setLoadings(true);
    dispatch(getCityData({ city, unit }));
  };

  const getHourlyForecast = () => {
    if (!forecastData || !forecastData.list) return [];

    // Extract hourly forecast data (every 3 hours)
    return forecastData.list.filter((data) => {
      const hour = new Date(data.dt_txt).getHours();
      return hour % 3 === 0; // Every 3 hours
    });
  };

  const hourlyForecast = getHourlyForecast();

  const filterForecastByFirstObjTime = (forecastData) => {
    if (!forecastData) {
      return [];
    }
    const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
    return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
  };

  const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

  const handleAddCity = async () => {
    if (cityInput) {
      dispatch(addCityToFavorites({ city: cityInput, unit: "metric" }));
      setCityInput("");
      setIsModalOpen(false); // Close modal after adding city
    }
  };

  const handleRemoveCity = (city) => {
    dispatch(removeCity(city));
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  };

  return (
    <div className={`h-screen p-4 flex flex-col ${currentTheme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row lg:gap-4 lg:space-x-4 h-[calc(100vh-80px)]">
        <div className="lg:w-[25%] bg-blue-400 p-5 rounded-xl flex flex-col flex-1">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <p className="text-xs">{formattedDate}</p>
            </div>
            <div
              className="flex items-center bg-gray-300 rounded-xl cursor-pointer relative w-14 h-5"
              onClick={toggleUnit}
            >
              <div
                className={`absolute bg-white w-1/2 h-full rounded-xl transition-transform ${unit === "metric" ? "transform translate-x-0" : "transform translate-x-full"
                  }`}
              ></div>
              <span className="absolute left-2 text-sm text-black">C</span>
              <span className="absolute right-2 text-sm text-black">F</span>
            </div>
          </div>

          {loadings ? (
            <div className="flex justify-center items-center h-20">
              <SphereSpinner loadings={loadings} color="#0D1DA9" size={20} />
            </div>
          ) : (
            <>
              {mainCityData && mainCityData.error ? (
                <div className="text-red-500 text-center">{mainCityData.error}</div>
              ) : forecastError ? (
                <div className="text-red-500 text-center">{forecastError}</div>
              ) : (
                mainCityData && mainCityData.data && (
                  <div className="flex flex-col space-y-4">
                    {/* City and Temp */}
                    <div className="flex flex-col items-center">
                      <h4 className="text-md font-bold">{mainCityData.data.name}</h4>
                      <div className="flex items-center">
                        <img
                          className="w-20 h-20"
                          src={`https://openweathermap.org/img/wn/${mainCityData.data.weather[0].icon}@2x.png`}
                          alt="icon"
                        />
                        <h1 className="text-2xl font-bold">
                          {mainCityData.data.main.temp}&deg;
                        </h1>
                      </div>
                      <h4 className="capitalize font-semibold">{mainCityData.data.weather[0].description}</h4>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2">
                      <div className="flex flex-row mb-2 justify-between">
                        <p className="text-sm">Feels like {mainCityData.data.main.feels_like}&deg;</p>
                        <div className="flex space-x-2">
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowUp} size={14} className="text-white" />
                            <span>{mainCityData.data.main.temp_max}&deg;</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowDown} size={14} className="text-white" />
                            <span>{mainCityData.data.main.temp_min}&deg;</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center text-xs">
                          <Icon icon={droplet} size={14} className="text-white" />
                          <span>{mainCityData.data.main.humidity}%</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <Icon icon={wind} size={14} className="text-white" />
                          <span>{mainCityData.data.wind.speed} m/s</span>
                        </div>
                      </div>
                      <div className="flex items-center text-xs">
                        <Icon icon={activity} size={14} className="text-white" />
                        <span>Pressure: {mainCityData.data.main.pressure} hPa</span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Right Section: Map and City Search */}
        <div className="lg:w-[75%] flex-1">
          <MapContainer
            center={position || [51.505, -0.09]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {position && (
              <Marker position={position} icon={myIcon}>
                <Popup>Your location</Popup>
              </Marker>
            )}
          </MapContainer>

          <form onSubmit={handleCitySearch} className="flex mt-4">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-l-md"
              placeholder="Search city..."
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-r-md">
              <Icon icon={search} size={16} />
            </button>
          </form>

          {/* Hourly Forecast */}
          <div className="mt-4">
            <h3 className="text-lg font-bold">Hourly Forecast</h3>
            <div className="flex space-x-2 overflow-x-auto">
              {hourlyForecast.map((forecast, index) => (
                <div key={index} className="flex flex-col items-center p-2">
                  <p>{new Date(forecast.dt_txt).getHours()}:00</p>
                  <img
                    src={`https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`}
                    alt="icon"
                    className="w-12 h-12"
                  />
                  <p>{forecast.main.temp}&deg;</p>
                </div>
              ))}
            </div>
          </div>

          {/* Additional UI */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 p-2 bg-green-500 text-white rounded-md"
          >
            Add City
          </button>

          {/* Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 modal-overlay"
              onClick={handleOutsideClick}
            >
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-2">Add City</h2>
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter city name"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 bg-gray-500 text-white rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCity}
                    className="p-2 bg-blue-500 text-white rounded-md"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
