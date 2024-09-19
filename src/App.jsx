import { useState, useEffect, useCallback } from "react";

import debounce from 'lodash.debounce';
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
import {
  get5DaysForecast,
  getCityData,
  getMainCityData,
  addCityToFavorites,
  removeCity,
  getMainCitySuggestions,
  getModalCitySuggestions,
  setNotificationMessage,
  clearNotificationMessage,
  clearMainCitySuggestions,
  clearModalCitySuggestions
} from "./Store/Slices/WeatherSlice.js";
import { SphereSpinner } from "react-spinners-kit";
import { toggleTheme } from "./Store/Slices/ThemeSlice";
import { hostName, appId } from "./config/config.js";
import axios from 'axios';
// import { BoltLoader } from "react-awesome-loaders";

import noDataImg from '../public/no-data.png'

const myIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function App() {
  const [position, setPosition] = useState(null);
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
  const [isCollapsed, setIsCollapsed] = useState(true);

  const [city, setCity] = useState("Lahore");
  const [unit, setUnit] = useState("metric");
  const { currentTheme } = useSelector((state) => state.theme);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainCityInput, setMainCityInput] = useState("");
  const [favoriteCityInput, setFavoriteCityInput] = useState("");

  const dispatch = useDispatch();
  const {
    mainCityData,
    mainCityLoading,
    citySearchLoading,
    citySearchData,
    forecastLoading,
    forecastData,
    forecastError,
    selectedCities,
    mainCitySuggestions,
    modalCitySuggestions,
    notificationMessage,
  } = useSelector((state) => state.weather);

  const [loadings, setLoadings] = useState(true);
  const allLoadings = [mainCityLoading, citySearchLoading, forecastLoading];

  useEffect(() => {
    const fetchCityFromIP = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/');
        const cityName = response.data.city || 'Lahore';
        await fetchCoordinatesFromCity(cityName);
        setCity(cityName);
      } catch (error) {
        console.error('Error fetching city name:', error);
        await fetchCoordinatesFromCity('Lahore');
      } finally {
        setLoadings(false);
      }
    };

    const fetchCoordinatesFromCity = async (city) => {
      try {
        const apiKey = 'b47c307acaff417892a4666a14f675c6';
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
        const results = response.data.results;
        if (results.length > 0) {
          const { lat, lng } = results[0].geometry;
          setPosition([lat, lng]);
        } else {
          console.error('No results found for the city');
          setPosition([0, 0]);
        }
      } catch (error) {
        console.error('Error fetching coordinates:', error);
        setPosition([0, 0]);
      }
    };

    fetchCityFromIP();
  }, []);

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

  const handleMainCitySearch = async (e) => {
    e.preventDefault();
    if (!mainCityInput.trim()) return;

    setCity(mainCityInput);
    dispatch(getMainCityData({ city: mainCityInput, unit }));
    setMainCityInput("");
    dispatch(clearMainCitySuggestions());    
  };

  const getHourlyForecast = () => {
    if (!forecastData || !forecastData.list) return [];
    return forecastData.list.filter((data) => {
      const hour = new Date(data.dt_txt).getHours();
      return hour % 3 === 0;
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
    if (favoriteCityInput) {
      await dispatch(addCityToFavorites({ city: favoriteCityInput, unit: "metric" }));
      setFavoriteCityInput("");
      setIsModalOpen(false);
      dispatch(clearModalCitySuggestions());
    }
  };

  const handleRemoveCity = (city) => {
    dispatch(removeCity(city));
    dispatch(setNotificationMessage(`${city} removed successfully!`));
  };

  const fetchMainCitySuggestions = useCallback(
    debounce((query) => {
      if (query.trim().length >= 3) {
        dispatch(getMainCitySuggestions(query));
      }
    }, 300),
    []
  );

  const fetchModalCitySuggestions = useCallback(
    debounce((query) => {
      if (query.trim().length >= 3) {
        dispatch(getModalCitySuggestions(query));
      }
    }, 300),
    []
  );

  const handleMainCityInputChange = (e) => {
    setMainCityInput(e.target.value);
    fetchMainCitySuggestions(e.target.value);
  };

  const handleFavoriteCityInputChange = (e) => {
    setFavoriteCityInput(e.target.value);
    fetchModalCitySuggestions(e.target.value);
  };

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setIsModalOpen(false);
    }
  };

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  };

  const handleCollapseToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => {
        dispatch(clearNotificationMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage, dispatch]);

  useEffect(() => {
    if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Rain") {
      dispatch(setNotificationMessage(`Rain is expected in ${mainCityData.data.name} in the coming hours.`));
    }
  }, [mainCityData, dispatch]);

  const handleMainSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    dispatch(getMainCityData({ city: suggestion.name, unit }));
    setMainCityInput(suggestion.name);
    dispatch(clearMainCitySuggestions());
  };

  const handleModalSuggestionClick = (suggestion) => {
    setFavoriteCityInput(suggestion.name);
    dispatch(clearModalCitySuggestions());
  };

  return (
    <div className={`lg:h-screen p-3 flex flex-col gap-4 lg:gap-2 ${currentTheme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      {/* Top Section */}
      <div className="h-full flex flex-col gap-4 lg:h-[65%] lg:flex-row lg:gap-3">

        {/* Mobile search bar and toggle theme view  */}
        <div className="mt-4 lg:hidden flex flex-row justify-between">
          <div className={`search-bar`}>
            <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'} rounded-full h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
              <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
                <Icon icon={search} size={20} />
              </label>
              <input
                type="text"
                className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
                placeholder="Search City"
                value={mainCityInput}
                onChange={handleMainCityInputChange}
              />
              <button type="submit" className="bg-transparent text-gray-500 rounded-full h-full w-20 ">
                GO
              </button>
            </form>

            {mainCitySuggestions.length > 0 && (
              <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-10 w-full max-h-60 max-w-80 overflow-auto`}>
                {mainCitySuggestions.map((suggestion) => (
                  <li
                    key={`${suggestion.lat}-${suggestion.lon}`}
                    className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    onClick={() => handleMainSuggestionClick(suggestion)}
                  >
                    {suggestion.name}, {suggestion.country}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center bg-[#303136] border-2 rounded-full cursor-pointer relative w-14 h-8"
            onClick={() => dispatch(toggleTheme())}
          >
            <div
              className={`absolute bg-white w-1/2 h-full rounded-xl transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
                }`}
            ></div>
            <span className="absolute left-1 text-sm text-gray-400">
              <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#918888"
                  fillRule="evenodd"
                  d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
                  clipRule="evenodd" />
              </svg>
            </span>
            <span className="absolute right-1 text-sm text-blue-600">
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

        {/* Main City Card */}
        <div className="w-full lg:w-[25%] h-[350px] lg:h-full mainCardBg p-5 rounded-xl flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="">
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
              {/* <BoltLoader
                className={"loaderbolt"}
                boltColor={"#6366F1"}
                backgroundBlurColor={"#E0E7FF"}
              /> */}
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

                    <div className="space-y-2">
                      <div className="flex flex-row mb-2 justify-between">
                        <p className="text-sm" >Feels like {mainCityData.data.main.feels_like}&deg;</p>
                        <div className="flex space-x-2">
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowUp} size={14} className="" />
                            <span>{mainCityData.data.main.temp_max}&deg;</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowDown} size={14} className="" />
                            <span>{mainCityData.data.main.temp_min}&deg;</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row justify-between">
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={droplet} size={30} className=" mt-1" />
                          <span className="text-xs mt-1 font-bold">{mainCityData.data.main.humidity} %</span>
                          <p className="text-xs mt-1">Humidity</p>
                        </div>

                        <div className="border-l-2 border-gray-300 h-20 mx-4 mt-4"></div>

                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={wind} size={30} className=" mt-1" />
                          <span className="text-xs mt-1 font-bold">{mainCityData.data.wind.speed} kph</span>
                          <p className="text-xs mt-1">Wind</p>
                        </div>

                        <div className="border-l-2 border-gray-300 h-20 mx-4 mt-4"></div>

                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={activity} size={30} className="mt-1" />
                          <span className="text-xs mt-1 font-bold">{mainCityData.data.main.pressure} hPa</span>
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

        {/* In mobile we have favourite cities here */}
        <div className={`lg:hidden flex items-center w-full h-full rounded-lg ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}`}>
          <div className="flex flex-col justify-start h-full w-full rounded-lg p-4">
            <div className="flex justify-between">
              <h2 className="text-md font-semibold">Cities you are interested in</h2>
              <div className="mt-1 flex items-center space-x-2">
                {/* + icon for opening the Add City modal */}
                <div
                  className="text-2xl bg-blue-500 text-white rounded-full w-6 h-6 pb-1 flex justify-center items-center shadow-md hover:bg-blue-600"
                  onClick={() => setIsModalOpen(true)}
                >
                  <p>+</p>
                </div>

                {/* Chevron down for collapsing/expanding the cities section */}
                <div
                  className={`text-2xl bg-blue-500 text-white rounded-full w-6 h-6 flex justify-center items-center shadow-md hover:bg-blue-600 transform transition-transform duration-300 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
                  onClick={handleCollapseToggle}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 5.646a.5.5 0 0 1 .708 0L8 11.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Collapsible Cities Section */}
            {!isCollapsed && (
              <div className="flex flex-col justify-between mt-2 transition-all duration-300">
                <div className="w-full max-w-lg">
                  <div className="mx-1">
                    {selectedCities.length > 0 ? (
                      <div>
                        {selectedCities.map((city, index) => (
                          <div key={index} className="flex flex-row justify-between items-center bg-transparent rounded-lg">
                            <h5 className="text-sm font-semibold w-[30%]">{city.city}</h5>
                            <img src={`https://openweathermap.org/img/wn/${city.data.weather[0].icon}.png`} alt="icon" className="w-10 h-10" />
                            <h5 className="text-sm">{city.data.main.temp}&deg;</h5>
                            <button onClick={() => handleRemoveCity(city.city)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16">
                                <path fill="#d33636" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 mt-2 justify-center items-center w-full h-full">
                        <img src={noDataImg} className="h-12 w-12" />
                        <p className="text-xs">Click the + icon to add your favourite cities</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Popup Modal for adding cities */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm modal-overlay" onClick={handleOutsideClick}>
                <div className={`${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white'} mx-6 p-6 rounded-lg shadow-lg w-96 relative`} onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-md font-bold mb-4">Add your favourite city</h2>
                  <div className="mb-4 relative">
                    <input
                      type="text"
                      value={favoriteCityInput}
                      onChange={handleFavoriteCityInputChange}
                      className={`w-full p-2 text-xs ${currentTheme === 'dark' ? 'bg-[#303136] border-2' : 'bg-white border-2'} rounded`}
                      placeholder="Enter city name"
                    />
                    {modalCitySuggestions.length > 0 && (
                      <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-10 w-full max-h-60 overflow-auto`}>
                        {modalCitySuggestions.map((suggestion) => (
                          <li
                            key={`${suggestion.lat}-${suggestion.lon}`}
                            className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            onClick={() => handleModalSuggestionClick(suggestion)}
                          >
                            {suggestion.name}, {suggestion.country}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleAddCity}
                      className="bg-blue-500 text-xs text-white px-4 py-2 rounded mr-2"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-300 text-xs px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Large Screen view of side-bar notification and toggle theme & next 5 days and Map */}
        <div className={`w-full lg:w-[75%] lg:h-full ${currentTheme === 'dark' ? 'border-none' : 'bg-white border-2 p-3'} rounded-xl flex flex-col  space-y-1 lg:gap-3`}>
          <div className="flex flex-row relative justify-between">
            {/* Search bar */}
            <div className={`hidden lg:block search-bar`}>
              <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'} rounded-full h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
                <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
                  <Icon icon={search} size={20} />
                </label>
                <input
                  type="text"
                  className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
                  placeholder="Search City"
                  value={mainCityInput}
                  onChange={handleMainCityInputChange}
                />
                <button type="submit" className="bg-transparent text-gray-500 rounded-full h-full w-20 ">
                  GO
                </button>
              </form>
              {/* Suggestions */}
              {mainCitySuggestions.length > 0 && (
                <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-10 w-full max-h-60 max-w-80 overflow-auto`}>
                  {mainCitySuggestions.map((suggestion) => (
                    <li
                      key={`${suggestion.lat}-${suggestion.lon}`}
                      className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                      onClick={() => handleMainSuggestionClick(suggestion)}
                    >
                      {suggestion.name}, {suggestion.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Notifications */}
            <div className="flex">
              {notificationMessage && (
                <div className="fixed top-5 lg:top-0 lg:right-0 right-3 lg:relative lg:ml-5 text-xs  bg-blue-500 text-white px-4 py-2 rounded-xl shadow-md">
                  {notificationMessage}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center bg-[#303136] border-2 rounded-full cursor-pointer relative w-14 h-8"
              onClick={() => dispatch(toggleTheme())}
            >
              <div
                className={`absolute bg-white w-1/2 h-full rounded-xl transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
                  }`}
              ></div>
              <span className="absolute left-1 text-sm text-gray-400">
                <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                  <path
                    fill="#918888"
                    fillRule="evenodd"
                    d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
                    clipRule="evenodd" />
                </svg>
              </span>
              <span className="absolute right-1 text-sm text-blue-600">
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

          <div className="flex flex-col lg:flex-row h-[350px] lg:h-[90%] justify-between lg:gap-2">
            {/* Next 5 days Forecast */}
            <div className={`flex flex-col w-full h-full lg:w-[40%] ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'} rounded-lg pt-3`}>
              <h4 className="text-md pl-4 mb-1 font-semibold">
                Next 5 Days
              </h4>
              {filteredForecast.length > 0 ? (
                <div className="flex flex-col h-full pl-4">
                  {filteredForecast.map((data, index) => {
                    const date = new Date(data.dt_txt);
                    const day = date.toLocaleDateString("en-US", { weekday: "short" });
                    return (
                      <div
                        key={index}
                        className="flex flex-row justify-between items-center bg-transparent flex-grow"
                      >
                        <h5 className="text-sm w-[15%] font-semibold">{day}</h5>
                        <div className="w-[20%]">
                          <img
                            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                            alt="icon"
                            className="w-10 h-10"
                          />
                        </div>
                        <h5 className="text-xs w-[25%] font-light capitalize">
                          {data.weather[0].description}
                        </h5>
                        <h5 className="text-xs w-[40%] text-center">
                          {data.main.temp_max}&deg; / {data.main.temp_min}&deg;
                        </h5>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <div className="error-msg text-red-500 text-center py-24">
                    No Data Found
                  </div>
                </div>
              )}
            </div>

            {/* Map Section */}
            <div className={`hidden lg:flex items-center w-full h-full lg:w-[60%]  border-2 ${currentTheme === 'dark' ? 'border-[#303136] border-2' : ''} rounded-lg z-10`}>
              <div className="h-full w-full">
                {loadings ? (
                  <div className="flex justify-center items-center  w-full h-full">
                    <SphereSpinner loadings={loadings} color="#0D1DA9" size={30} />
                  </div>
                ) : (
                  position && (
                    <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
                      <TileLayer
                        url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
                        attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                      />
                      <Marker position={position} icon={myIcon}>
                        <Popup>
                          {mainCityData && mainCityData.data && (
                            <>
                              <h3>{mainCityData.data.name}</h3>
                              <p>Temperature: {mainCityData.data.main.temp}°C</p>
                              <p>Weather: {mainCityData.data.weather[0].description}</p>
                            </>
                          )}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className=" lg:h-[35%] h-full flex flex-col lg:flex-row lg:gap-3">
        {/* Bottom Section 1 */}
        <div className={`hidden lg:flex items-center w-full h-full lg:w-[30%]  rounded-lg ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}`}>
          <div className="flex flex-col justify-start h-full w-full rounded-lg p-4">
            <div className="flex justify-between">
              <h2 className="text-md font-semibold">Cities you are interested in</h2>
              <div className="mt-1">
                <div
                  className="text-2xl bg-blue-500 text-white rounded-full w-6 h-6 pb-1 flex justify-center items-center shadow-md hover:bg-blue-600 "
                  onClick={() => setIsModalOpen(true)}
                >
                  <p>+</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between mt-2">
              <div className="w-full  max-w-lg">
                <div className="mx-1">
                  {selectedCities.length > 0 ? (
                    <div>
                      {selectedCities.map((city, index) => (
                        <div
                          key={index}
                          className="flex flex-row justify-between items-center bg-transparent rounded-lg"
                        >
                          <h5 className="text-sm font-semibold w-[30%]">{city.city}</h5>
                          <img
                            src={`https://openweathermap.org/img/wn/${city.data.weather[0].icon}.png`}
                            alt="icon"
                            className="w-10 h-10"
                          />
                          <h5 className="text-sm">{city.data.main.temp}&deg;</h5>
                          <button
                            onClick={() => handleRemoveCity(city.city)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="#d33636" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>

                  ) : (
                    <div className="flex flex-col gap-4 mt-2 justify-center items-center  w-full h-full">
                      <img src={noDataImg} className="h-12 w-12" />
                      <p className="text-xs">Click the + icon to add you favourite cities</p>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* Popup Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm modal-overlay" onClick={handleOutsideClick}>
                <div className={`${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white'} p-6 rounded-lg shadow-lg w-96 relative`} onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-md font-bold mb-4">Add your favourite city</h2>
                  <div className="mb-4 relative">
                    <input
                      type="text"
                      value={favoriteCityInput}
                      onChange={handleFavoriteCityInputChange}
                      className={`w-full p-2 text-xs ${currentTheme === 'dark' ? 'bg-[#303136] border-2' : 'bg-white border-2'} rounded`}
                      placeholder="Enter city name"
                    />
                    {modalCitySuggestions.length > 0 && (
                      <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-10 w-full max-h-60 overflow-auto`}>
                        {modalCitySuggestions.map((suggestion) => (
                          <li
                            key={`${suggestion.lat}-${suggestion.lon}`}
                            className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                            onClick={() => handleModalSuggestionClick(suggestion)}
                          >
                            {suggestion.name}, {suggestion.country}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={handleAddCity}
                      className="bg-blue-500 text-xs text-white px-4 py-2 rounded mr-2"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="bg-gray-300 text-xs px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Bottom Section 2 */}
        <div className={`flex flex-col w-full h-full lg:w-[70%] pt-4 ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}  rounded-lg`}>
          <h4 className="text-md font-semibold pl-4 p-1">Hourly Forecast</h4>
          <div className="overflow-y-auto pl-4 h-full scroll-container">
            {hourlyForecast.length > 0 ? (
              <div className="flex flex-row mt-2  gap-1 p-1">
                {hourlyForecast.map((data, index) => {
                  const date = new Date(data.dt_txt);
                  const hour = date.getHours();
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  return (
                    <div
                      key={index}
                      className="w-full max-w-[150px] h-full p-2 flex flex-col items-center justify-between"
                    >
                      <div className="flex items-center justify-center gap-1   w-full mb-2">
                        <span className="text-xs font-semibold">
                          {`${hour12}:00 ${ampm}`}
                        </span>
                      </div>
                      <img
                        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                        alt="icon"
                        className="w-10 h-10 mb-2"
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-light truncate mr-1" title={data.weather[0].description}>
                          {data.weather[0].description}
                        </span>
                        <span className="text-xs font-semibold whitespace-nowrap">{Math.round(data.main.temp)}&deg;</span>
                      </div>
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

      {/* Map section in mobile view is at last */}
      <div className={`lg:hidden flex items-center w-full h-[345px] border-2 ${currentTheme === 'dark' ? 'border-[#303136] border-2' : ''} rounded-lg z-10`}>
        <div className="h-full w-full">
          {loadings ? (
            <div className="flex justify-center items-center  w-full h-full">
              <SphereSpinner loadings={loadings} color="#0D1DA9" size={30} />
            </div>
          ) : (
            position && (
              <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
                <TileLayer
                  url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
                  attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                />
                <Marker position={position} icon={myIcon}>
                  <Popup>
                    {mainCityData && mainCityData.data && (
                      <>
                        <h3>{mainCityData.data.name}</h3>
                        <p>Temperature: {mainCityData.data.main.temp}°C</p>
                        <p>Weather: {mainCityData.data.weather[0].description}</p>
                      </>
                    )}
                  </Popup>
                </Marker>
              </MapContainer>
            )
          )}
        </div>
      </div>
    </div >
  );
}

export default App;