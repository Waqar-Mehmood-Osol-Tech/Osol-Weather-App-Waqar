import { useState, useEffect, useCallback } from "react";
import debounce from 'lodash.debounce';
import Icon from "react-icons-kit";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { search } from "react-icons-kit/feather/search";
import { arrowUp } from "react-icons-kit/feather/arrowUp";
import { arrowDown } from "react-icons-kit/feather/arrowDown";
import { droplet } from "react-icons-kit/feather/droplet";
import { wind } from "react-icons-kit/feather/wind";
import { activity } from "react-icons-kit/feather/activity";
import { chevronLeft } from "react-icons-kit/feather/chevronLeft";
import { chevronRight } from "react-icons-kit/feather/chevronRight";
import { useDispatch, useSelector } from "react-redux";
import {
  get5DaysForecast,
  getMainCityData,
  addCityToFavorites,
  removeCity,
  getMainCitySuggestions,
  setNotificationMessage,
  clearNotificationMessage,
  clearMainCitySuggestions,
} from "./Store/Slices/WeatherSlice.js";
import { SphereSpinner } from "react-spinners-kit";
import { toggleTheme } from "./Store/Slices/ThemeSlice";
import axios from 'axios';

import noDataImg from './assets/no-data.png';

const myIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

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

  const [city, setCity] = useState("Lahore");
  const [unit, setUnit] = useState("metric");
  const { currentTheme } = useSelector((state) => state.theme);

  const [mainCityInput, setMainCityInput] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const dispatch = useDispatch();

  const {
    mainCityData,
    mainCityLoading,
    citySearchLoading,
    forecastLoading,
    forecastData,
    forecastError,
    selectedCities,
    mainCitySuggestions,
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
      setPosition([mainCityData.data.coord.lat, mainCityData.data.coord.lon]);
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
    setCarouselIndex(0);
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

  const handleRemoveCity = (city) => {
    dispatch(removeCity(city));
    dispatch(setNotificationMessage({ message: `${city} removed successfully!`, type: 'success' }));
    if (carouselIndex > 0) setCarouselIndex(carouselIndex - 1);
  };

  const fetchMainCitySuggestions = useCallback(
    debounce((query) => {
      if (query.trim().length >= 3) {
        dispatch(getMainCitySuggestions(query));
      } else {
        dispatch(clearMainCitySuggestions());
      }
    }, 300),
    []
  );

  const handleMainCityInputChange = (e) => {
    setMainCityInput(e.target.value);
    fetchMainCitySuggestions(e.target.value);
  };

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
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
      dispatch(setNotificationMessage({ message: `Rain is expected in ${mainCityData.data.name} in the coming hours.`, type: 'info' }));
    }
    else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clouds") {
      dispatch(setNotificationMessage({ message: `Cloudy weather is expected in ${mainCityData.data.name} in the coming hours.`, type: 'info' }));
    }
    else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clear") {
      dispatch(setNotificationMessage({ message: `Clear weather expected in ${mainCityData.data.name} in the coming hours.`, type: 'info' }));
    }
  }, [mainCityData, dispatch]);

  const handleMainSuggestionClick = (suggestion) => {
    setCity(suggestion.name);
    dispatch(getMainCityData({ city: suggestion.name, unit }));
    setMainCityInput(suggestion.name);
    dispatch(clearMainCitySuggestions());
    setCarouselIndex(0);
  };

  const handleAddToInterested = () => {
    if (mainCityInput) {
      if (selectedCities.length >= 3) {
        dispatch(setNotificationMessage({ message: "You can't add more than 3 cities.", type: 'error' }));
      } else if (selectedCities.some(city => city.city.toLowerCase() === mainCityInput.toLowerCase())) {
        dispatch(setNotificationMessage({ message: "This city is already in your favorites.", type: 'error' }));
      } else {
        dispatch(addCityToFavorites({ city: mainCityInput, unit: "metric" }));
        dispatch(setNotificationMessage({ message: `${mainCityInput} added successfully.`, type: 'success' }));
        setMainCityInput("");
        dispatch(clearMainCitySuggestions());
      }
    }
  };

  const handleInterestedCityClick = (city) => {
    setCity(city);
    dispatch(getMainCityData({ city, unit }));
    setCarouselIndex(selectedCities.findIndex(c => c.city === city) + 1);
  };

  useEffect(() => {
    localStorage.setItem('interestedCities', JSON.stringify(selectedCities));
  }, [selectedCities]);

  useEffect(() => {
    const storedCities = JSON.parse(localStorage.getItem('interestedCities'));
    if (storedCities) {
      storedCities.forEach(city => {
        dispatch(addCityToFavorites({ city: city.city, unit: "metric" }));
      });
    }
  }, []);

  const carouselCities = [mainCityData, ...selectedCities];

  const handleCarouselChange = (index) => {
    setCarouselIndex(index);
    const selectedCity = index === 0 ? city : selectedCities[index - 1].city;
    setCity(selectedCity);
    dispatch(getMainCityData({ city: selectedCity, unit }));
  };

  const handlePrevCarousel = () => {
    const newIndex = (carouselIndex - 1 + carouselCities.length) % carouselCities.length;
    handleCarouselChange(newIndex);
  };

  const handleNextCarousel = () => {
    const newIndex = (carouselIndex + 1) % carouselCities.length;
    handleCarouselChange(newIndex);
  };

  const getTemperatureWithUnit = (temp) => {
    return `${temp}°${unit === 'metric' ? 'C' : 'F'}`;
  };

  useEffect(() => {
    const storedCities = JSON.parse(localStorage.getItem('interestedCities')) || [];
    if (selectedCities.length === 0 && storedCities.length === 0) {
      dispatch(setNotificationMessage({ message: "Click the add button to select your favourite cities", type: 'info' }));
    }
  }, [selectedCities]); // Add selectedCities as a dependency

  return (
    <div className={`lg:h-screen p-3 flex flex-col gap-4 lg:gap-2 ${currentTheme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>

      {/* Mobile view Search bar  */}
      <div className="lg:hidden ">
        <div className="flex flex-row justify-between">
          {/* Search bar */}
          <div className={` search-bar lg:w-[38%]`}>
            <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136] text-white' : 'bg-white text-black border-2'} rounded-lg h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
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
              <button type="button" onClick={handleAddToInterested} className="bg-blue-500 text-xs rounded-r-lg h-full w-10">
                add
              </button>
            </form>
            {/* Suggestions */}
            {mainCitySuggestions.length > 0 && (
              <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-50 w-full max-h-60 max-w-60 overflow-auto`}>
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
            {notificationMessage && notificationMessage.message && (
              <div className={`absolute right-0 mr-2 z-10 lg:hidden w-max-80 text-xs px-4 py-2 rounded-lg shadow-md ${notificationMessage.type === 'success' ? 'bg-green-500 text-white' :
                notificationMessage.type === 'error' ? 'bg-red-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                {notificationMessage.message}
              </div>
            )}
          </div>


          <div className="flex items-center bg-[#303136] border-2 rounded-full cursor-pointer relative w-14 h-8"
            onClick={() => dispatch(toggleTheme())}
          >
            <div
              className={`absolute bg-gray-100 w-1/2 h-full rounded-full transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
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

      </div>

      {/* Top Section */}
      <div className="h-full flex flex-col gap-4 lg:h-[65%] lg:flex-row lg:gap-3">
        {/* Main City Card */}
        <div className="w-full h-[400px] lg:w-[30%] lg:h-full mainCardBg p-5 rounded-lg flex flex-col relative">
          <div className="flex justify-between">
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
            <div className="flex justify-center items-center h-full">
              <SphereSpinner loadings={loadings} color="#0D1DA9" size={25} />
            </div>
          ) : (
            <>
              {mainCityData && mainCityData.error ? (
                <div className="text-red-500 text-center">{mainCityData.error}</div>
              ) : forecastError ? (
                <div className="text-red-500 text-center">{forecastError}</div>
              ) : (
                carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col mt-8 items-center">
                      <h4 className="text-xl font-bold">{carouselCities[carouselIndex].data.name}</h4>
                      <div className="flex items-center">
                        <img
                          className="w-20 h-20"
                          src={`https://openweathermap.org/img/wn/${carouselCities[carouselIndex].data.weather[0].icon}@2x.png`}
                          alt="icon"
                        />
                        <h1 className="text-2xl font-bold">
                          {getTemperatureWithUnit(carouselCities[carouselIndex].data.main.temp)}
                        </h1>
                      </div>
                      <h4 className="capitalize font-semibold">{carouselCities[carouselIndex].data.weather[0].description}</h4>
                    </div>

                    <div className="space-y-8">
                      <div className="flex flex-row my-3 mx-4 justify-between">
                        <p className="text-sm" >Feels like {getTemperatureWithUnit(carouselCities[carouselIndex].data.main.feels_like)}</p>
                        <div className="flex space-x-2">
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowUp} size={14} className="" />
                            <span>{getTemperatureWithUnit(carouselCities[carouselIndex].data.main.temp_max)}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <Icon icon={arrowDown} size={14} className="" />
                            <span>{getTemperatureWithUnit(carouselCities[carouselIndex].data.main.temp_min)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row justify-between mx-2">
                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={droplet} size={30} className=" mt-1" />
                          <span className="text-xs mt-1 font-bold">{carouselCities[carouselIndex].data.main.humidity} %</span>
                          <p className="text-xs mt-1">Humidity</p>
                        </div>

                        <div className="border-l-2 border-gray-300 h-20 mx-4 mt-4"></div>

                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={wind} size={30} className=" mt-1" />
                          <span className="text-xs mt-1 font-bold">{carouselCities[carouselIndex].data.wind.speed} {unit === 'metric' ? 'kph' : 'mph'}</span>
                          <p className="text-xs mt-1">Wind</p>
                        </div>

                        <div className="border-l-2 border-gray-300 h-20 mx-4 mt-4"></div>

                        <div className="flex flex-col items-center justify-center">
                          <Icon icon={activity} size={30} className="mt-1" />
                          <span className="text-xs mt-1 font-bold">{carouselCities[carouselIndex].data.main.pressure} hPa</span>
                          <p className="text-xs mt-1">Pressure</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
          <div className="flex justify-center mt-4">
            {carouselCities.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 mx-1 rounded-full ${index === carouselIndex ? 'bg-blue-900' : 'bg-gray-300'}`}
                onClick={() => handleCarouselChange(index)}
              />
            ))}
          </div>
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-2">
            <button onClick={handlePrevCarousel} className="text-gray-500 hover:text-gray-700">
              <Icon icon={chevronLeft} size={24} />
            </button>
            <button onClick={handleNextCarousel} className="text-gray-500 hover:text-gray-700">
              <Icon icon={chevronRight} size={24} />
            </button>
          </div>
        </div>

        {/* Cities you are intrested in section in mobile view */}
        <div className={`lg:hidden flex flex-col items-center pt-4 w-full h-full lg:w-[30%]  rounded-lg ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}`}>
          <div className="flex w-full pl-4 mb-4 items-center  gap-2">
            <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><defs><mask id="ipSCityOne0"><g fill="none" stroke-linejoin="round" stroke-width="4"><path stroke="#fff" stroke-linecap="round" d="M4 42h40" /><rect width="12" height="20" x="8" y="22" fill="#fff" stroke="#fff" rx="2" /><rect width="20" height="38" x="20" y="4" fill="#fff" stroke="#fff" rx="2" /><path stroke="#000" stroke-linecap="round" d="M28 32.008h4m-20 0h4m12-9h4m-4-9h4" /></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSCityOne0)" /></svg>
            <h2 className="text-md font-semibold">Cities you are interested in</h2>
          </div>

          <div className="flex flex-row flex-wrap justify-center w-full gap-3">
            {selectedCities.length > 0 ? (
              selectedCities.map((city, index) => (
                <div
                  key={index}
                  className="flex flex-col bg-blue-500 justify-center w-[29%] items-center my-2  p-3 rounded-xl cursor-pointer hover:bg-gray-400"
                  onClick={() => handleInterestedCityClick(city.city)}
                >
                  <div className="flex justify-between w-full">
                    <h5 className="text-sm font-semibold">{city.city}</h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCity(city.city);
                      }}
                    >
                      <svg className="text-sm" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${city.data.weather[0].icon}.png`}
                    alt="icon"
                    className="w-10 h-10"
                  />
                  <h5 className="text-sm">{getTemperatureWithUnit(city.data.main.temp)}</h5>
                </div>
              ))
            ) : (
              <div className="flex flex-col gap-4 p-4 mt-2 justify-center items-center w-full h-full">
                <img src={noDataImg} className="h-12 w-12" />
                <p className="text-xs">Click the add button to select your favourite cities</p>
              </div>
            )}
          </div>

        </div>

        {/* Large Screen view of side-bar notification and toggle theme & next 5 days and Map */}
        <div className={`w-full lg:w-[70%] lg:h-full ${currentTheme === 'dark' ? 'border-none' : 'bg-white border-2 p-3'} rounded-xl flex flex-col  space-y-1 lg:gap-3`}>
          <div className="flex flex-row relative justify-between">
            {/* Search bar */}
            <div className={`hidden lg:block search-bar lg:w-[39%]`}>
              <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136] text-white' : 'bg-white text-black border-2'} rounded-lg h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
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
                <button type="button" onClick={handleAddToInterested} className="bg-blue-500 text-xs rounded-r-lg h-full w-10">
                  add
                </button>
              </form>
              {/* Suggestions */}
              {mainCitySuggestions.length > 0 && (
                <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-50 w-full max-h-60 lg:w-[40%] overflow-auto`}>
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
              {notificationMessage && notificationMessage.message && (
                <div className={`absolute hidden top-0 right-14 mr-3 z-10 lg:block w-max-80 text-xs px-4 py-2 rounded-lg shadow-md ${notificationMessage.type === 'success' ? 'bg-green-500 text-white' :
                  notificationMessage.type === 'error' ? 'bg-red-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                  {notificationMessage.message}
                </div>
              )}
            </div>

            <div className="hidden lg:flex items-center bg-[#303136] border-2 rounded-full cursor-pointer relative w-14 h-8"
              onClick={() => dispatch(toggleTheme())}
            >
              <div
                className={`absolute bg-gray-100 w-1/2 h-full rounded-full transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
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
            <div className={`flex flex-col w-full h-full lg:w-[40%] ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white lg:border-2'} rounded-lg pt-3`}>
              <div className="flex gap-2 pl-4 justify-start items-center">
                <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M2 19c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-8H2zM19 4h-2V3c0-.6-.4-1-1-1s-1 .4-1 1v1H9V3c0-.6-.4-1-1-1s-1 .4-1 1v1H5C3.3 4 2 5.3 2 7v2h20V7c0-1.7-1.3-3-3-3" /></svg>
                <h4 className="text-md font-semibold">
                  Next 5 Days
                </h4>
              </div>
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
                          {getTemperatureWithUnit(data.main.temp_max)} / {getTemperatureWithUnit(data.main.temp_min)}
                        </h5>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  Loading...
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
                          {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
                            <>
                              <h3>{carouselCities[carouselIndex].data.name}</h3>
                              <p>Temperature: {getTemperatureWithUnit(carouselCities[carouselIndex].data.main.temp)}</p>
                              <p>Weather: {carouselCities[carouselIndex].data.weather[0].description}</p>
                            </>
                          )}
                        </Popup>
                      </Marker>
                      <MapUpdater center={position} />
                    </MapContainer>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="h-full w-full lg:h-[35%] flex flex-col lg:flex-row lg:gap-3">
        {/* Bottom Section 1 */}
        <div className={`hidden lg:flex items-center w-full h-full lg:w-[30%]  rounded-lg ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}`}>
          <div className="flex flex-col h-full w-full rounded-lg p-4">
            <div className="flex justify-start items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M480 48c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v48h-64V24c0-13.3-10.7-24-24-24s-24 10.7-24 24v72h-64V24c0-13.3-10.7-24-24-24S64 10.7 64 24v72H48c-26.5 0-48 21.5-48 48v320c0 26.5 21.5 48 48 48h544c26.5 0 48-21.5 48-48V240c0-26.5-21.5-48-48-48H480zm96 320v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16m-336 48h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16m-112-16c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16zm432-144c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16zm-304-80v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16m-144-16c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16zm144 144c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16zm-144 16H80c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16m304-48v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16M400 64c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16V80c0-8.8 7.2-16 16-16zm16 112v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16" /></svg>
              <h2 className="text-md font-semibold">Cities you are interested in</h2>
            </div>

            <div className="flex flex-col  h-full justify-between mt-6">
              {selectedCities.length > 0 ? (
                <div>
                  {selectedCities.map((city, index) => (
                    <div
                      key={index}
                      className="flex flex-row bg-blue-500 justify-between my-2 items-center px-2 rounded-xl cursor-pointer hover:bg-gray-400 "
                      onClick={() => handleInterestedCityClick(city.city)}
                    >
                      <h5 className="text-sm font-semibold w-[30%]">{city.city}</h5>
                      <img
                        src={`https://openweathermap.org/img/wn/${city.data.weather[0].icon}.png`}
                        alt="icon"
                        className="w-10 h-10"
                      />
                      <h5 className="text-sm">{getTemperatureWithUnit(city.data.main.temp)}</h5>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCity(city.city);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="#d33636" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

              ) : (
                <div className="flex flex-col gap-4 mt-2 justify-center items-center  w-full h-full">
                  <img src={noDataImg} className="h-12 w-12" />
                  <p className="text-xs">Click the add button to Select your favourite cities</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Section 2 */}
        <div className={`flex flex-col w-full h-full lg:w-[69%] pt-4 ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}  rounded-lg`}>
          <div className="flex justify-start gap-2 pl-4 items-center">
            <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36"><path fill="currentColor" d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m6.2 21.18a1 1 0 0 1-1.39.28l-5.9-4v-8.71a1 1 0 0 1 2 0v7.65l5 3.39a1 1 0 0 1 .29 1.39m-.35-14.95a11.39 11.39 0 1 0-8.54 20.83L15 30.63a13 13 0 1 1 9.7-23.77Z" class="clr-i-solid clr-i-solid-path-1" /><path fill="none" d="M0 0h36v36H0z" /></svg>
            <h4 className="text-md font-semibold">Hourly Forecast</h4>
          </div>
          <div className="overflow-y-auto h-full scroll-container">
            {hourlyForecast.length > 0 ? (
              <div className="flex flex-row mt-2 gap-1 p-1">
                {hourlyForecast.map((data, index) => {
                  const date = new Date(data.dt_txt);
                  const hour = date.getHours();
                  const ampm = hour >= 12 ? "PM" : "AM";
                  const hour12 = hour % 12 || 12;
                  return (
                    <div
                      key={index}
                      // hover:bg-gray-500 hover:border-2 hover:rounded-xl
                      className="w-full max-w-[150px] h-full p-6 mt-2 flex flex-col  items-center justify-between "
                    >
                      <div className="flex items-center justify-center w-full">
                        <span className="text-xs font-semibold whitespace-nowrap">{getTemperatureWithUnit(Math.round(data.main.temp))}</span>
                      </div>

                      <img
                        src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                        alt="icon"
                        className="w-10 h-10 mb-2"
                      />
                      <div className="flex items-center justify-center w-full mb-2">
                        <span className="text-xs font-light truncate" title={data.weather[0].description}>
                          {data.weather[0].description}
                        </span>
                      </div>

                      <div className="flex items-center justify-center truncate gap-1 w-full">
                        <span className="text-xs font-semibold">
                          {`${hour12}:00 ${ampm}`}
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center items-center h-full w-full">
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Map in the mobile view */}
        <div className={`lg:hidden flex items-center w-full h-[300px] mt-4 lg:w-[60%]  border-2 ${currentTheme === 'dark' ? 'border-[#303136] border-2' : ''} rounded-lg z-10`}>
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
                      {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
                        <>
                          <h3>{carouselCities[carouselIndex].data.name}</h3>
                          <p>Temperature: {getTemperatureWithUnit(carouselCities[carouselIndex].data.main.temp)}</p>
                          <p>Weather: {carouselCities[carouselIndex].data.weather[0].description}</p>
                        </>
                      )}
                    </Popup>
                  </Marker>
                  <MapUpdater center={position} />
                </MapContainer>
              )
            )}
          </div>
        </div>
      </div>
    </div >
  );
}

export default App;