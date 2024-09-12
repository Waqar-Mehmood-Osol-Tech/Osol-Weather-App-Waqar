// weatherSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { appId, hostName } from "../../config/config";

// Get city data for main card (primary display)
export const getMainCityData = createAsyncThunk(
  "weather/getMainCityData",
  async (obj) => {
    try {
      const request = await axios.get(
        `${hostName}/data/2.5/weather?q=${obj.city}&units=${obj.unit}&APPID=${appId}`
      );
      const response = await request.data;
      return { city: obj.city, data: response, error: null };
    } catch (error) {
      return { city: obj.city, data: null, error: error.response.data.message };
    }
  }
);

// Get city data for selected/favorite cities
export const getCityData = createAsyncThunk(
  "weather/getCityData",
  async (obj) => {
    try {
      const request = await axios.get(
        `${hostName}/data/2.5/weather?q=${obj.city}&units=${obj.unit}&APPID=${appId}`
      );
      const response = await request.data;
      return { city: obj.city, data: response, error: null };
    } catch (error) {
      return { city: obj.city, data: null, error: error.response.data.message };
    }
  }
);

// Get 5-day forecast for the provided city
export const get5DaysForecast = createAsyncThunk(
  "weather/get5DaysForecast",
  async (obj) => {
    try {
      const request = await axios.get(
        `${hostName}/data/2.5/forecast?lat=${obj.lat}&lon=${obj.lon}&units=${obj.unit}&APPID=${appId}`
      );
      const response = await request.data;
      return response;
    } catch (error) {
      return { data: null, error: error.response.data.message };
    }
  }
);

// Add a city to selected/favorite cities
export const addCityToFavorites = createAsyncThunk(
  "weather/addCityToFavorites",
  async (city, { getState, dispatch }) => {
    const state = getState();
    const existingCity = state.weather.selectedCities.find(
      (c) => c.city === city.city
    );

    if (existingCity) {
      return existingCity; // City already exists in favorites
    }

    // Check if the limit of 3 cities is reached
    if (state.weather.selectedCities.length >= 3) {
      return null; // Limit reached
    }

    const response = await dispatch(getCityData(city)).unwrap();
    return response;
  }
);

const loadSelectedCities = () => {
  const storedCities = localStorage.getItem("selectedCities");
  return storedCities ? JSON.parse(storedCities) : [];
};

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    mainCityLoading: false, // loading state for main city
    mainCityData: null, // separate state for main card city
    citySearchLoading: false,
    citySearchData: null,
    forecastLoading: false,
    forecastData: null,
    forecastError: null,
    selectedCities: loadSelectedCities(),
  },
  reducers: {
    removeCity: (state, action) => {
      state.selectedCities = state.selectedCities.filter(
        (city) => city.city !== action.payload
      );
      localStorage.setItem(
        "selectedCities",
        JSON.stringify(state.selectedCities)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Handling main city data
      .addCase(getMainCityData.pending, (state) => {
        state.mainCityLoading = true;
      })
      .addCase(getMainCityData.fulfilled, (state, action) => {
        state.mainCityLoading = false;
        state.mainCityData = action.payload;
      })
      .addCase(getMainCityData.rejected, (state) => {
        state.mainCityLoading = false;
      })

      // Handling selected cities data
      .addCase(getCityData.pending, (state) => {
        state.citySearchLoading = true;
      })
      .addCase(getCityData.fulfilled, (state, action) => {
        state.citySearchLoading = false;
        state.citySearchData = action.payload;
      })
      .addCase(getCityData.rejected, (state) => {
        state.citySearchLoading = false;
      })

      // 5-day forecast handling
      .addCase(get5DaysForecast.pending, (state) => {
        state.forecastLoading = true;
      })
      .addCase(get5DaysForecast.fulfilled, (state, action) => {
        state.forecastLoading = false;
        state.forecastData = action.payload;
      })
      .addCase(get5DaysForecast.rejected, (state, action) => {
        state.forecastLoading = false;
        state.forecastError = action.payload.error;
      })

      // Handling adding cities to favorites
      .addCase(addCityToFavorites.fulfilled, (state, action) => {
        if (action.payload) {
          state.selectedCities.push(action.payload);
          localStorage.setItem(
            "selectedCities",
            JSON.stringify(state.selectedCities)
          );
        }
      });
  },
});

export const { removeCity } = weatherSlice.actions;

export default weatherSlice.reducer;

