useEffect(() => {
  // Function to get city name from IPAPI
  const fetchCityFromIP = async () => {
    try {
      const response = await axios.get('https://ipapi.co/json/');
      const cityName = response.data.city || 'Lahore';
      await fetchCoordinatesFromCity(cityName);
      
    } catch (error) {
      console.error('Error fetching city name:', error);
      await fetchCoordinatesFromCity('Lahore'); // Fallback city
    } finally {
      setLoadings(false);
    }
  };

  // Function to fetch coordinates based on city name using OpenCage
  const fetchCoordinatesFromCity = async (city) => {
    try {
      const apiKey = 'b47c307acaff417892a4666a14f675c6'; // Replace with your OpenCage API key
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}`);
      const results = response.data.results;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry;
        setPosition([lat, lng]);
      } else {
        console.error('No results found for the city');
        setPosition([0, 0]); // Fallback coordinates
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      setPosition([0, 0]); // Fallback coordinates
    }
  };

  fetchCityFromIP();
}, []);