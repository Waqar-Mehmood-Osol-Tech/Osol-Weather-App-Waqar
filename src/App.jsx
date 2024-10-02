// import { useState, useEffect, useCallback } from "react";
// import debounce from 'lodash.debounce';
// import Icon from "react-icons-kit";
// import 'leaflet/dist/leaflet.css';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import { search } from "react-icons-kit/feather/search";
// import { arrowUp } from "react-icons-kit/feather/arrowUp";
// import { arrowDown } from "react-icons-kit/feather/arrowDown";
// import { droplet } from "react-icons-kit/feather/droplet";
// import { wind } from "react-icons-kit/feather/wind";
// import { activity } from "react-icons-kit/feather/activity";
// import { chevronLeft } from "react-icons-kit/feather/chevronLeft";
// import { chevronRight } from "react-icons-kit/feather/chevronRight";
// import { location } from 'react-icons-kit/icomoon/location'
// import { useDispatch, useSelector } from "react-redux";
// import {
//   get5DaysForecast,
//   getMainCityData,
//   addCityToFavorites,
//   removeCity,
//   getMainCitySuggestions,
//   setNotificationMessage,
//   clearNotificationMessage,
//   clearMainCitySuggestions,
// } from "./Store/Slices/WeatherSlice.js";
// import { SphereSpinner } from "react-spinners-kit";
// import { toggleTheme } from "./Store/Slices/ThemeSlice";
// import axios from 'axios';

// import noDataImg from './assets/no-data.png';

// const myIcon = new L.Icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// function MapUpdater({ center }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setView(center, map.getZoom());
//   }, [center, map]);
//   return null;
// }

// function App() {
//   const [position, setPosition] = useState(null);

//   const now = new Date();
//   const dayOptions = { weekday: 'long' };
//   const dateOptions = { day: '2-digit' };
//   const monthOptions = { month: 'short' };
//   const yearOptions = { year: '2-digit' };
//   const day = now.toLocaleDateString('en-GB', dayOptions);
//   const date = now.toLocaleDateString('en-GB', dateOptions);
//   const month = now.toLocaleDateString('en-GB', monthOptions);
//   const year = now.toLocaleDateString('en-GB', yearOptions);
//   const formattedDate = `${day}, ${date} ${month} ${year}`;

//   const [mainCity, setMainCity] = useState("Lahore");
//   const [selectedCity, setSelectedCity] = useState("Lahore");
//   const [unit, setUnit] = useState("metric");
//   const { currentTheme } = useSelector((state) => state.theme);

//   const [mainCityInput, setMainCityInput] = useState("");
//   const [carouselIndex, setCarouselIndex] = useState(0);
//   const [showNotification, setShowNotification] = useState(false);

//   const dispatch = useDispatch();

//   const {
//     mainCityData,
//     mainCityLoading,
//     citySearchLoading,
//     forecastLoading,
//     forecastData,
//     forecastError,
//     selectedCities,
//     mainCitySuggestions,
//     notificationMessage,
//   } = useSelector((state) => state.weather);

//   const [loadings, setLoadings] = useState(true);
//   const allLoadings = [mainCityLoading, citySearchLoading, forecastLoading];

//   useEffect(() => { 
//     const fetchCityFromIP = async () => {
//       try {
//         const response = await axios.get('https://ipapi.co/json/');
//         const cityName = response.data.city || 'Lahore';
//         await fetchCoordinatesFromCity(cityName);
//         setMainCity(cityName);
//         setSelectedCity(cityName);
//       } catch (error) {
//         console.error('Error fetching city name:', error);
//         await fetchCoordinatesFromCity('Lahore');
//       } finally {
//         setLoadings(false);
//       }
//     };

//     const fetchCoordinatesFromCity = async (city) => {
//       try {
//         const apiKey = 'b47c307acaff417892a4666a14f675c6';
//         const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
//         const results = response.data.results;
//         if (results.length > 0) {
//           const { lat, lng } = results[0].geometry;
//           setPosition([lat, lng]);
//         } else {
//           console.error('No results found for the city');
//           setPosition([0, 0]);
//         }
//       } catch (error) {
//         console.error('Error fetching coordinates:', error);
//         setPosition([0, 0]);
//       }
//     };

//     fetchCityFromIP();
//   }, []);

//   useEffect(() => {
//     const isAnyChildLoading = allLoadings.some((state) => state);
//     setLoadings(isAnyChildLoading);
//   }, [allLoadings]);

//   useEffect(() => {
//     dispatch(getMainCityData({ city: selectedCity, unit }));
//   }, [dispatch, selectedCity, unit]);

//   useEffect(() => {
//     const isAnyChildLoading = [mainCityLoading].some((state) => state);
//     setLoadings(isAnyChildLoading);
//   }, [mainCityLoading]);

//   useEffect(() => {
//     if (mainCityData && mainCityData.data) {
//       dispatch(
//         get5DaysForecast({
//           lat: mainCityData.data.coord.lat,
//           lon: mainCityData.data.coord.lon,
//           unit,
//         })
//       );
//       setPosition([mainCityData.data.coord.lat, mainCityData.data.coord.lon]);
//     }
//   }, [mainCityData, dispatch, unit]);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition((pos) => {
//       const { latitude, longitude } = pos.coords;
//       setPosition([latitude, longitude]);
//     });
//   }, []);

//   const handleMainCitySearch = async (e) => {
//     e.preventDefault();
//     if (!mainCityInput.trim()) return;

//     setMainCity(mainCityInput);
//     setSelectedCity(mainCityInput);
//     dispatch(getMainCityData({ city: mainCityInput, unit }));
//     setMainCityInput("");
//     dispatch(clearMainCitySuggestions());
//     setCarouselIndex(0);
//   };

//   const getHourlyForecast = () => {
//     if (!forecastData || !forecastData.list) return [];
//     return forecastData.list.filter((data) => {
//       const hour = new Date(data.dt_txt).getHours();
//       return hour % 3 === 0;
//     });
//   };

//   const hourlyForecast = getHourlyForecast();

//   const filterForecastByFirstObjTime = (forecastData) => {
//     if (!forecastData) {
//       return [];
//     }
//     const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
//     return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
//   };

//   const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

//   const handleRemoveCity = (city) => {
//     dispatch(removeCity(city));
//     dispatch(setNotificationMessage({ message: `${city} removed successfully from your favourite cities!`, type: 'success' }));
//     if (carouselIndex > 0) setCarouselIndex(carouselIndex - 1);
//   };

//   const fetchMainCitySuggestions = useCallback(
//     debounce((query) => {
//       if (query.trim().length >= 3) {
//         dispatch(getMainCitySuggestions(query));
//       } else {
//         dispatch(clearMainCitySuggestions());
//       }
//     }, 300),
//     []
//   );

//   const handleMainCityInputChange = (e) => {
//     setMainCityInput(e.target.value);
//     fetchMainCitySuggestions(e.target.value);
//   };

//   useEffect(() => {
//     if (notificationMessage) {
//       setShowNotification(true);
//       const timer = setTimeout(() => {
//         setShowNotification(false);
//         dispatch(clearNotificationMessage());
//       }, 3000);
//       return () => {
//         clearTimeout(timer);
//       };
//     } else {
//       setShowNotification(false);
//     }
//   }, [notificationMessage, dispatch]);

//   useEffect(() => {
//     if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Rain") {
//       dispatch(setNotificationMessage({ message: `Rain is expected in ${mainCityData.data.name} in the coming hours. Be prepared!`, type: 'warning' }));
//     }
//     else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clouds") {
//       dispatch(setNotificationMessage({ message: `Cloudy weather is expected in ${mainCityData.data.name} in the coming hours.`, type: 'info' }));
//     }
//     else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clear") {
//       dispatch(setNotificationMessage({ message: `Clear weather expected in ${mainCityData.data.name}. Your are good to go!`, type: 'info' }));
//     }
//   }, [mainCityData, dispatch]);

//   const handleMainSuggestionClick = (suggestion) => {
//     setMainCity(suggestion.name);
//     dispatch(getMainCityData({ city: suggestion.name, unit }));
//     setMainCityInput(suggestion.name);
//     dispatch(clearMainCitySuggestions());
//     setCarouselIndex(0);
//   };

//   const handleAddToInterested = () => {
//     if (mainCityInput) {
//       if (selectedCities.length >= 3) {
//         dispatch(setNotificationMessage({ message: "You can't add more than 3 cities.", type: 'error' }));
//       } else if (selectedCities.some(city => city.city.toLowerCase() === mainCityInput.toLowerCase())) {
//         dispatch(setNotificationMessage({ message: "This city is already exists in your favorites cities.", type: 'error' }));
//       } else {
//         setTimeout(() => {
//           dispatch(addCityToFavorites({ city: mainCityInput, unit: "metric" }));
//           setMainCityInput("");
//           dispatch(clearMainCitySuggestions());
//         }, 400);
//         dispatch(setNotificationMessage({ message: `${mainCityInput} added successfully to your favourites.`, type: 'success' }));
//       }
//     }
//     else {
//       dispatch(setNotificationMessage({ message: "Add a city. You can't set an empty value.", type: 'error' }));
//     }
//   };

//   const handleInterestedCityClick = (city) => {
//     setSelectedCity(city);
//     dispatch(getMainCityData({ city, unit }));
//     setCarouselIndex(selectedCities.findIndex(c => c.city === city) + 1);
//   };

//   useEffect(() => {
//     localStorage.setItem('interestedCities', JSON.stringify(selectedCities));
//   }, [selectedCities]);

//   useEffect(() => {
//     const storedCities = JSON.parse(localStorage.getItem('interestedCities'));
//     if (storedCities) {
//       storedCities.forEach(city => {
//         dispatch(addCityToFavorites({ city: city.city, unit: "metric" }));
//       });
//     }
//   }, []);

//   const carouselCities = [mainCityData, ...selectedCities];

//   const handleCarouselChange = (index) => {
//     setCarouselIndex(index);
//     const selectedCity = index === 0 ? mainCity : selectedCities[index - 1].city;
//     setSelectedCity(selectedCity);
//     dispatch(getMainCityData({ city: selectedCity, unit }));
//   };

//   const handlePrevCarousel = () => {
//     const newIndex = (carouselIndex - 1 + carouselCities.length) % carouselCities.length;
//     handleCarouselChange(newIndex);
//   };

//   const handleNextCarousel = () => {
//     const newIndex = (carouselIndex + 1) % carouselCities.length;
//     handleCarouselChange(newIndex);
//   };

//   // Function 1: For next 5 days forecast, hourly forecast, and carousel index 1
//   const getTemperatureWithoutConversion = (temp) => {
//     return `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
//   };

//   // Function 2: For carousel indices 2, 3, 4 and favorite cities
//   const getTemperatureWithConversion = (temp) => {
//     if (unit === 'imperial') {
//       temp = (temp * 9) / 5 + 32;
//     }
//     return `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
//   };

//   const toggleUnit = () => {
//     setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
//   };

//   useEffect(() => {
//     const storedCities = JSON.parse(localStorage.getItem('interestedCities')) || [];
//     if (selectedCities.length === 0 && storedCities.length === 0) {
//       dispatch(setNotificationMessage({ message: "Click the add button to select your favourite cities", type: 'info' }));
//     }
//   }, [selectedCities, dispatch]);

//   return (
//     <div className={`lg:h-screen p-3 flex flex-col gap-4 lg:gap-2 ${currentTheme === "dark" ? "bg-black text-white" : "bg-gray-300 text-black"}`}>

//       {/* Mobile view Search bar  */}
//       <div className="lg:hidden ">
//         <div className="flex flex-row justify-between">
//           {/* Search bar */}
//           <div className={` search-bar lg:w-[38%]`}>
//             <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136] text-white' : 'bg-gray-100 text-black border-2'} rounded-xl h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
//               <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
//                 <Icon icon={search} size={20} />
//               </label>
//               <input
//                 type="text"
//                 className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
//                 placeholder="Search and Add City"
//                 value={mainCityInput}
//                 onChange={handleMainCityInputChange}
//               />
//               <button type="button" title="Click the add button to select your favourite cities" onClick={handleAddToInterested} className={`font-semibold ${currentTheme === 'dark' ? 'bg-gray-600 ' : 'bg-gray-400'} text-xs rounded-r-lg h-full w-10`}>
//                 Add
//               </button>
//             </form>
//             {/* Suggestions */}
//             {mainCitySuggestions.length > 0 && (
//               <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-50 w-full max-h-60 max-w-60 overflow-auto`}>
//                 {mainCitySuggestions.map((suggestion) => (
//                   <li
//                     key={`${suggestion.lat}-${suggestion.lon}`}
//                     className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
//                     onClick={() => handleMainSuggestionClick(suggestion)}
//                   >
//                     {suggestion.name}, {suggestion.country}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           {/* Notifications */}
//           <div className={`fixed lg:hidden top-2 right-3 z-50 w-64 transition-all duration-500 ease-in-out ${showNotification ? 'translate-x-0' : 'translate-x-full'}`}>
//             {notificationMessage && notificationMessage.message && (
//               <div className={`relative p-3 text-sm rounded-lg shadow-md max-w-md ${notificationMessage.type === 'success' ? 'bg-green-500' :
//                 notificationMessage.type === 'error' ? 'bg-red-500' : notificationMessage.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'} text-white`}>

//                 {/* Message */}
//                 <div className="mr-2">

//                   {notificationMessage.message}
//                 </div>

//                 {/* Close Icon */}
//                 <button
//                   onClick={() => setShowNotification(false)} // Assuming you have a state like `setShowNotification`
//                   className="absolute top-0 right-0 mt-2 mr-2 text-white text-lg focus:outline-none"
//                 >
//                   &times;
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center bg-[#303136] border-2 rounded-full cursor-pointer relative w-14 h-8"
//             onClick={() => dispatch(toggleTheme())}
//           >
//             <div
//               className={`absolute bg-gray-100 w-1/2 h-full rounded-full transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
//                 }`}
//             ></div>
//             <span className="absolute left-1 text-sm text-gray-400">
//               <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
//                 <path
//                   fill="#918888"
//                   fillRule="evenodd"
//                   d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
//                   clipRule="evenodd" />
//               </svg>
//             </span>
//             <span className="absolute right-1 text-sm text-blue-600">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
//                 />
//               </svg>
//             </span>
//           </div>
//         </div>

//       </div>

//       {/* Top Section */}
//       <div className="h-full flex flex-col gap-4 lg:h-[65%] lg:flex-row lg:gap-3">
//         {/* Main City Card */}
//         <div className="w-full h-[400px] lg:w-[30%] lg:h-full mainCardBg p-5 rounded-xl flex flex-col relative">
//           <div className="flex justify-between items-center">
//             <div>
//               <p className="text-sm font-semibold">{formattedDate}</p>
//               <div className="text-xs font-semibold">
//                 {new Date().toLocaleString('en-US', {
//                   hour: 'numeric',
//                   minute: 'numeric',
//                   hour12: true // for 12-hour format
//                 })}
//               </div>
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 className={`px-4 py-2 rounded-full ${unit === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//                 onClick={() => setUnit('metric')}
//               >
//                 °C
//               </button>
//               <button
//                 className={`px-4 py-2 rounded-full ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//                 onClick={() => setUnit('imperial')}
//               >
//                 °F
//               </button>
//             </div>
//           </div>

//           {loadings ? (
//             <div className="flex justify-center items-center h-full">
//               <SphereSpinner loadings={loadings} color="#0D1DA9" size={25} />
//             </div>
//           ) : (
//             <>
//               {mainCityData && mainCityData.error ? (
//                 <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{mainCityData.error}</div>
//               ) : forecastError ? (
//                 <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{forecastError}</div>
//               ) : (
//                 carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
//                   <div className="flex flex-col w-full h-full">
//                     <div className="flex flex-col items-center">
//                       <div className="flex justify-between mt-4 w-full items-center">
//                         <div className="flex flex-col mt-6 justify-center items-center ">
//                           <div className="flex gap-2 items-center">
//                             <Icon icon={location} size={20} />
//                             <h4 className="text-2xl font-bold">{carouselCities[carouselIndex].data.name}</h4>
//                           </div>
//                           <img
//                             className="w-24 h-24 "
//                             src={`https://openweathermap.org/img/wn/${carouselCities[carouselIndex].data.weather[0].icon}@2x.png`}
//                             alt="icon"
//                           />
//                         </div>

//                         <div className="flex flex-col gap-4 justify-center items-center">
//                           <h1 className="text-6xl font-bold">
//                             {carouselIndex === 0
//                               ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp)
//                               : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp)
//                             }
//                           </h1>
//                           <h4 className="capitalize text-md font-bold">{carouselCities[carouselIndex].data.weather[0].description}</h4>
//                         </div>

//                       </div>
//                     </div>

//                     <div className="">
//                       <div className="lg:flex hidden flex-row justify-between">
//                         <p className="text-sm font-bold" >Feels like {
//                           carouselIndex === 0
//                             ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.feels_like)
//                             : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.feels_like)
//                         }</p>
//                         <div className="flex space-x-2">
//                           <div className="flex items-center text-xs">
//                             <Icon icon={arrowUp} size={14} className="" />
//                             <span className="font-bold">{
//                               carouselIndex === 0
//                                 ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_max)
//                                 : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_max)
//                             }</span>
//                           </div>
//                           <div className="flex items-center text-xs">
//                             <Icon icon={arrowDown} size={14} className="" />
//                             <span className="font-bold">{
//                               carouselIndex === 0
//                                 ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_min)
//                                 : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_min)
//                             }</span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex flex-row mt-6 justify-between mx-2">
//                         <div className="flex flex-col items-center justify-center">
//                           <Icon icon={droplet} size={40} className=" mt-1" />
//                           <span className="text-xs mt-1 font-semibold">{carouselCities[carouselIndex].data.main.humidity} %</span>
//                           <div className="w-full mt-1 bg-gray-200 dark:bg-gray-500 rounded-full h-2.5">
//                             <div
//                               className="bg-blue-600 h-2.5 rounded-full"
//                               style={{ width: `${mainCityData && mainCityData.data ? mainCityData.data.main.humidity : 0}%` }}
//                             ></div>
//                           </div>
//                           <p className="text-xs mt-1 font-bold">Humidity</p>
//                         </div>

//                         <div className={`border-l-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-black'}  h-20 mx-4 mt-4`}></div>

//                         <div className="flex flex-col items-center justify-center">
//                           <Icon icon={wind} size={40} className=" mt-1" />
//                           <div className="flex text-xs mt-1 font-semibold items-center">
//                             <span>{mainCityData && mainCityData.data && `${mainCityData.data.wind.deg}°`}</span>
//                           </div>
//                           <div className="text-xs font-bold">
//                             {mainCityData && mainCityData.data && `${mainCityData.data.wind.speed} ${unit === 'metric' ? 'km/h' : 'mph'}`}
//                           </div>

//                           <p className="text-xs mt-1 font-bold">Wind</p>
//                         </div>

//                         <div className={`border-l-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-black'}  h-20 mx-4 mt-4`}></div>

//                         <div className="flex flex-col items-center justify-center">
//                           <Icon icon={activity} size={40} className="mt-1" />
//                           <div className="text-xs mt-1 font-semibold">Normal</div>
//                           <span className="text-xs mt-1 font-bold">{carouselCities[carouselIndex].data.main.pressure} hPa</span>
//                           <p className="text-xs mt-1 font-bold">Pressure</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               )}
//             </>
//           )}
//           <div className="flex justify-center mt-4">
//             {carouselCities.map((_, index) => (
//               <button
//                 key={index}
//                 className={`w-2 h-2 mx-1 rounded-full ${index === carouselIndex ? 'bg-blue-900' : 'bg-gray-300'}`}
//                 onClick={() => handleCarouselChange(index)}
//               />
//             ))}
//           </div>

//           {/* <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-2">
//             <button onClick={handlePrevCarousel} className="text-gray-500 hover:text-gray-700">
//               <Icon icon={chevronLeft} size={24} />
//             </button>
//             <button onClick={handleNextCarousel} className="text-gray-500 hover:text-gray-700">
//               <Icon icon={chevronRight} size={24} />
//             </button>
//           </div> */}

//         </div>

//         {/* Cities you are intrested in section in mobile view */}
//         <div className={`lg:hidden flex flex-col items-center pt-4 w-full h-full lg:w-[30%]  rounded-xl ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//           <div className="flex w-full pl-4 mb-4 items-center  gap-2">
//             <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><defs><mask id="ipSCityOne0"><g fill="none" stroke-linejoin="round" stroke-width="4"><path stroke="#fff" stroke-linecap="round" d="M4 42h40" /><rect width="12" height="20" x="8" y="22" fill="#fff" stroke="#fff" rx="2" /><rect width="20" height="38" x="20" y="4" fill="#fff" stroke="#fff" rx="2" /><path stroke="#000" stroke-linecap="round" d="M28 32.008h4m-20 0h4m12-9h4m-4-9h4" /></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSCityOne0)" /></svg>
//             <h2 className="text-md font-bold">Cities you are interested in</h2>
//           </div>

//           <div className="flex flex-row flex-wrap justify-center w-full gap-3">
//             {selectedCities.length > 0 ? (
//               selectedCities.map((city, index) => (
//                 <div
//                   key={index}
//                   className={`flex flex-col ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} shadow-md  justify-center w-[29%] items-center my-2  p-3 rounded-xl cursor-pointer hover:bg-gray-400`}
//                   onClick={() => handleInterestedCityClick(city.city)}
//                 >
//                   <div className="flex justify-between w-full">
//                     <h5 className="text-sm font-semibold">{city.city}</h5>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleRemoveCity(city.city);
//                       }}
//                     >
//                       <svg className="text-sm" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M11.782 4.032a.575.575 0 1 0-.813-.814L7.5 6.687L4.032 3.218a.575.575 0 0 0-.814.814L6.687 7.5l-3.469 3.468a.575.575 0 0 0 .814.814L7.5 8.313l3.469 3.469a.575.575 0 0 0 .813-.814L8.313 7.5z" clip-rule="evenodd" /></svg>
//                     </button>
//                   </div>
//                   <img
//                     src={`https://openweathermap.org/img/wn/${city.data.weather[0].icon}.png`}
//                     alt="icon"
//                     className="w-10 h-10"
//                   />
//                   <h5 className="text-sm">{getTemperatureWithConversion(city.data.main.temp)}</h5>
//                 </div>
//               ))
//             ) : (
//               <div className="flex flex-col gap-4 p-4 mt-2 justify-center items-center w-full h-full">
//                 <img src={noDataImg} className="h-12 w-12" />
//                 <p className="text-xs">Click the add button to select your favourite cities</p>
//               </div>
//             )}
//           </div>

//         </div>

//         {/* Large Screen view of side-bar notification and toggle theme & next 5 days and Map */}
//         <div className={`w-full lg:w-[70%] lg:h-full ${currentTheme === 'dark' ? 'border-none' : 'bg-transparent'} rounded-xl flex flex-col  space-y-1 lg:gap-3`}>
//           <div className="flex flex-row relative justify-between">
//             {/* Search bar */}
//             <div className={`hidden lg:block search-bar lg:w-[39%]`}>
//               <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'} rounded-xl h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
//                 <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
//                   <Icon icon={search} size={20} />
//                 </label>
//                 <input
//                   type="text"
//                   className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
//                   placeholder="Search and Add City"
//                   value={mainCityInput}
//                   onChange={handleMainCityInputChange}
//                 />
//                 <button type="button" title="Click the add button to select your favourite cities" onClick={handleAddToInterested} className={`font-semibold ${currentTheme === 'dark' ? 'bg-gray-600 ' : 'bg-gray-400'} text-xs rounded-r-lg h-full w-10`}>
//                   Add
//                 </button>
//               </form>
//               {/* Suggestions */}
//               {mainCitySuggestions.length > 0 && (
//                 <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white '} shadow-lg rounded-lg absolute z-50 w-full max-h-60 lg:w-[40%] overflow-auto`}>
//                   {mainCitySuggestions.map((suggestion) => (
//                     <li
//                       key={`${suggestion.lat}-${suggestion.lon}`}
//                       className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
//                       onClick={() => handleMainSuggestionClick(suggestion)}
//                     >
//                       {suggestion.name}, {suggestion.country}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//             {/* Notifications */}
//             <div className={`fixed hidden lg:block top-2 right-3 z-50 w-64 lg:w-80 transition-all duration-500 ease-in-out ${showNotification ? 'translate-x-0' : 'translate-x-full'}`}>
//               {notificationMessage && notificationMessage.message && (
//                 <div className={`relative p-3 text-sm rounded-lg shadow-md max-w-md ${notificationMessage.type === 'success' ? 'bg-green-500' :
//                   notificationMessage.type === 'error' ? 'bg-red-500' : notificationMessage.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-400'} text-white`}>

//                   {/* Message */}
//                   <div className="mr-2">

//                     {notificationMessage.message}
//                   </div>

//                   {/* Close Icon */}
//                   <button
//                     onClick={() => setShowNotification(false)} // Assuming you have a state like `setShowNotification`
//                     className="absolute top-0 right-0 mt-2 mr-2 text-white text-xl font-bold focus:outline-none"
//                   >
//                     &times;
//                   </button>
//                 </div>
//               )}
//             </div>
//             <div className="hidden lg:flex items-center bg-gray-800 border-2 rounded-full cursor-pointer relative w-14 h-8"
//               onClick={() => dispatch(toggleTheme())}
//             >
//               <div
//                 className={`absolute bg-gray-100 w-1/2 h-full rounded-full transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
//                   }`}
//               ></div>
//               <span className="absolute left-1 text-sm text-gray-400">
//                 <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
//                   <path
//                     fill="#918888"
//                     fillRule="evenodd"
//                     d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
//                     clipRule="evenodd" />
//                 </svg>
//               </span>
//               <span className="absolute right-1 text-sm text-blue-600">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
//                   />
//                 </svg>
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col lg:flex-row h-[350px] lg:h-[90%] justify-between lg:gap-2">
//             {/* Next 5 days Forecast */}
//             <div className={`flex flex-col w-full h-full lg:w-[40%] ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl pt-3`}>
//               <div className="flex gap-2 pl-4 justify-start items-center">
//                 <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M2 19c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-8H2zM19 4h-2V3c0-.6-.4-1-1-1s-1 .4-1 1v1H9V3c0-.6-.4-1-1-1s-1 .4-1 1v1H5C3.3 4 2 5.3 2 7v2h20V7c0-1.7-1.3-3-3-3" /></svg>
//                 <h4 className="text-md font-bold">
//                   Next 5 Days
//                 </h4>
//               </div>
//               {filteredForecast.length > 0 ? (
//                 <div className="flex flex-col h-full pl-4">
//                   {filteredForecast.map((data, index) => {
//                     const date = new Date(data.dt_txt);
//                     const day = date.toLocaleDateString("en-US", { weekday: "long" });
//                     return (
//                       <div
//                         key={index}
//                         className="flex flex-row justify-between items-center bg-transparent flex-grow"
//                       >
//                         <h5 className="text-sm w-[25%] font-bold">{day}</h5>
//                         <div className="w-[20%]">
//                           <img
//                             src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
//                             alt="icon"
//                             className="w-10 h-10"
//                           />
//                         </div>
//                         <h5 className="text-xs w-[25%] font-semibold capitalize">
//                           {data.weather[0].description}
//                         </h5>
//                         <h5 className="text-xs w-[40%] text-center font-bold">
//                           {getTemperatureWithoutConversion(data.main.temp_max)} / {getTemperatureWithoutConversion(data.main.temp_min)}
//                         </h5>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-full w-full">
//                   Fetching Data!! Please wait...
//                 </div>
//               )}
//             </div>

//             {/* Map Section */}
//             <div className={`hidden lg:flex items-center w-full h-full lg:w-[60%]  border-2 ${currentTheme === 'dark' ? 'border-[#303136] border-2' : ''} rounded-xl z-10`}>
//               <div className="h-full w-full">
//                 {loadings ? (
//                   <div className="flex justify-center items-center  w-full h-full">
//                     <SphereSpinner loadings={loadings} color="#0D1DA9" size={30} />
//                   </div>
//                 ) : (
//                   position && (
//                     <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
//                       <TileLayer
//                         url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
//                         attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
//                       />
//                       <Marker position={position} icon={myIcon}>
//                         <Popup>
//                           {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
//                             <>
//                               <h3>{carouselCities[carouselIndex].data.name}</h3>
//                             </>
//                           )}
//                         </Popup>
//                       </Marker>
//                       <MapUpdater center={position} />
//                     </MapContainer>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Section */}
//       <div className="h-full w-full lg:h-[35%] flex flex-col lg:flex-row lg:gap-3">
//         {/* Bottom Section 1 */}
//         <div className={`hidden lg:flex items-center w-full h-full lg:w-[30%]  rounded-xl ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
//           <div className="flex flex-col h-full w-full rounded-xl p-4">
//             <div className="flex justify-start items-center gap-2">
//               <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1em" viewBox="0 0 640 512"><path fill="currentColor" d="M480 48c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v48h-64V24c0-13.3-10.7-24-24-24s-24 10.7-24 24v72h-64V24c0-13.3-10.7-24-24-24S64 10.7 64 24v72H48c-26.5 0-48 21.5-48 48v320c0 26.5 21.5 48 48 48h544c26.5 0 48-21.5 48-48V240c0-26.5-21.5-48-48-48H480zm96 320v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16m-336 48h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16m-112-16c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16zm432-144c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16zm-304-80v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16m-144-16c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16zm144 144c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16zm-144 16H80c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16m304-48v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16M400 64c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16V80c0-8.8 7.2-16 16-16zm16 112v32c0 8.8-7.2 16-16 16h-32c-8.8 0-16-7.2-16-16v-32c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16" /></svg>
//               <h2 className="text-md font-bold">Cities you are interested in</h2>
//             </div>

//             <div className="flex flex-col h-full justify-between mt-4">
//               {selectedCities.length > 0 ? (
//                 <div>
//                   {selectedCities.map((city, index) => (
//                     <div
//                       key={index}
//                       className={`flex flex-row ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} justify-between my-2 items-center px-6 py-1 rounded-xl shadow-md cursor-pointer hover:bg-gray-300`}
//                       onClick={() => handleInterestedCityClick(city.city)}
//                     >
//                       <h5 className="text-sm font-semibold w-[30%]">{city.city}</h5>
//                       <img
//                         src={`https://openweathermap.org/img/wn/${city.data.weather[0].icon}.png`}
//                         alt="icon"
//                         className="w-10 h-10"
//                       />
//                       <h5 className="text-sm font-bold">{getTemperatureWithConversion(city.data.main.temp)}</h5>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleRemoveCity(city.city);
//                         }}
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16"><path fill="#d33636" d="M7 3h2a1 1 0 0 0-2 0M6 3a2 2 0 1 1 4 0h4a.5.5 0 0 1 0 1h-.564l-1.205 8.838A2.5 2.5 0 0 1 9.754 15H6.246a2.5 2.5 0 0 1-2.477-2.162L2.564 4H2a.5.5 0 0 1 0-1zm1 3.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0zM9.5 6a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 1 0v-5a.5.5 0 0 0-.5-.5" /></svg>
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//               ) : (
//                 <div className="flex flex-col gap-4 mt-2 justify-center items-center  w-full h-full">
//                   <img src={noDataImg} className="h-12 w-12" />
//                   <p className="text-xs">Click the add button to Select your favourite cities</p>
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>

//         {/* Bottom Section 2 */}
//         <div className={`flex flex-col w-full h-full lg:w-[69%] pt-4 ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl`}>
//           <div className="flex justify-start gap-2 pl-4 items-center">
//             <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
//               <path fill="currentColor" d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m6.2 21.18a1 1 0 0 1-1.39.28l-5.9-4v-8.71a1 1 0 0 1 2 0v7.65l5 3.39a1 1 0 0 1 .29 1.39m-.35-14.95a11.39 11.39 0 1 0-8.54 20.83L15 30.63a13 13 0 1 1 9.7-23.77Z" className="clr-i-solid clr-i-solid-path-1" />
//               <path fill="none" d="M0 0h36v36H0z" />
//             </svg>
//             <h4 className="text-md font-bold">Hourly Forecast</h4>
//           </div>
//           <div className="overflow-x-auto h-full scroll-container">
//             {hourlyForecast.length > 0 ? (
//               <div className="flex flex-row mt-4 ml-3 lg:p-1 p-2 gap-2">
//                 {hourlyForecast.map((data, index) => {
//                   const date = new Date(data.dt_txt);
//                   const hour = date.getHours();
//                   const ampm = hour >= 12 ? "PM" : "AM";
//                   const hour12 = hour % 12 || 12;
//                   return (
//                     <div
//                       key={index}
//                       className={`flex-shrink-0 w-[120px] ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} rounded-2xl shadow-xl h-[160px] py-3 px-2 flex flex-col items-center justify-between`}
//                     >
//                       <div className="flex items-center justify-center w-full">
//                         <span className="text-lg font-bold whitespace-nowrap">{getTemperatureWithoutConversion(Math.round(data.main.temp))}</span>
//                       </div>

//                       <img
//                         src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
//                         alt="icon"
//                         className="w-10 h-10"
//                       />
//                       <div className="flex items-center justify-center w-full">
//                         <span className="text-xs font-light truncate w-full text-center" title={data.weather[0].description}>
//                           {data.weather[0].description}
//                         </span>
//                       </div>

//                       <div className="flex items-center justify-center w-full">
//                         <span className="text-xs font-bold">
//                           {`${hour12}:00 ${ampm}`}
//                         </span>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             ) : (
//               <div className="flex justify-center items-center h-full w-full">
//                 Fetching Data!! Please wait...
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Map in the mobile view */}
//         <div className={`lg:hidden flex items-center w-full h-[300px] mt-4 lg:w-[60%]  border-2 ${currentTheme === 'dark' ? 'border-[#303136]' : 'border-gray-100'} rounded-xl z-10`}>
//           <div className="h-full w-full">
//             {loadings ? (
//               <div className="flex justify-center items-center  w-full h-full">
//                 <SphereSpinner loadings={loadings} color="#0D1DA9" size={30} />
//               </div>
//             ) : (
//               position && (
//                 <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
//                   <TileLayer
//                     url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
//                     attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
//                   />
//                   <Marker position={position} icon={myIcon}>
//                     <Popup>
//                       {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
//                         <>
//                           <h3>{carouselCities[carouselIndex].data.name}</h3>
//                         </>
//                       )}
//                     </Popup>
//                   </Marker>
//                   <MapUpdater center={position} />
//                 </MapContainer>
//               )
//             )}
//           </div>
//         </div>
//       </div>
//     </div >
//   );
// }

// export default App;

// import { useState, useEffect, useCallback } from "react";
// import debounce from 'lodash.debounce';
// import Icon from "react-icons-kit";
// import 'leaflet/dist/leaflet.css';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import { search } from "react-icons-kit/feather/search";
// import { arrowUp } from "react-icons-kit/feather/arrowUp";
// import { arrowDown } from "react-icons-kit/feather/arrowDown";
// import { droplet } from "react-icons-kit/feather/droplet";
// import { wind } from "react-icons-kit/feather/wind";
// import { activity } from "react-icons-kit/feather/activity";
// import { chevronLeft } from "react-icons-kit/feather/chevronLeft";
// import { chevronRight } from "react-icons-kit/feather/chevronRight";
// import { location } from 'react-icons-kit/icomoon/location'
// import { useDispatch, useSelector } from "react-redux";
// import {
//   get5DaysForecast,
//   getMainCityData,
//   addCityToFavorites,
//   removeCity,
//   getMainCitySuggestions,
//   setNotificationMessage,
//   clearNotificationMessage,
//   clearMainCitySuggestions,
// } from "./Store/Slices/WeatherSlice.js";
// import { SphereSpinner } from "react-spinners-kit";
// import { toggleTheme } from "./Store/Slices/ThemeSlice";
// import axios from 'axios';

// import noDataImg from './assets/no-data.png';
// import { plus } from "react-icons-kit/feather/plus.js";
// import { trash2 } from "react-icons-kit/feather/trash2";

// const myIcon = new L.Icon({
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
//   popupAnchor: [1, -34],
// });

// function MapUpdater({ center }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setView(center, map.getZoom());
//   }, [center, map]);
//   return null;
// }

// function App() {
//   const [position, setPosition] = useState(null);

//   const now = new Date();
//   const dayOptions = { weekday: 'long' };
//   const dateOptions = { day: '2-digit' };
//   const monthOptions = { month: 'short' };
//   const yearOptions = { year: '2-digit' };
//   const day = now.toLocaleDateString('en-GB', dayOptions);
//   const date = now.toLocaleDateString('en-GB', dateOptions);
//   const month = now.toLocaleDateString('en-GB', monthOptions);
//   const year = now.toLocaleDateString('en-GB', yearOptions);
//   const formattedDate = `${day}, ${date} ${month} ${year}`;

//   const [mainCity, setMainCity] = useState("Lahore");
//   const [selectedCity, setSelectedCity] = useState("Lahore");
//   const [unit, setUnit] = useState("metric");
//   const { currentTheme } = useSelector((state) => state.theme);

//   const [mainCityInput, setMainCityInput] = useState("");
//   const [carouselIndex, setCarouselIndex] = useState(0);
//   const [showNotification, setShowNotification] = useState(false);

//   const dispatch = useDispatch();

//   const {
//     mainCityData,
//     mainCityLoading,
//     citySearchLoading,
//     forecastLoading,
//     forecastData,
//     forecastError,
//     selectedCities,
//     mainCitySuggestions,
//     notificationMessage,
//   } = useSelector((state) => state.weather);

//   const [loadings, setLoadings] = useState(true);
//   const allLoadings = [mainCityLoading, citySearchLoading, forecastLoading];

//   useEffect(() => {
//     const fetchCityFromIP = async () => {
//       try {
//         const response = await axios.get('https://ipapi.co/json/');
//         const cityName = response.data.city || 'Lahore';
//         await fetchCoordinatesFromCity(cityName);
//         setMainCity(cityName);
//         setSelectedCity(cityName);
//       } catch (error) {
//         console.error('Error fetching city name:', error);
//         await fetchCoordinatesFromCity('Lahore');
//       } finally {
//         setLoadings(false);
//       }
//     };

//     const fetchCoordinatesFromCity = async (city) => {
//       try {
//         const apiKey = 'b47c307acaff417892a4666a14f675c6';
//         const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
//         const results = response.data.results;
//         if (results.length > 0) {
//           const { lat, lng } = results[0].geometry;
//           setPosition([lat, lng]);
//         } else {
//           console.error('No results found for the city');
//           setPosition([0, 0]);
//         }
//       } catch (error) {
//         console.error('Error fetching coordinates:', error);
//         setPosition([0, 0]);
//       }
//     };

//     fetchCityFromIP();
//   }, []);

//   useEffect(() => {
//     const isAnyChildLoading = allLoadings.some((state) => state);
//     setLoadings(isAnyChildLoading);
//   }, [allLoadings]);

//   useEffect(() => {
//     dispatch(getMainCityData({ city: selectedCity, unit }));
//   }, [dispatch, selectedCity, unit]);

//   useEffect(() => {
//     const isAnyChildLoading = [mainCityLoading].some((state) => state);
//     setLoadings(isAnyChildLoading);
//   }, [mainCityLoading]);

//   useEffect(() => {
//     if (mainCityData && mainCityData.data) {
//       dispatch(
//         get5DaysForecast({
//           lat: mainCityData.data.coord.lat,
//           lon: mainCityData.data.coord.lon,
//           unit,
//         })
//       );
//       setPosition([mainCityData.data.coord.lat, mainCityData.data.coord.lon]);
//     }
//   }, [mainCityData, dispatch, unit]);

//   useEffect(() => {
//     navigator.geolocation.getCurrentPosition((pos) => {
//       const { latitude, longitude } = pos.coords;
//       setPosition([latitude, longitude]);
//     });
//   }, []);

//   // const handleMainCitySearch = async (e) => {
//   //   e.preventDefault();
//   //   if (!mainCityInput.trim()) return;

//   //   setMainCity(mainCityInput);
//   //   setSelectedCity(mainCityInput);
//   //   dispatch(getMainCityData({ city: mainCityInput, unit }));
//   //   setMainCityInput("");
//   //   dispatch(clearMainCitySuggestions());
//   //   setCarouselIndex(0);
//   // };

//   const handleMainCitySearch = async (e) => {
//     e.preventDefault();
//     if (!mainCityInput.trim()) return;

//     setMainCity(mainCityInput);
//     setSelectedCity(mainCityInput);
//     dispatch(getMainCityData({ city: mainCityInput, unit }));
//     setCarouselIndex(0);
//   };

//   const getHourlyForecast = () => {
//     if (!forecastData || !forecastData.list) return [];
//     return forecastData.list.filter((data) => {
//       const hour = new Date(data.dt_txt).getHours();
//       return hour % 3 === 0;
//     });
//   };

//   const hourlyForecast = getHourlyForecast();

//   const filterForecastByFirstObjTime = (forecastData) => {
//     if (!forecastData) {
//       return [];
//     }
//     const firstObjTime = forecastData[0].dt_txt.split(" ")[1];
//     return forecastData.filter((data) => data.dt_txt.endsWith(firstObjTime));
//   };

//   const filteredForecast = filterForecastByFirstObjTime(forecastData?.list);

//   const handleRemoveCity = (city) => {
//     dispatch(removeCity(city));
//     dispatch(setNotificationMessage({ message: `${city} removed successfully from your favourite cities!`, type: 'success' }));
//     if (carouselIndex > 0) setCarouselIndex(carouselIndex - 1);
//   };

//   const fetchMainCitySuggestions = useCallback(
//     debounce((query) => {
//       if (query.trim().length >= 3) {
//         dispatch(getMainCitySuggestions(query));
//       } else {
//         dispatch(clearMainCitySuggestions());
//       }
//     }, 300),
//     []
//   );

//   const handleMainCityInputChange = (e) => {
//     setMainCityInput(e.target.value);
//     fetchMainCitySuggestions(e.target.value);
//   };

//   useEffect(() => {
//     if (notificationMessage) {
//       setShowNotification(true);
//       const timer = setTimeout(() => {
//         setShowNotification(false);
//         dispatch(clearNotificationMessage());
//       }, 3000);
//       return () => {
//         clearTimeout(timer);
//       };
//     } else {
//       setShowNotification(false);
//     }
//   }, [notificationMessage, dispatch]);

//   useEffect(() => {
//     if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Rain") {
//       dispatch(setNotificationMessage({ message: `Rain is expected in ${mainCityData.data.name} in the coming hours. Be prepared!`, type: 'warning' }));
//     }
//     else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clouds") {
//       dispatch(setNotificationMessage({ message: `Cloudy weather is expected in ${mainCityData.data.name} in the coming hours.`, type: 'info' }));
//     }
//     else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clear") {
//       dispatch(setNotificationMessage({ message: `Clear weather expected in ${mainCityData.data.name}. Your are good to go!`, type: 'info' }));
//     }
//   }, [mainCityData, dispatch]);

//   const handleMainSuggestionClick = (suggestion) => {
//     setMainCity(suggestion.name);
//     dispatch(getMainCityData({ city: suggestion.name, unit }));
//     setMainCityInput(suggestion.name);
//     dispatch(clearMainCitySuggestions());
//     setCarouselIndex(0);
//   };

//   // const handleAddToInterested = () => {
//   //   if (mainCityInput) {
//   //     if (selectedCities.length >= 3) {
//   //       dispatch(setNotificationMessage({ message: "You can't add more than 3 cities.", type: 'error' }));
//   //     } else if (selectedCities.some(city => city.city.toLowerCase() === mainCityInput.toLowerCase())) {
//   //       dispatch(setNotificationMessage({ message: "This city is already exists in your favorites cities.", type: 'error' }));
//   //       const existingIndex = selectedCities.findIndex(city => city.city.toLowerCase() === mainCityInput.toLowerCase());
//   //       setCarouselIndex(existingIndex + 1);
//   //     } else {
//   //       setTimeout(() => {
//   //         dispatch(addCityToFavorites({ city: mainCityInput, unit: "metric" }));
//   //         setMainCityInput("");
//   //         dispatch(clearMainCitySuggestions());
//   //       }, 400);
//   //       dispatch(setNotificationMessage({ message: `${mainCityInput} added successfully to your favourites.`, type: 'success' }));
//   //     }
//   //   }
//   //   else {
//   //     dispatch(setNotificationMessage({ message: "Add a city. You can't set an empty value.", type: 'error' }));
//   //   }
//   // };


//   const handleAddToInterested = () => {
//     if (selectedCity) {
//       if (selectedCities.length >= 3) {
//         dispatch(setNotificationMessage({ message: "You can't add more than 3 cities.", type: 'error' }));
//       } else if (selectedCities.some(city => city.city.toLowerCase() === selectedCity.toLowerCase())) {
//         dispatch(setNotificationMessage({ message: "This city already exists in your favorite cities.", type: 'error' }));
//         const existingIndex = selectedCities.findIndex(city => city.city.toLowerCase() === selectedCity.toLowerCase());
//         setCarouselIndex(existingIndex + 1);
//       } else {
//         setTimeout(() => {
//           dispatch(addCityToFavorites({ city: selectedCity, unit: "metric" }));
//           setMainCityInput("");
//           dispatch(clearMainCitySuggestions());
//         }, 400);
//         dispatch(setNotificationMessage({ message: `${selectedCity} added successfully to your favourites.`, type: 'success' }));
//       }
//     }
//     else {
//       dispatch(setNotificationMessage({ message: "Add a city. You can't set an empty value.", type: 'error' }));
//     }
//   };

//   const handleInterestedCityClick = (city) => {
//     setSelectedCity(city);
//     dispatch(getMainCityData({ city, unit }));
//     setCarouselIndex(selectedCities.findIndex(c => c.city === city) + 1);
//   };

//   useEffect(() => {
//     localStorage.setItem('interestedCities', JSON.stringify(selectedCities));
//   }, [selectedCities]);

//   useEffect(() => {
//     const storedCities = JSON.parse(localStorage.getItem('interestedCities'));
//     if (storedCities) {
//       storedCities.forEach(city => {
//         dispatch(addCityToFavorites({ city: city.city, unit: "metric" }));
//       });
//     }
//   }, []);

//   const carouselCities = [mainCityData, ...selectedCities];

//   const handleCarouselChange = (index) => {
//     setCarouselIndex(index);
//     const selectedCity = index === 0 ? mainCity : selectedCities[index - 1].city;
//     setSelectedCity(selectedCity);
//     dispatch(getMainCityData({ city: selectedCity, unit }));
//   };

//   const handlePrevCarousel = () => {
//     const newIndex = (carouselIndex - 1 + carouselCities.length) % carouselCities.length;
//     handleCarouselChange(newIndex);
//   };

//   const handleNextCarousel = () => {
//     const newIndex = (carouselIndex + 1) % carouselCities.length;
//     handleCarouselChange(newIndex);
//   };

//   // Function 1: For next 5 days forecast, hourly forecast, and carousel index 1
//   const getTemperatureWithoutConversion = (temp) => {
//     return `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
//   };

//   // Function 2: For carousel indices 2, 3, 4 and favorite cities
//   const getTemperatureWithConversion = (temp) => {
//     if (unit === 'imperial') {
//       temp = (temp * 9) / 5 + 32;
//     }
//     return `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
//   };

//   const toggleUnit = () => {
//     setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
//   };

//   useEffect(() => {
//     const storedCities = JSON.parse(localStorage.getItem('interestedCities')) || [];
//     if (selectedCities.length === 0 && storedCities.length === 0) {
//       dispatch(setNotificationMessage({ message: "Click the add button to select your favourite cities", type: 'info' }));
//     }
//   }, [selectedCities, dispatch]);

//   return (
//     <div className={`lg:h-screen p-3 flex flex-col lg:flex-row  gap-4 lg:gap-2 ${currentTheme === "dark"
//       ? "bg-black text-white"
//       : "bg-gray-300 text-black"
//       }`}>

//       {/* Left Section */}
//       <div className="w-[30%] h-screen">
//         {/* Main City Card */}
//         <div className={`w-full h-[97%] p-5 rounded-xl flex flex-col justify-between relative ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} `}>
//           {/* Search bar */}
//           <div className={`hidden lg:block search-bar w-full`}>
//             <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-transparent text-white' : 'bg-transparent text-black'} rounded-full h-10 mb-4`} autoComplete="off" onSubmit={handleMainCitySearch}>
//               <label className="flex items-center justify-center mb-1">
//                 <Icon icon={search} size={25} />
//               </label>
//               <input
//                 type="text"
//                 className="flex-grow px-4 text-sm h-full outline-none bg-transparent"
//                 placeholder="Search for cities..."
//                 value={mainCityInput}
//                 onChange={handleMainCityInputChange}
//               />
//             </form>
//             {/* Suggestions */}
//             {mainCitySuggestions.length > 0 && (
//               <ul className={` ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white '} shadow-lg rounded-lg absolute z-50 w-[401px] max-h-60`}>
//                 {mainCitySuggestions.map((suggestion) => (
//                   <li
//                     key={`${suggestion.lat}-${suggestion.lon}`}
//                     className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
//                     onClick={() => handleMainSuggestionClick(suggestion)}
//                   >
//                     {suggestion.name}, {suggestion.country}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>


//           {/* Main City Card Data */}
//           <div className="flex justify-between mt-6 items-center">
//             <p className="text-sm font-semibold">{formattedDate}</p>
//             <div className="text-sm font-semibold">
//               {new Date().toLocaleString('en-US', {
//                 hour: 'numeric',
//                 minute: 'numeric',
//                 hour12: true
//               })}
//             </div>
//           </div>

//           {loadings ? (
//             <div className="flex justify-center items-center h-full">
//               <SphereSpinner loadings={loadings} color="#0D1DA9" size={25} />
//             </div>
//           ) : (
//             <>
//               {mainCityData && mainCityData.error ? (
//                 <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{mainCityData.error}</div>
//               ) : forecastError ? (
//                 <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{forecastError}</div>
//               ) : (
//                 carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
//                   <div className="flex flex-col w-full h-full">
//                     <div className="flex flex-col items-center">
//                       <div className="flex justify-between mt-4 w-full items-center">
//                         <div className="flex flex-col mt-6 justify-center items-center ">
//                           <div className="flex gap-2 items-center">
//                             <Icon icon={location} size={20} />
//                             <h4 className="text-2xl font-bold">{carouselCities[carouselIndex].data.name}</h4>
//                           </div>
//                           <img
//                             className="w-24 h-24 "
//                             src={`https://openweathermap.org/img/wn/${carouselCities[carouselIndex].data.weather[0].icon}@2x.png`}
//                             alt="icon"
//                           />
//                         </div>

//                         <div className="flex flex-col gap-4 justify-center items-center">
//                           <h1 className="text-6xl font-bold">
//                             {carouselIndex === 0
//                               ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp)
//                               : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp)
//                             }
//                           </h1>
//                           <h4 className="capitalize text-md font-bold">{carouselCities[carouselIndex].data.weather[0].description}</h4>
//                         </div>

//                       </div>
//                     </div>

//                     {/* <div className="">
//                       <div className="lg:flex hidden flex-row justify-between">
//                         <p className="text-sm font-bold" >Feels like {
//                           carouselIndex === 0
//                             ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.feels_like)
//                             : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.feels_like)
//                         }</p>
//                         <div className="flex space-x-2">
//                           <div className="flex items-center text-xs">
//                             <Icon icon={arrowUp} size={14} className="" />
//                             <span className="font-bold">{
//                               carouselIndex === 0
//                                 ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_max)
//                                 : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_max)
//                             }</span>
//                           </div>
//                           <div className="flex items-center text-xs">
//                             <Icon icon={arrowDown} size={14} className="" />
//                             <span className="font-bold">{
//                               carouselIndex === 0
//                                 ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_min)
//                                 : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_min)
//                             }</span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex flex-row mt-6 justify-between mx-2">
//                         <div className="flex flex-col items-center justify-center">
//                           <Icon icon={droplet} size={40} className=" mt-1" />
//                           <span className="text-xs mt-1 font-semibold">{carouselCities[carouselIndex].data.main.humidity} %</span>
//                           <div className="w-full mt-1 bg-gray-200 dark:bg-gray-500 rounded-full h-2.5">
//                             <div
//                               className="bg-blue-600 h-2.5 rounded-full"
//                               style={{ width: `${mainCityData && mainCityData.data ? mainCityData.data.main.humidity : 0}%` }}
//                             ></div>
//                           </div>
//                           <p className="text-xs mt-1 font-bold">Humidity</p>
//                         </div>

//                         <div className={`border-l-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-black'}  h-20 mx-4 mt-4`}></div>

//                         <div className="flex flex-col items-center justify-center">
//                           <Icon icon={wind} size={40} className=" mt-1" />
//                           <div className="flex text-xs mt-1 font-semibold items-center">
//                             <span>{mainCityData && mainCityData.data && `${mainCityData.data.wind.deg}°`}</span>
//                           </div>
//                           <div className="text-xs font-bold">
//                             {mainCityData && mainCityData.data && `${mainCityData.data.wind.speed} ${unit === 'metric' ? 'km/h' : 'mph'}`}
//                           </div>

//                           <p className="text-xs mt-1 font-bold">Wind</p>
//                         </div>

//                         <div className={`border-l-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-black'}  h-20 mx-4 mt-4`}></div>

//                         <div className="flex flex-col items-center justify-center">
//                           <Icon icon={activity} size={40} className="mt-1" />
//                           <div className="text-xs mt-1 font-semibold">Normal</div>
//                           <span className="text-xs mt-1 font-bold">{carouselCities[carouselIndex].data.main.pressure} hPa</span>
//                           <p className="text-xs mt-1 font-bold">Pressure</p>
//                         </div>
//                       </div>
//                     </div> */}
//                     <div className="lg:flex mb-4 mt-4 hidden flex-row justify-between">
//                       <p className="text-sm font-bold" >Feels like {
//                         carouselIndex === 0
//                           ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.feels_like)
//                           : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.feels_like)
//                       }</p>
//                       <div className="flex space-x-2">
//                         <div className="flex items-center text-xs">
//                           <Icon icon={arrowUp} size={14} className="" />
//                           <span className="font-bold">{
//                             carouselIndex === 0
//                               ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_max)
//                               : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_max)
//                           }</span>
//                         </div>
//                         <div className="flex items-center text-xs">
//                           <Icon icon={arrowDown} size={14} className="" />
//                           <span className="font-bold">{
//                             carouselIndex === 0
//                               ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_min)
//                               : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_min)
//                           }</span>
//                         </div>
//                       </div>
//                     </div>


//                     <div className="flex flex-col mt-6">

//                       <div>
//                         <p className="text-md font-bold mb-4">Today's Highlights</p>
//                       </div>
//                       <div className="hidden lg:grid grid-cols-2 lg:grid-cols-2 gap-3">

//                         <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
//                           <h4 className="text-xs font-bold mb-2">Humidity</h4>
//                           <div className="text-xs font-bold mb-2">
//                             {mainCityData && mainCityData.data && `${mainCityData.data.main.humidity}%`}
//                           </div>
//                           <div className="w-full bg-gray-200 dark:bg-gray-500 rounded-full h-2.5">
//                             <div
//                               className="bg-blue-600 h-2.5 rounded-full"
//                               style={{ width: `${mainCityData && mainCityData.data ? mainCityData.data.main.humidity : 0}%` }}
//                             ></div>
//                           </div>
//                         </div>
//                         <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
//                           <h4 className="text-xs font-bold mb-7">Visibility</h4>
//                           <div className="flex items-center  justify-between">
//                             <div className="text-xs font-bold">
//                               {mainCityData && mainCityData.data && `${(mainCityData.data.visibility / 1000).toFixed(1)} km`}
//                             </div>
//                             <div className="text-xs">
//                               {mainCityData && mainCityData.data && mainCityData.data.visibility >= 10000 ? 'Excellent' : 'Moderate'}
//                             </div>
//                           </div>
//                         </div>

//                         <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
//                           <h4 className="text-xs font-bold mb-2">Sunrise & Sunset</h4>
//                           <div className="flex items-center text-xs justify-between">
//                             <Icon icon={arrowUp} size={14} className="text-yellow-500" />
//                             <span>
//                               {mainCityData && mainCityData.data &&
//                                 new Date(mainCityData.data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </span>
//                           </div>
//                           <div className="flex items-center text-xs justify-between mt-2">
//                             <Icon icon={arrowDown} size={14} className="text-orange-500" />
//                             <span>
//                               {mainCityData && mainCityData.data &&
//                                 new Date(mainCityData.data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                             </span>
//                           </div>
//                         </div>

//                         <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
//                           <h4 className="text-xs font-bold mb-6">Wind Status</h4>
//                           <div className="flex items-center  justify-between">
//                             <div className="text-xs font-bold">
//                               {mainCityData && mainCityData.data && `${mainCityData.data.wind.speed} ${unit === 'metric' ? 'km/h' : 'mph'}`}
//                             </div>
//                             <div className="flex items-center">
//                               <Icon icon={wind} size={20} className="mr-1" />
//                               <span>{mainCityData && mainCityData.data && `${mainCityData.data.wind.deg}°`}</span>
//                             </div>
//                           </div>
//                         </div>


//                       </div>
//                     </div>
//                   </div>
//                 )
//               )}
//             </>
//           )}
//           <div className="flex justify-center mt-4">
//             {carouselCities.map((_, index) => (
//               <button
//                 key={index}
//                 className={`w-2 h-2 mx-1 rounded-full ${index === carouselIndex ? 'bg-blue-900' : 'bg-gray-300'}`}
//                 onClick={() => handleCarouselChange(index)}
//               />
//             ))}
//           </div>

//           {carouselIndex === 0 && (
//             <button
//               onClick={handleAddToInterested}
//               className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
//               title="Add to favorites"
//             >
//               <Icon icon={plus} size={24} />
//             </button>
//           )}

//           {carouselIndex !== 0 && (
//             <button
//               onClick={() => handleRemoveCity(carouselCities[carouselIndex].data.name)}
//               className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
//               title="Remove from favorites"
//             >
//               <Icon icon={trash2} size={24} />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Mobile view Search bar  */}
//       <div className="lg:hidden ">
//         <div className="flex flex-row justify-between">
//           {/* Search bar */}
//           <div className={` search-bar lg:w-[38%]`}>
//             <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136] text-white' : 'bg-gray-100 text-black border-2'} rounded-xl h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
//               <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
//                 <Icon icon={search} size={20} />
//               </label>
//               <input
//                 type="text"
//                 className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
//                 placeholder="Search City"
//                 value={mainCityInput}
//                 onChange={handleMainCityInputChange}
//               />
//             </form>
//             {/* Suggestions */}
//             {mainCitySuggestions.length > 0 && (
//               <ul className={`mt-2 ${currentTheme === 'dark' ? 'bg-gray-400' : 'bg-white border-2'} shadow-lg rounded-lg absolute z-50 w-full max-h-60 max-w-60 overflow-auto`}>
//                 {mainCitySuggestions.map((suggestion) => (
//                   <li
//                     key={`${suggestion.lat}-${suggestion.lon}`}
//                     className={`p-2 text-xs cursor-pointer ${currentTheme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
//                     onClick={() => handleMainSuggestionClick(suggestion)}
//                   >
//                     {suggestion.name}, {suggestion.country}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//           {/* Notifications */}
//           <div className={`fixed lg:hidden top-2 right-3 z-50 w-64 transition-all duration-500 ease-in-out ${showNotification ? 'translate-x-0' : 'translate-x-full'}`}>
//             {notificationMessage && notificationMessage.message && (
//               <div className={`relative p-3 text-sm rounded-lg shadow-md max-w-md ${notificationMessage.type === 'success' ? 'bg-green-500' :
//                 notificationMessage.type === 'error' ? 'bg-red-500' : notificationMessage.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'} text-white`}>

//                 {/* Message */}
//                 <div className="mr-2">

//                   {notificationMessage.message}
//                 </div>

//                 {/* Close Icon */}
//                 <button
//                   onClick={() => setShowNotification(false)}
//                   className="absolute top-0 right-0 mt-2 mr-2 text-white text-lg focus:outline-none"
//                 >
//                   &times;
//                 </button>
//               </div>
//             )}
//           </div>

//           <div className="flex items-center bg-[#303136] border-2 rounded-full cursor-pointer relative w-14 h-8"
//             onClick={() => dispatch(toggleTheme())}
//           >
//             <div
//               className={`absolute bg-gray-100 w-1/2 h-full rounded-full transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
//                 }`}
//             ></div>
//             <span className="absolute left-1 text-sm text-gray-400">
//               <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
//                 <path
//                   fill="#918888"
//                   fillRule="evenodd"
//                   d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
//                   clipRule="evenodd" />
//               </svg>
//             </span>
//             <span className="absolute right-1 text-sm text-blue-600">
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
//                 />
//               </svg>
//             </span>
//           </div>
//         </div>

//       </div>

//       {/* Right section */}
//       <div className="w-[70%] h-screen flex flex-col justify-between gap-2">

//         {/* Top Section */}
//         <div className="h-full w-full lg:h-[40%] flex flex-col lg:gap-2">

//           {/* Top section 1 */}
//           <div className="flex flex-row relative justify-between">

//             {/* Notifications */}
//             <div className={`fixed hidden lg:block top-2 right-3 z-50 w-64 lg:w-80 transition-all duration-500 ease-in-out ${showNotification ? 'translate-x-0' : 'translate-x-full'}`}>
//               {notificationMessage && notificationMessage.message && (
//                 <div className={`relative p-3 text-sm rounded-lg shadow-md max-w-md ${notificationMessage.type === 'success' ? 'bg-green-500' :
//                   notificationMessage.type === 'error' ? 'bg-red-500' : notificationMessage.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-400'} text-white`}>

//                   {/* Message */}
//                   <div className="mr-2">

//                     {notificationMessage.message}
//                   </div>

//                   {/* Close Icon */}
//                   <button
//                     onClick={() => setShowNotification(false)}
//                     className="absolute top-0 right-0 mt-2 mr-2 text-white text-xl font-bold focus:outline-none"
//                   >
//                     &times;
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Toggle Theme */}
//             <div className="hidden lg:flex items-center bg-gray-800 border-2 rounded-full cursor-pointer relative w-14 h-8"
//               onClick={() => dispatch(toggleTheme())}
//             >
//               <div
//                 className={`absolute bg-gray-100 w-1/2 h-full rounded-full transition-transform duration-300 ${currentTheme === "light" ? "transform translate-x-0" : "transform translate-x-full"
//                   }`}
//               ></div>
//               <span className="absolute left-1 text-sm text-gray-400">
//                 <svg className="" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
//                   <path
//                     fill="#918888"
//                     fillRule="evenodd"
//                     d="M12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 2a6 6 0 1 0 0-12a6 6 0 0 0 0 12M11 0h2v4.062a8 8 0 0 0-2 0zM7.094 5.68L4.222 2.808L2.808 4.222L5.68 7.094A8 8 0 0 1 7.094 5.68M4.062 11H0v2h4.062a8 8 0 0 1 0-2m1.618 5.906l-2.872 2.872l1.414 1.414l2.872-2.872a8 8 0 0 1-1.414-1.414M11 19.938V24h2v-4.062a8 8 0 0 1-2 0m5.906-1.618l2.872 2.872l1.414-1.414l-2.872-2.872a8 8 0 0 1-1.414 1.414M19.938 13H24v-2h-4.062a8 8 0 0 1 0 2M18.32 7.094l2.872-2.872l-1.414-1.414l-2.872 2.872c.528.41 1.003.886 1.414 1.414"
//                     clipRule="evenodd" />
//                 </svg>
//               </span>
//               <span className="absolute right-1 text-sm text-blue-600">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
//                   />
//                 </svg>
//               </span>
//             </div>

//             {/* C to F Buttons */}
//             <div className="flex space-x-2">
//               <button
//                 className={`px-4 py-2 rounded-full ${unit === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//                 onClick={() => setUnit('metric')}
//               >
//                 °C
//               </button>
//               <button
//                 className={`px-4 py-2 rounded-full ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
//                 onClick={() => setUnit('imperial')}
//               >
//                 °F
//               </button>
//             </div>
//           </div>

//           {/* Top Section 2 */}
//           <div className={`flex flex-col w-full pt-4 h-full ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"
//             } rounded-xl`}>
//             <div className="flex justify-start gap-2 pl-4 items-center">
//               <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
//                 <path fill="currentColor" d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m6.2 21.18a1 1 0 0 1-1.39.28l-5.9-4v-8.71a1 1 0 0 1 2 0v7.65l5 3.39a1 1 0 0 1 .29 1.39m-.35-14.95a11.39 11.39 0 1 0-8.54 20.83L15 30.63a13 13 0 1 1 9.7-23.77Z" className="clr-i-solid clr-i-solid-path-1" />
//                 <path fill="none" d="M0 0h36v36H0z" />
//               </svg>
//               <h4 className="text-md font-bold">Hourly Forecast</h4>
//             </div>
//             <div className="overflow-x-auto h-full scroll-container">
//               {hourlyForecast.length > 0 ? (
//                 <div className="flex flex-row mt-4 ml-3 lg:p-1 p-2 gap-2">
//                   {hourlyForecast.map((data, index) => {
//                     const date = new Date(data.dt_txt);
//                     const hour = date.getHours();
//                     const ampm = hour >= 12 ? "PM" : "AM";
//                     const hour12 = hour % 12 || 12;
//                     return (
//                       <div
//                         key={index}
//                         className={`flex-shrink-0 w-[120px] ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} rounded-2xl shadow-xl h-[160px] py-3 px-2 flex flex-col items-center justify-between`}
//                       >
//                         <div className="flex items-center justify-center w-full">
//                           <span className="text-lg font-bold whitespace-nowrap">{getTemperatureWithoutConversion(Math.round(data.main.temp))}</span>
//                         </div>

//                         <img
//                           src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
//                           alt="icon"
//                           className="w-10 h-10"
//                         />
//                         <div className="flex items-center justify-center w-full">
//                           <span className="text-xs font-light truncate w-full text-center" title={data.weather[0].description}>
//                             {data.weather[0].description}
//                           </span>
//                         </div>

//                         <div className="flex items-center justify-center w-full">
//                           <span className="text-xs font-bold">
//                             {`${hour12}:00 ${ampm}`}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               ) : (
//                 <div className="flex justify-center items-center h-full w-full">
//                   Fetching Data!! Please wait...
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Map in the mobile view */}
//           <div className={`lg:hidden flex items-center w-full h-[300px] mt-4 lg:w-[60%]  border-2 ${currentTheme === 'dark' ? 'border-[#303136]' : 'border-gray-100'} rounded-xl z-10`}>
//             <div className="h-full w-full">
//               {loadings ? (
//                 <div className="flex justify-center items-center  w-full h-full">
//                   <SphereSpinner loadings={loadings} color="#0D1DA9" size={30} />
//                 </div>
//               ) : (
//                 position && (
//                   <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
//                     <TileLayer
//                       url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
//                       attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
//                     />
//                     <Marker position={position} icon={myIcon}>
//                       <Popup>
//                         {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
//                           <>
//                             <h3>{carouselCities[carouselIndex].data.name}</h3>
//                           </>
//                         )}
//                       </Popup>
//                     </Marker>
//                     <MapUpdater center={position} />
//                   </MapContainer>
//                 )
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Bottom Section */}
//         <div className="h-full flex flex-col gap-4 lg:h-[60%] lg:flex-row lg:gap-3">
//           {/* Large Screen Next 5 days and Map */}
//           <div className={`w-full ${currentTheme === "dark" ? "border-none" : "bg-transparent"
//             } rounded-xl flex flex-col  lg:gap-3`}>
//             <div className="flex flex-col lg:flex-row h-[350px] lg:h-[95%] justify-between lg:gap-2">
//               {/* Next 5 days Forecast */}
//               <div className={`flex flex-col w-full h-full lg:w-[40%] ${currentTheme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl pt-3`}>
//                 <div className="flex gap-2 pl-4 justify-start items-center">
//                   <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M2 19c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-8H2zM19 4h-2V3c0-.6-.4-1-1-1s-1 .4-1 1v1H9V3c0-.6-.4-1-1-1s-1 .4-1 1v1H5C3.3 4 2 5.3 2 7v2h20V7c0-1.7-1.3-3-3-3" /></svg>
//                   <h4 className="text-md font-bold">
//                     Next 5 Days
//                   </h4>
//                 </div>
//                 {filteredForecast.length > 0 ? (
//                   <div className="flex flex-col h-full pl-4">
//                     {filteredForecast.map((data, index) => {
//                       const date = new Date(data.dt_txt);
//                       const day = date.toLocaleDateString("en-US", { weekday: "long" });
//                       return (
//                         <div
//                           key={index}
//                           className="flex flex-row justify-between items-center bg-transparent flex-grow"
//                         >
//                           <h5 className="text-sm w-[25%] font-bold">{day}</h5>
//                           <div className="w-[20%]">
//                             <img
//                               src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
//                               alt="icon"
//                               className="w-10 h-10"
//                             />
//                           </div>
//                           <h5 className="text-xs w-[25%] font-semibold capitalize">
//                             {data.weather[0].description}
//                           </h5>
//                           <h5 className="text-xs w-[40%] text-center font-bold">
//                             {getTemperatureWithoutConversion(data.main.temp_max)} / {getTemperatureWithoutConversion(data.main.temp_min)}
//                           </h5>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center h-full w-full">
//                     Fetching Data!! Please wait...
//                   </div>
//                 )}
//               </div>

//               {/* Map Section */}
//               <div className={`hidden lg:flex items-center w-full h-full lg:w-[60%]  border-2 ${currentTheme === 'dark' ? 'border-[#303136] border-2' : ''} rounded-xl z-10`}>
//                 <div className="h-full w-full">
//                   {loadings ? (
//                     <div className="flex justify-center items-center  w-full h-full">
//                       <SphereSpinner loadings={loadings} color="#0D1DA9" size={30} />
//                     </div>
//                   ) : (
//                     position && (
//                       <MapContainer center={position} zoom={10} zoomControl={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
//                         <TileLayer
//                           url={`https://api.maptiler.com/maps/${currentTheme === 'dark' ? 'streets' : 'streets'}/{z}/{x}/{y}.png?key=iww5jN0ZVMDaPpwR0CAA&language=en`}
//                           attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
//                         />
//                         <Marker position={position} icon={myIcon}>
//                           <Popup>
//                             {carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
//                               <>
//                                 <h3>{carouselCities[carouselIndex].data.name}</h3>
//                               </>
//                             )}
//                           </Popup>
//                         </Marker>
//                         <MapUpdater center={position} />
//                       </MapContainer>
//                     )
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>


//       </div>
//     </div >
//   );
// }

// export default App;


// Final App
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
import { location } from 'react-icons-kit/icomoon/location'
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
import { trash2 } from "react-icons-kit/feather/trash2.js";
import { plus } from "react-icons-kit/feather/plus.js";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Cloud, Droplets, Thermometer, Sun, Wind } from "lucide-react"

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
  const [mainCity, setMainCity] = useState("Lahore");
  const [selectedCity, setSelectedCity] = useState("Lahore");
  const [unit, setUnit] = useState("metric");
  const { currentTheme } = useSelector((state) => state.theme);
  const [mainCityInput, setMainCityInput] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [showHourlyDetails, setShowHourlyDetails] = useState(false);
  const [showDailyDetails, setShowDailyDetails] = useState(false);


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

  // const fetchCityFromIP = async () => {
  //   try {
  //     const response = await axios.get('https://ipapi.co/json/');
  //     const cityName = response.data.city || 'Lahore';
  //     await fetchCoordinatesFromCity(cityName);
  //     setMainCity(cityName);
  //     setSelectedCity(cityName);
  //   } catch (error) {
  //     console.error('Error fetching city name:', error);
  //     await fetchCoordinatesFromCity('Lahore');
  //   } finally {
  //     setLoadings(false);
  //   }
  // };


  // const fetchCityFromIP = async () => {
  //   try {
  //     const response = await axios.get('https://ipinfo.io/json?token=1fafefa068763f');
  //     const cityName = response.data.city || 'Lahore';
  //     await fetchCoordinatesFromCity(cityName);
  //     setMainCity(cityName);
  //     setSelectedCity(cityName);
  //   } catch (error) {
  //     console.error('Error fetching city name:', error);
  //     await fetchCoordinatesFromCity('Lahore');
  //     setMainCity('Lahore');
  //     setSelectedCity('Lahore');
  //   } finally {
  //     setLoadings(false);
  //   }
  // };


  const fetchCityFromIP = async () => {
    try {
      const apiKey = '3a8d106666dc43f9afd2de85cd29715e';
      const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}`);
      const cityName = response.data.city || 'Lahore';
      await fetchCoordinatesFromCity(cityName);
      setMainCity(cityName);
      setSelectedCity(cityName);
    } catch (error) {
      console.error('Error fetching city name:', error);
      await fetchCoordinatesFromCity('Lahore');
      setMainCity('Lahore');
      setSelectedCity('Lahore');
    } finally {
      setLoadings(false);
    }
  };


  useEffect(() => {
    fetchCityFromIP();
  }, []);

  useEffect(() => {
    const isAnyChildLoading = allLoadings.some((state) => state);
    setLoadings(isAnyChildLoading);
  }, [allLoadings]);

  useEffect(() => {
    dispatch(getMainCityData({ city: selectedCity, unit }));
  }, [dispatch, selectedCity, unit]);

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

    setMainCity(mainCityInput);
    setSelectedCity(mainCityInput);
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

  // const handleRemoveCity = (city) => {
  //   dispatch(removeCity(city));
  //   dispatch(setNotificationMessage({ message: `${city} removed successfully from your favourite cities!`, type: 'success' }));
  //   if (carouselIndex > 0) setCarouselIndex(carouselIndex - 1);
  //   else if(carouselIndex === 1) fetchCityFromIP();
  // };


  const handleRemoveCity = (city) => {
    const currentIndex = selectedCities.findIndex(c => c.city === city);

    // Dispatch the removal action first to update selectedCities
    dispatch(removeCity(city));
    fetchCityFromIP();
    dispatch(setNotificationMessage({ message: `${city} removed successfully from your favourite cities!`, type: 'success' }));

    // Update carouselIndex only if the current index points to a deleted city
    setCarouselIndex((prevIndex) => {
      if (prevIndex > currentIndex) {
        // If the carousel was after the removed city, decrement the index
        return prevIndex - 1;
      } else if (prevIndex === currentIndex) {
        // If the carousel was at the removed city, adjust to a safe index
        return Math.min(prevIndex, selectedCities.length - 1);
      }
      return prevIndex;
    });

  };


  // // const handleRemoveCity = (city) => {
  // //   const currentIndex = selectedCities.findIndex(c => c.city === city);
  // //   dispatch(removeCity(city));
  // //   dispatch(setNotificationMessage({ message: `${city} removed successfully from your favourite cities!`, type: 'success' }));

  // //   // Update carouselIndex
  // //   if (carouselIndex > currentIndex + 1) {
  // //     setCarouselIndex(carouselIndex - 1);
  // //   } else if (carouselIndex === currentIndex + 1) {
  // //     setCarouselIndex(Math.max(carouselIndex - 1, 0));
  // //   }
  // // };

  // // const handleRemoveCity = useCallback((city) => {
  // //   const currentIndex = selectedCities.findIndex(c => c.city === city);

  // //   // Update carouselIndex first
  // //   if (carouselIndex > currentIndex + 1) {
  // //     setCarouselIndex(prev => prev - 1);
  // //   } else if (carouselIndex === currentIndex + 1) {
  // //     setCarouselIndex(prev => Math.max(prev - 1, 0));
  // //   }

  // //   // Then dispatch the remove action
  // //   dispatch(removeCity(city));
  // //   dispatch(setNotificationMessage({ message: `${city} removed successfully from your favourite cities!`, type: 'success' }));
  // // }, [selectedCities, carouselIndex, dispatch]);


  // const handleRemoveCity = useCallback((city) => {
  //   const currentIndex = selectedCities.findIndex(c => c.city === city);

  //   if (currentIndex === -1) {
  //     // City not found; optionally handle this case
  //     return;
  //   }

  //   // Dispatch the remove action first to update the selectedCities
  //   dispatch(removeCity(city));

  //   // Dispatch the notification message
  //   dispatch(setNotificationMessage({
  //     message: `${city} removed successfully from your favourite cities!`,
  //     type: 'success'
  //   }));

  // Adjust the carouselIndex based on the removed city's position
  //   setCarouselIndex(prevIndex => {
  //     if (prevIndex > currentIndex) {
  //       // If the carousel was after the removed city, decrement the index
  //       return prevIndex - 1;
  //     } else if (prevIndex === currentIndex) {
  //       // If the carousel was at the removed city, move to the previous index or stay at 0
  //       return Math.max(prevIndex - 1, 0);
  //     }
  //     // If the carousel was before the removed city, no change
  //     return prevIndex;
  //   });
  // }, [selectedCities, dispatch]);

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

  useEffect(() => {
    if (notificationMessage) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        dispatch(clearNotificationMessage());
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    } else {
      setShowNotification(false);
    }
  }, [notificationMessage, dispatch]);

  useEffect(() => {
    if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Rain") {
      dispatch(setNotificationMessage({ message: `Rain is expected in ${mainCityData.data.name} in the coming hours. Be prepared!`, type: 'warning' }));
    }
    else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clouds") {
      dispatch(setNotificationMessage({ message: `Cloudy weather is expected in ${mainCityData.data.name} in the coming hours.`, type: 'info' }));
    }
    else if (mainCityData && mainCityData.data && mainCityData.data.weather[0].main === "Clear") {
      dispatch(setNotificationMessage({ message: `Clear weather expected in ${mainCityData.data.name}. Your are good to go!`, type: 'info' }));
    }
  }, [mainCityData, dispatch]);

  const handleMainSuggestionClick = (suggestion) => {
    setMainCity(suggestion.name);
    dispatch(getMainCityData({ city: suggestion.name, unit }));
    setMainCityInput(suggestion.name);
    dispatch(clearMainCitySuggestions());
    setCarouselIndex(0);
  };

  // make changes in this: carouselCities[0].data.name
  const handleAddToInterested = () => {
    if (carouselCities[0].data.name) {
      if (selectedCities.length >= 3) {
        dispatch(setNotificationMessage({ message: "You can't add more than 3 cities.", type: 'error' }));
      } else if (selectedCities.some(city => city.city.toLowerCase() === (carouselCities[0].data.name).toLowerCase())) {
        dispatch(setNotificationMessage({ message: "This city is already exists in your favorites cities.", type: 'error' }));
      } else {
        setTimeout(() => {
          dispatch(addCityToFavorites({ city: carouselCities[0].data.name, unit: "metric" }));
          setMainCityInput("");
          dispatch(clearMainCitySuggestions());
        }, 400);
        dispatch(setNotificationMessage({ message: `${carouselCities[0].data.name} added successfully to your favourites.`, type: 'success' }));
      }
    }
    else {
      dispatch(setNotificationMessage({ message: "Add a city. You can't set an empty value.", type: 'error' }));
    }
  };

  const handleInterestedCityClick = (city) => {
    setSelectedCity(city);
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

  // const handleCarouselChange = (index) => {
  //   setCarouselIndex(index);
  //   const selectedCity = index === 0 ? mainCity : selectedCities[index - 1].city;
  //   setSelectedCity(selectedCity);
  //   dispatch(getMainCityData({ city: selectedCity, unit }));
  // }

  const handleCarouselChange = (index) => {
    const maxIndex = carouselCities.length - 1;
    const safeIndex = Math.min(Math.max(0, index), maxIndex);
    setCarouselIndex(safeIndex);
    const selectedCity = safeIndex === 0 ? mainCity : selectedCities[safeIndex - 1].city;
    setSelectedCity(selectedCity);
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

  // Function 1: For next 5 days forecast, hourly forecast, and carousel index 1
  const getTemperatureWithoutConversion = (temp) => {
    return `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
  };

  // Function 2: For carousel indices 2, 3, 4 and favorite cities
  const getTemperatureWithConversion = (temp) => {
    if (unit === 'imperial') {
      temp = (temp * 9) / 5 + 32;
    }
    return `${Math.round(temp)}°${unit === 'metric' ? 'C' : 'F'}`;
  };

  const toggleUnit = () => {
    setUnit((prevUnit) => (prevUnit === "metric" ? "imperial" : "metric"));
  };

  useEffect(() => {
    const storedCities = JSON.parse(localStorage.getItem('interestedCities')) || [];
    if (selectedCities.length === 0 && storedCities.length === 0) {
      dispatch(setNotificationMessage({ message: "Click the add button to select your favourite cities", type: 'info' }));
    }
  }, [selectedCities, dispatch]);

  // Styling for additional Highlights
  const isDark = currentTheme === "dark";

  const containerStyle = {
    width: '100%',
    padding: '24px',
    borderRadius: '12px',
    background: isDark ? 'linear-gradient(to bottom right, #1a365d, #2d3748)' : '#f3f4f6',
    color: isDark ? '#ffffff' : '#000000',
  };

  const cardStyle = {
    background: isDark ? '#2d3748' : '#ffffff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '24px',
    textAlign: 'center',
  };

  const metricTitleStyle = {
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const metricValueStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const metricDescStyle = {
    fontSize: '12px',
    color: isDark ? '#a0aec0' : '#718096',
  };

  return (
    <div className={`flex flex-col ${currentTheme === "dark"
      ? "bg-black text-white"
      : "bg-gray-300 text-black"
      }`}>
      <div className={`lg:h-screen p-3 flex flex-col lg:flex-row gap-4 lg:gap-2 `}>

        {/* Mobile view Search bar  */}
        <div className="lg:hidden ">
          <div className="flex flex-row justify-between">
            {/* Search bar */}
            <div className={` search-bar lg:w-[38%]`}>
              <form className={`flex items-center ${currentTheme === 'dark' ? 'bg-[#303136] text-white' : 'bg-gray-100 text-black border-2'} rounded-xl h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
                <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
                  <Icon icon={search} size={20} />
                </label>
                <input
                  type="text"
                  className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
                  placeholder="Search and Add City"
                  value={mainCityInput}
                  onChange={handleMainCityInputChange}
                />
                <button type="button" title="Click the add button to select your favourite cities" onClick={handleAddToInterested} className={`font-semibold ${currentTheme === 'dark' ? 'bg-gray-600 ' : 'bg-gray-400'} text-xs rounded-r-lg h-full w-10`}>
                  Add
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
            <div className={`fixed lg:hidden top-2 right-3 z-50 w-64 transition-all duration-500 ease-in-out ${showNotification ? 'translate-x-0' : 'translate-x-full'}`}>
              {notificationMessage && notificationMessage.message && (
                <div className={`relative p-3 text-sm rounded-lg shadow-md max-w-md ${notificationMessage.type === 'success' ? 'bg-green-500' :
                  notificationMessage.type === 'error' ? 'bg-red-500' : notificationMessage.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'} text-white`}>

                  {/* Message */}
                  <div className="mr-2">

                    {notificationMessage.message}
                  </div>

                  {/* Close Icon */}
                  <button
                    onClick={() => setShowNotification(false)} // Assuming you have a state like `setShowNotification`
                    className="absolute top-0 right-0 mt-2 mr-2 text-white text-lg focus:outline-none"
                  >
                    &times;
                  </button>
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

        {/* Left Section */}
        <div className="w-full lg:w-[30%] h-screen">
          {/* Main City Card */}
          <div className={`w-full h-[97%] p-5 rounded-xl flex flex-col justify-between relative ${currentTheme === 'dark' ? 'mainCardBg' : 'bg-gray-100'}`}>
            <div className="flex justify-between h-[10%] items-center">
              <div>
                <p className="text-sm font-semibold">{formattedDate}</p>
                <div className="text-xs font-semibold">
                  {new Date().toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true // for 12-hour format
                  })}
                </div>
              </div>

              {/* C to F Buttons */}
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-full ${unit === 'metric' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setUnit('metric')}
                >
                  °C
                </button>
                <button
                  className={`px-4 py-2 rounded-full ${unit === 'imperial' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  onClick={() => setUnit('imperial')}
                >
                  °F
                </button>
              </div>
            </div>

            {loadings ? (
              <div className="flex justify-center items-center h-full">
                <SphereSpinner loadings={loadings} color="#0D1DA9" size={25} />
              </div>
            ) : (
              <>
                {mainCityData && mainCityData.error ? (
                  <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{mainCityData.error}</div>
                ) : forecastError ? (
                  <div className="text-red-500 flex justify-center items-center capitalize font-semibold text-center h-full w-full">{forecastError}</div>
                ) : (
                  carouselCities[carouselIndex] && carouselCities[carouselIndex].data && (
                    <div className="flex flex-col w-full h-full">
                      <div className="flex flex-col h-[40%] items-center">
                        <div className="flex flex-col w-full">
                          <div className="flex justify-between mt-4 w-full items-center">

                            <div className="flex flex-col mt-6 justify-center items-center ">
                              <div className="flex gap-2 items-center">
                                <Icon icon={location} size={20} />
                                <h4 className="text-2xl font-bold">{carouselCities[carouselIndex].data.name}</h4>
                              </div>
                              <img
                                className="w-24 h-24 "
                                src={`https://openweathermap.org/img/wn/${carouselCities[carouselIndex].data.weather[0].icon}@2x.png`}
                                alt="icon"
                              />
                            </div>

                            <div className="flex flex-col gap-4 justify-center items-center">
                              <h1 className="text-6xl font-bold">
                                {carouselIndex === 0
                                  ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp)
                                  : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp)
                                }
                              </h1>
                              <h4 className="capitalize text-md font-bold">{carouselCities[carouselIndex].data.weather[0].description}</h4>
                            </div>

                          </div>


                          {/* feels like  */}
                          <div className="flex flex-row justify-between mt-8">
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M8.5 15a3.5 3.5 0 0 1-1.75-6.532L7 8.324V2.5A1.496 1.496 0 0 1 9.908 2H8.5v1H10v1H8.5v1H10v1H8.5v1H10v1.324l.25.144A3.5 3.5 0 0 1 8.5 15M11 7.758V2.5a2.5 2.5 0 1 0-5 0v5.258a4.5 4.5 0 1 0 5 0" /><path fill="currentColor" d="M8.5 9a2.5 2.5 0 1 1 0 5a2.5 2.5 0 0 1 0-5" /></svg>
                              <p className="text-sm font-bold" ><span>
                              </span> Feels like {
                                  carouselIndex === 0
                                    ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.feels_like)
                                    : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.feels_like)
                                }</p>
                            </div>

                            <div className="flex space-x-2">
                              <div className="flex items-center text-xs">
                                <Icon icon={arrowUp} size={14} className="" />
                                <span className="font-bold">{
                                  carouselIndex === 0
                                    ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_max)
                                    : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_max)
                                }</span>
                              </div>
                              <div className="flex items-center text-xs">
                                <Icon icon={arrowDown} size={14} className="" />
                                <span className="font-bold">{
                                  carouselIndex === 0
                                    ? getTemperatureWithoutConversion(carouselCities[carouselIndex].data.main.temp_min)
                                    : getTemperatureWithConversion(carouselCities[carouselIndex].data.main.temp_min)
                                }</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-[50%]">
                        {/* Todays highlights */}
                        <div className="flex flex-col mt-6">
                          <div className="flex items-center mb-8 gap-2">
                            {/* Icon of Toady highlights */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" width="1em" height="1em" viewBox="0 0 512 512"><path fill="currentColor" d="M416 64h-16V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 368 48v16H144V48.45c0-8.61-6.62-16-15.23-16.43A16 16 0 0 0 112 48v16H96a64 64 0 0 0-64 64v12a4 4 0 0 0 4 4h440a4 4 0 0 0 4-4v-12a64 64 0 0 0-64-64m61 112H35a3 3 0 0 0-3 3v237a64 64 0 0 0 64 64h320a64 64 0 0 0 64-64V179a3 3 0 0 0-3-3M224 307.43A28.57 28.57 0 0 1 195.43 336h-70.86A28.57 28.57 0 0 1 96 307.43v-70.86A28.57 28.57 0 0 1 124.57 208h70.86A28.57 28.57 0 0 1 224 236.57Z" /></svg>
                            <p className="text-md font-bold">Today's Highlights</p>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-2 gap-3">
                            <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
                              <div className="flex items-center gap-2 mb-2 justify-start">
                                <svg className={`w-8 h-8 ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.5q-3.325 0-5.663-2.3T4 13.6q0-1.575.613-3.012T6.35 8.05L12 2.5l5.65 5.55q1.125 1.1 1.738 2.538T20 13.6q0 3.3-2.337 5.6T12 21.5m-6-7.9h12q0-1.175-.45-2.237T16.25 9.5L12 5.3L7.75 9.5q-.85.8-1.3 1.863T6 13.6" /></svg>
                                <h4 className="text-sm font-bold">Humidity</h4>
                              </div>
                              <div className="text-xs font-bold mb-2">
                                {mainCityData && mainCityData.data && `${mainCityData.data.main.humidity}%`}
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-500 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${mainCityData && mainCityData.data ? mainCityData.data.main.humidity : 0}%` }}
                                ></div>
                              </div>
                            </div>

                            <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
                              <div className="flex items-center gap-2 mb-2">
                                <svg className={`w-8 h-8 ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" /></svg>
                                <h4 className="text-sm font-bold">Visibility</h4>
                              </div>
                              <div className="flex items-center  justify-between">
                                <div className="text-xs font-bold">
                                  {mainCityData && mainCityData.data && `${(mainCityData.data.visibility / 1000).toFixed(1)} km`}
                                </div>
                                <div className="text-xs">
                                  {mainCityData && mainCityData.data && mainCityData.data.visibility >= 10000 ? 'Excellent' : 'Moderate'}
                                </div>
                              </div>
                            </div>

                            <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
                              <div className="flex items-center gap-2 mb-2 justify-start">
                                <svg className={`w-8 h-8 ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M12 19a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1m6.364-2.05l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414m-12.728 0a1 1 0 0 1 1.497 1.32l-.083.094l-.707.707a1 1 0 0 1-1.497-1.32l.083-.094zM12 6a6 6 0 1 1 0 12a6 6 0 0 1 0-12m-8 5a1 1 0 0 1 .117 1.993L4 13H3a1 1 0 0 1-.117-1.993L3 11zm17 0a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2zM4.929 4.929a1 1 0 0 1 1.32-.083l.094.083l.707.707a1 1 0 0 1-1.32 1.497l-.094-.083l-.707-.707a1 1 0 0 1 0-1.414m14.142 0a1 1 0 0 1 0 1.414l-.707.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0M12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1" /></g></svg>
                                <h4 className="text-sm font-bold mb-2">Sunrise & Sunset</h4>
                              </div>
                              <div className="flex items-center text-xs justify-between">
                                <Icon icon={arrowUp} size={14} className="text-yellow-500" />
                                <span>
                                  {mainCityData && mainCityData.data &&
                                    new Date(mainCityData.data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex items-center text-xs justify-between mt-2">
                                <Icon icon={arrowDown} size={14} className="text-orange-500" />
                                <span>
                                  {mainCityData && mainCityData.data &&
                                    new Date(mainCityData.data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            <div className={`${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} p-3 rounded-lg`}>
                              <div className="flex items-center gap-2 mb-2 justify-start">
                                <svg className={`w-8 h-8 ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 3h6v2H4zM1 7h5v2H1zm2 12h5v2H3zm10.73-8.39c.77.23 1.3.78 1.57 1.46l4.27-7.11c.65-1.08.3-2.46-.78-3.13c-.87-.52-1.99-.41-2.73.29l-3.43 3.21c-.4.37-.63.9-.63 1.45v3.93c.36-.15 1-.33 1.73-.1m-3.12 1.66c.16-.52.48-.96.89-1.27H3.28C2 11 1 12 1 13.28c0 1.02.67 1.91 1.65 2.19l4.51 1.29c.53.15 1.1.08 1.58-.21l2.69-1.61a2.49 2.49 0 0 1-.82-2.67m11.6 6.34l-2.28-4.11a2.07 2.07 0 0 0-1.26-.96l-3.17-.8c0 .32 0 .66-.11.99A2.48 2.48 0 0 1 13 15.5c-.61 0-1-.22-1-.22V21c-1.1 0-2 .9-2 2h6c0-1.1-.9-2-2-2v-4.28l4.61 4.61c.89.89 2.33.89 3.22 0c.72-.72.88-1.83.38-2.72m-9.65-4.18c.79.24 1.63-.2 1.87-1c.24-.79-.2-1.63-1-1.87c-.79-.24-1.63.2-1.87 1c-.24.79.21 1.63 1 1.87" /></svg>
                                <h4 className="text-sm font-bold">Wind Status</h4>
                              </div>
                              <div className="flex items-center  justify-between">
                                <div className="text-xs font-bold">
                                  {mainCityData && mainCityData.data && `${mainCityData.data.wind.speed} ${unit === 'metric' ? 'km/h' : 'mph'}`}
                                </div>
                                <div className="flex items-center">
                                  <Icon icon={wind} size={20} className="mr-1" />
                                  <span>{mainCityData && mainCityData.data && `${mainCityData.data.wind.deg}°`}</span>
                                </div>
                              </div>
                            </div>
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

            {/* <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex justify-between w-full px-2">
            <button onClick={handlePrevCarousel} className="text-gray-500 hover:text-gray-700">
              <Icon icon={chevronLeft} size={24} />
            </button>
            <button onClick={handleNextCarousel} className="text-gray-500 hover:text-gray-700">
              <Icon icon={chevronRight} size={24} />
            </button>
          </div> */}

            {/* Add Delete Button */}
            {carouselIndex === 0 && (
              <button
                onClick={handleAddToInterested}
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
                title="Add to favorites"
              >
                <Icon icon={plus} size={24} />
              </button>
            )}

            {carouselIndex !== 0 && (
              <button
                onClick={() => {
                  handleRemoveCity(carouselCities[carouselIndex].data.name)
                  console.log(carouselCities[carouselIndex].data.name);
                }}
                className="absolute bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110"
                title="Remove from favorites"
              >
                <Icon icon={trash2} size={24} />
              </button>
            )}

          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-[70%] h-screen flex flex-col justify-between gap-2">

          {/* Top Section */}
          <div className="h-full w-full lg:h-[40%] flex flex-col lg:gap-2">

            {/* Search Bar toggle and Theme */}
            <div className="flex flex-row relative justify-between">
              {/* Search bar */}
              <div className={`hidden lg:block search-bar lg:w-[39%]`}>
                <form className={`flex items-center ${currentTheme === 'dark' ? 'mainCardBg text-white' : 'bg-gray-100 text-black'} rounded-lg h-8`} autoComplete="off" onSubmit={handleMainCitySearch}>
                  <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
                    <Icon icon={search} size={20} />
                  </label>
                  <input
                    type="text"
                    className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
                    placeholder="Search and Add City"
                    value={mainCityInput}
                    onChange={handleMainCityInputChange}
                  />
                  <button type="button" title="Click to see the current city forecast"
                    onClick={() => {
                      fetchCityFromIP
                      handleCarouselChange(0)
                    }}
                    className={`font-semibold ${currentTheme === 'dark' ? 'bg-gray-600 ' : 'bg-gray-400'} text-xs rounded-r-lg h-full w-10`}>
                    <Icon icon={location} size={20} />
                  </button>
                </form>
                {/* Suggestions */}
                {mainCitySuggestions.length > 0 && (
                  <ul className={`mt-1 ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white '} shadow-lg rounded-lg absolute z-50 w-full max-h-60 lg:w-[39%] overflow-auto`}>
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
              <div className={`fixed hidden lg:block top-2 right-3 z-50 w-64 lg:w-80 transition-all duration-500 ease-in-out ${showNotification ? 'translate-x-0' : 'translate-x-full'}`}>
                {notificationMessage && notificationMessage.message && (
                  <div className={`relative p-3 text-sm rounded-lg shadow-md max-w-md ${notificationMessage.type === 'success' ? 'bg-green-500' :
                    notificationMessage.type === 'error' ? 'bg-red-500' : notificationMessage.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-400'} text-white`}>

                    {/* Message */}
                    <div className="mr-2">

                      {notificationMessage.message}
                    </div>

                    {/* Close Icon */}
                    <button
                      onClick={() => setShowNotification(false)} // Assuming you have a state like `setShowNotification`
                      className="absolute top-0 right-0 mt-2 mr-2 text-white text-xl font-bold focus:outline-none"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
              <div className="hidden lg:flex items-center bg-gray-800 border-2 rounded-full cursor-pointer relative w-14 h-8"
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

            {/* Hourly forecast */}
            <div className={`flex flex-col w-full h-full pt-4 ${currentTheme === 'dark' ? 'mainCardBg' : 'bg-gray-100'} rounded-xl`}>
              <div className="flex justify-between gap-2 pl-4 items-center">
                <div className="flex justify-start gap-2 items-center">
                  <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
                    <path fill="currentColor" d="M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m6.2 21.18a1 1 0 0 1-1.39.28l-5.9-4v-8.71a1 1 0 0 1 2 0v7.65l5 3.39a1 1 0 0 1 .29 1.39m-.35-14.95a11.39 11.39 0 1 0-8.54 20.83L15 30.63a13 13 0 1 1 9.7-23.77Z" className="clr-i-solid clr-i-solid-path-1" />
                    <path fill="none" d="M0 0h36v36H0z" />
                  </svg>
                  <h4 className="text-md font-bold">Hourly Forecast</h4>
                </div>
                <div>
                  <button
                    onClick={() => setShowHourlyDetails(!showHourlyDetails)}
                    className="pr-4 text-blue-500 hover:text-blue-700"
                  >
                    {showHourlyDetails ? "Hide Details" : "Show Details"}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto h-full scroll-container">
                {hourlyForecast.length > 0 ? (
                  <div className="flex flex-row mt-4 ml-2 lg:p-1 p-2 gap-2">
                    {hourlyForecast.map((data, index) => {
                      const date = new Date(data.dt_txt);
                      const hour = date.getHours();
                      const ampm = hour >= 12 ? "PM" : "AM";
                      const hour12 = hour % 12 || 12;
                      return (
                        <div
                          key={index}
                          className={`flex-shrink-0 w-[120px] ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-white'} rounded-2xl shadow-xl h-[160px] py-3 px-2 ml-[1.5px] flex flex-col items-center justify-between`}
                        >
                          <div className="flex items-center justify-center w-full">
                            <span className="text-lg font-bold whitespace-nowrap">{getTemperatureWithoutConversion(Math.round(data.main.temp))}</span>
                          </div>

                          <img
                            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                            alt="icon"
                            className="w-10 h-10"
                          />
                          <div className="flex items-center justify-center w-full">
                            <span className="text-xs font-light truncate w-full text-center" title={data.weather[0].description}>
                              {data.weather[0].description}
                            </span>
                          </div>

                          <div className="flex items-center justify-center w-full">
                            <span className="text-xs font-bold">
                              {`${hour12}:00 ${ampm}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-full w-full">
                    Fetching Data!! Please wait...
                  </div>
                )}
              </div>


            </div>
          </div>

          {/* Bottom Section */}
          <div className="h-full w-full lg:h-[60%] flex flex-col lg:flex-row lg:gap-3">
            {/* Large Screen view of side-bar notification and toggle theme & next 5 days and Map */}
            <div className={`w-full lg:h-full ${currentTheme === 'dark' ? 'border-none' : 'bg-transparent'} rounded-xl flex flex-col  space-y-1 lg:gap-3`}>
              <div className="flex flex-col lg:flex-row h-[350px] lg:h-[95%] justify-between lg:gap-2">
                {/* Next 5 days Forecast */}
                <div className={`flex flex-col w-full h-full lg:w-[40%] ${currentTheme === 'dark' ? 'mainCardBg' : 'bg-gray-100'} rounded-xl pt-3`}>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 pl-4 justify-start items-center">
                      <svg className="hover:text-blue-500 font-semibold text-2xl" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M2 19c0 1.7 1.3 3 3 3h14c1.7 0 3-1.3 3-3v-8H2zM19 4h-2V3c0-.6-.4-1-1-1s-1 .4-1 1v1H9V3c0-.6-.4-1-1-1s-1 .4-1 1v1H5C3.3 4 2 5.3 2 7v2h20V7c0-1.7-1.3-3-3-3" /></svg>
                      <h4 className="text-md font-bold">
                        Next 5 Days
                      </h4>
                    </div>

                    <button
                      onClick={() => setShowDailyDetails(!showDailyDetails)}
                      className="pr-4 text-blue-500 hover:text-blue-700"
                    >
                      {showDailyDetails ? "Hide Details" : "Show Details"}
                    </button>

                  </div>
                  {filteredForecast.length > 0 ? (
                    <div className="flex flex-col h-full pl-4">
                      {filteredForecast.map((data, index) => {
                        const date = new Date(data.dt_txt);
                        const day = date.toLocaleDateString("en-US", { weekday: "long" });
                        return (
                          <div
                            key={index}
                            className="flex flex-row justify-between items-center bg-transparent flex-grow"
                          >
                            <h5 className="text-sm w-[25%] font-bold">{day}</h5>
                            <div className="w-[20%]">
                              <img
                                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                                alt="icon"
                                className="w-10 h-10"
                              />
                            </div>
                            <h5 className="text-xs w-[25%] font-semibold capitalize">
                              {data.weather[0].description}
                            </h5>
                            <h5 className="text-xs w-[40%] text-center font-bold">
                              {getTemperatureWithoutConversion(data.main.temp_max)} / {getTemperatureWithoutConversion(data.main.temp_min)}
                            </h5>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      Fetching Data!! Please wait...
                    </div>
                  )}
                </div>

                {/* Map Section */}
                <div className={`hidden lg:flex items-center w-full h-full lg:w-[60%]  ${currentTheme === 'dark' ? 'mainCardBg' : ''} rounded-xl z-10`}>
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

        </div>
      </div >

      {/* Additional Details */}
      <div className={`px-3 flex flex-col mt-0 gap-4 lg:gap-2 ${currentTheme === "dark"
        ? "bg-black text-white"
        : "bg-gray-300 text-black"
        }`}>
        {/* Hourly Forecast Details */}
        {showHourlyDetails && (
          <div className={`w-full ${currentTheme === "dark" ? "mainCardBg" : "bg-gray-100"} rounded-xl p-4`}>
            <h3 className="text-lg font-bold mb-4">Detailed Hourly Temperature Forecast</h3>
            {console.log(hourlyForecast)}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dt_txt" tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="main.temp" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Forecast Details */}
        {showDailyDetails && (
          // <div className={`w-full ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-xl p-4`}>
          //   <h3 className="text-lg font-bold mb-4">5-Day Forecast Details</h3>
          //   {filteredForecast.map((data, index) => (
          //     <div key={index} className="mb-4 p-2 bg-gray-700 rounded-lg">
          //       <h4 className="font-bold">{new Date(data.dt_txt).toLocaleDateString()}</h4>
          //       <p>Temperature: {getTemperatureWithoutConversion(data.main.temp)}</p>
          //       <p>Humidity: {data.main.humidity}%</p>
          //       <p>Wind Speed: {data.wind.speed} m/s</p>
          //       <p>Description: {data.weather[0].description}</p>
          //     </div>
          //   ))}
          // </div>
          <div className={`w-full ${currentTheme === "dark" ? "mainCardBg" : "bg-gray-100"} rounded-xl p-6 shadow-lg`}>
            <h3 className="text-2xl font-bold mb-6 text-start">5-Day Forecast Details</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredForecast.map((data, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme === "dark" ? "#2d3748" : "#e2e8f0"}, ${currentTheme === "dark" ? "#1a202c" : "#cbd5e0"
                      })`,
                  }}
                >
                  <h4 className="font-bold text-lg mb-3">{new Date(data.dt_txt).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Thermometer className="w-5 h-5 mr-2 text-red-500" />
                      <span>Temperature: {getTemperatureWithoutConversion(data.main.temp)}</span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="w-5 h-5 mr-2 text-blue-500" />
                      <span>Humidity: {data.main.humidity}%</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="w-5 h-5 mr-2 text-green-500" />
                      <span>Wind Speed: {data.wind.speed} m/s</span>
                    </div>
                    <div className="flex items-center">
                      <Cloud className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="capitalize">{data.weather[0].description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Air Quality Info */}
        {/* <div className={`w-full ${currentTheme === "dark" ? "bg-gray-800" : "bg-gray-100"} rounded-xl p-4`}>
          <h3 className="text-lg font-bold mb-4">Air Quality Information</h3>
          <p>Air Quality Index: Good</p>
          <p>PM2.5: 10 µg/m³</p>
          <p>Ozone: 30 ppb</p>
        </div> */}


        <div style={containerStyle}>
          <h3 style={titleStyle}>Air Quality Information</h3>
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div style={cardStyle}>
              <div style={metricTitleStyle}>
                <span>Air Quality Index</span>
                <Wind size={36} color="#3182ce" />
              </div>
              <div style={metricValueStyle}>Good</div>
              <p style={metricDescStyle}>Healthy air quality</p>
            </div>
            <div style={cardStyle}>
              <div style={metricTitleStyle}>
                <span>PM2.5</span>
                <Droplets size={36} color="#6b46c1" />
              </div>
              <div style={metricValueStyle}>10 µg/m³</div>
              <p style={metricDescStyle}>Fine particulate matter</p>
            </div>
            <div style={cardStyle}>
              <div style={metricTitleStyle}>
                <span>Ozone</span>
                <Sun size={36} color="#d69e2e" />
              </div>
              <div style={metricValueStyle}>30 ppb</div>
              <p style={metricDescStyle}>Ground-level ozone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;