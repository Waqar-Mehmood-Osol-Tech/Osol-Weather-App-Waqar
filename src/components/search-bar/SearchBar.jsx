import React, { useState } from 'react';
import { Icon } from 'react-icons-kit';
import { search } from 'react-icons-kit/icomoon/search';
import axios from 'axios';
import { hostName, appId } from '../../config/config'; // Import your API config

const SearchBar = ({ currentTheme, onCitySelect }) => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use the same hostname and API key from your config file
  const GEO_API_URL = `${hostName}/geo/1.0/direct`;

  // Function to fetch city suggestions
  const fetchCitySuggestions = async (query) => {
    if (query.trim().length < 3) {
      setSuggestions([]); // No suggestions if the query is too short
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(GEO_API_URL, {
        params: {
          q: query,
          limit: 5, // Limit the number of suggestions
          appid: appId, // Use your appId from the config file
        },
      });

      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle city search form submission
  const handleCitySearch = (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    onCitySelect(city); // Pass the city to App.jsx
    setCity('');
    setSuggestions([]); // Clear suggestions after submitting
  };

  return (
    <div className={`search-bar rounded-full ${currentTheme === 'dark' ? 'bg-[#303136]' : 'bg-white border-2'}`}>
      <form className="flex items-center bg-transparent rounded-full h-8" autoComplete="off" onSubmit={handleCitySearch}>
        <label className="flex items-center justify-center text-gray-500 ml-4 mb-1">
          <Icon icon={search} size={20} />
        </label>
        <input
          type="text"
          className="flex-grow px-4 text-xs h-full outline-none bg-transparent"
          placeholder="Search City"
          required
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchCitySuggestions(e.target.value); // Fetch suggestions as user types
          }}
        />
        <button type="submit" className="bg-transparent text-gray-500 rounded-full h-full w-20 ">
          GO
        </button>
      </form>

      {/* Render suggestions */}
      {loading ? (
        <div className="mt-2">Loading...</div>
      ) : (
        suggestions.length > 0 && (
          <ul className="mt-2 bg-black shadow-lg rounded-lg absolute z-50 w-full max-h-40 overflow-auto">
            {suggestions.map((suggestion) => (
              <li
                key={`${suggestion.lat}-${suggestion.lon}`}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  setCity(suggestion.name);
                  setSuggestions([]);
                  onCitySelect(suggestion.name); // Select a suggestion and pass to App.jsx
                }}
              >
                {suggestion.name}, {suggestion.country}
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
};

export default SearchBar;
