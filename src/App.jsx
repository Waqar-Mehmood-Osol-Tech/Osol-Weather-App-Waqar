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
import { toggleTheme } from "./Store/Slices/ThemeSlice"; // Import the toggleTheme action

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

  // For add Favouroite Citirs (up to 3)
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

  // const handleCitySearch = (e) => {
  //   e.preventDefault();
  //   setLoadings(true);
  //   dispatch(getCityData({ city, unit }));
  // };

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return; // Prevent search if input is empty

    setLoadings(true);
    dispatch(getCityData({ city, unit }));
    setLoadings(false); // Reset loading state, or manage it in the Redux slice
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
      <div className="top-section flex flex-row gap-3">
        {/* Section 1 of Top Section */}
        <div className="lg:w-[25%] lg:h-[350px] bg-blue-400 p-5 rounded-xl flex flex-col">

          <div className="flex justify-between items-center mb-4">
            <div className="text-white">
              <div>
                <p className="text-xs">{formattedDate}</p>
              </div>
            </div>
            <div
              className="flex items-center bg-gray-300 rounded-xl cursor-pointer relative w-14 h-5 "
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
                  <div className="flex flex-col space-y-4 ">

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
                        <p className="text-sm" >Feels like {mainCityData.data.main.feels_like}&deg;</p>
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


                      <div className="flex flex-row justify-between">
                        {/* Humidity */}
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={droplet} size={30} className="text-white mt-1" />
                          <span className="text-xs mt-1 font-bold">{mainCityData.data.main.humidity}%</span>
                          <p className="text-xs mt-1">Humidity</p>
                        </div>

                        <div class="border-l-2 border-gray-300 h-20 mx-4 mt-4"></div>

                        {/* Wind */}
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={wind} size={30} className="text-white mt-1" />
                          <span className="text-xs mt-1 font-bold">{mainCityData.data.wind.speed}kph</span>
                          <p className="text-xs mt-1">Wind</p>
                        </div>

                        <div class="border-l-2 border-gray-300 h-20 mx-4 mt-4"></div>


                        {/* Pressure */}
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={activity} size={30} className="text-white mt-1" />
                          <span className="text-xs mt-1 font-bold">{mainCityData.data.main.pressure}hPa</span>
                          <p className="text-xs mt-1">Pressure</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Section 2 of Top Section */}
        <div className="lg:w-[75%]  lg:h-[350px] border-2 rounded-xl flex flex-col">
          {/* Search Bar and theme */}
          <div className="flex flex-row justify-between p-3">
            <div className="search-bar border-2 rounded-full">
              <form
                className="flex items-center bg-transparent rounded-full h-8 "
                autoComplete="off"
                onSubmit={handleCitySearch}
              >
                <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
                  <Icon icon={search} size={20} />
                </label>
                <input
                  type="text"
                  className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
                  placeholder="Search City"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-transparent text-gray-500 rounded-full h-full w-20 "
                >
                  GO
                </button>
              </form>
            </div>

            {/* Theme Toggle Button */}
            <div className="flex items-center bg-black border-2 rounded-full cursor-pointer relative w-14 h-8"
              onClick={() => dispatch(toggleTheme())}
            >
              <div
                className={`absolute bg-white w-1/2 h-full rounded-xl transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
                  }`}
              ></div>
              <span className="absolute left-1 text-sm text-gray-400">
                {/* Sun icon for light mode */}
                <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#918888"
                    fill-rule="evenodd"
                    d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
                    clip-rule="evenodd" />
                </svg>
              </span>
              <span className="absolute right-1 text-sm text-blue-600">
                {/* Moon icon for dark mode */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* Next 5 days and hourly forecast */}
          <div className="flex flex-row justify-between gap-2 p-3">
            {/* Five Days Forecast */}
            <div className="flex flex-col h-full w-full lg:w-[60%] bg-transparent border-2 rounded-lg ">
              <h4 className="text-xl pl-4 font-semibold p-1">
                Next 5 Days
              </h4>
              {filteredForecast.length > 0 ? (
                <div className="flex flex-col gap-1 p-1">
                  {filteredForecast.map((data, index) => {
                    const date = new Date(data.dt_txt);
                    const day = date.toLocaleDateString("en-US", { weekday: "short" });
                    return (
                      <div
                        key={index}
                        className="flex flex-row justify-between px-4 items-center bg-transparent"
                      >
                        <h5 className="text-sm w-[15%] font-semibold">{day}</h5>
                        <img
                          src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                          alt="icon"
                          className="w-10 h-10 mx-2"
                        />
                        <h5 className="text-xs font-light capitalize">
                          {data.weather[0].description}
                        </h5>
                        <h5 className="text-xs">
                          {data.main.temp_max}&deg; / {data.main.temp_min}&deg;
                        </h5>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="error-msg text-red-500 text-center py-24">No Data Found</div>
              )}
            </div>

            {/* Map */}
            <div className="flex items-center w-full h-full lg:w:[40%] bg-transparent border-2 rounded-lg z-10">
              <div className="h-full  w-full">
                {position ? (
                  <MapContainer center={position} zoom={10} zoomControl={false} className="h-full">
                    {/* MapTiler tile layer with language support */}
                    <TileLayer
                      url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
                      attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                    />
                    <Marker position={position} icon={myIcon} >
                      <Popup>You are here</Popup>
                    </Marker>
                  </MapContainer>
                ) : (
                  <p>Fetching location...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botton Section */}
      <div className="flex flex-row mt-2 h-full gap-2">
        <div className="flex items-center w-full h-full lg:w:[30%] bg-transparent border-2 rounded-lg">
          <div className="flex flex-col justify-start h-full w-full bg-transparent py-1 px-4">
            {/* section 1 of bottom section */}
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Selected Cities</h2>
              {/* + Icon to open the modal */}
              <div className="mt-1">
                <div
                  onClick={() => setIsModalOpen(true)}
                  disabled={selectedCities.length >= 3}
                  className="text-2xl bg-blue-500 text-white rounded-full w-6 h-6 pb-1 flex justify-center items-center shadow-md hover:bg-blue-600 "
                >
                  <p>+</p>
                </div>
              </div>
            </div>

            {/* Display selected cities */}
            <div className="flex flex-col">
              <div className="w-full max-w-lg">
                <div className="mx-1">
                  {selectedCities.map((cityData) => (
                    <div
                      key={cityData.city}
                      className="flex flex-row justify-between items-center bg-transparent rounded-lg"
                    >
                      <h3 className="text-sm w-[30%]">{cityData.city}</h3>
                      {cityData.data ? (
                        <>
                          {/* Display the weather icon */}
                          <img
                            src={`http://openweathermap.org/img/wn/${cityData.data.weather[0].icon}@2x.png`}
                            alt={cityData.data.weather[0].description}
                            className="w-10 h-10"
                          />
                          <p className="text-sm">{cityData.data.main.temp}°C</p>
                        </>
                      ) : (
                        <p className="text-red-500">Error: {cityData.error}</p>
                      )}
                      <button
                        onClick={() => handleRemoveCity(cityData.city)}

                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="#d33636" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Modal Popup */}
            {isModalOpen && (
              <div
                className="modal-overlay fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
                onClick={handleOutsideClick}
              >
                <div className="modal-container bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  >
                    &#10005; {/* Close (X) icon */}
                  </button>
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Add a City</h2>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Enter city name"
                    className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddCity}
                    className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    Add City
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2 bottom section */}
        {/* Hourly Forecast */}
        <div className="flex flex-col w-full h-full lg:w:[70%] bg-transparent border-2 rounded-lg">
          <h4 className="text-xl pl-4 font-semibold p-1">
            Hourly Forecast
          </h4>
          <div className="w-[700px] overflow-y-auto scroll-container">
            {hourlyForecast.length > 0 ? (
              <div className="flex flex-row gap-1 p-1">
                {hourlyForecast.map((data, index) => {
                  const date = new Date(data.dt_txt);
                  const hour = date.getHours();
                  const time = `${hour}:00`;

                  return (
                    <div
                      key={index}
                      className="flex flex-col justify-between px-4 items-center bg-transparent"
                    >
                      <h5 className="text-sm w-[20%] font-semibold">{time}</h5>
                      <img
                        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                        alt="icon"
                        className="w-10 h-10 mx-2"
                      />
                      <h5 className="text-xs font-light capitalize">
                        {data.weather[0].description}
                      </h5>
                      <h5 className="text-xs">
                        {data.main.temp}&deg;
                      </h5>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="error-msg text-red-500 text-center py-24">No Data Found</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
