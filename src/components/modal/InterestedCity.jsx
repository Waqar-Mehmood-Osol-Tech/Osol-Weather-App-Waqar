import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CityModal = ({ isModalOpen, setIsModalOpen, handleAddCity }) => {
  const [cityInput, setCityInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch city suggestions
  const fetchCitySuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`https://api.example.com/cities`, { // Replace with your API endpoint
        params: { q: query }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitySuggestions(searchInput);
  }, [searchInput]);

  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return; // Prevent search if input is empty

    handleAddCity(searchInput); // Update city state and handle addition
    setSuggestions([]); // Clear suggestions
    setSearchInput(''); // Clear input field
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  return (
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
          <form onSubmit={handleCitySearch} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search city"
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {loading && <p>Loading...</p>}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-full max-h-60 overflow-auto shadow-lg">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id} // Assuming each suggestion has a unique id
                    className="p-2 cursor-pointer hover:bg-gray-200"
                    onClick={() => {
                      setCityInput(suggestion.name); // Update city input with selected suggestion
                      setSuggestions([]); // Clear suggestions
                    }}
                  >
                    {suggestion.name}
                  </li>
                ))}
              </ul>
            )}
          </form>
          <button
            onClick={() => handleAddCity(cityInput)}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50"
          >
            Add City
          </button>
        </div>
      </div>
  );
};

export default CityModal;
