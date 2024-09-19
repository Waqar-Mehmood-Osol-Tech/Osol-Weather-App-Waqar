// weatherSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { appId, hostName } from "../../config/config";

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

export const getMainCitySuggestions = createAsyncThunk(
  "weather/getMainCitySuggestions",
  async (query) => {
    try {
      const response = await axios.get(`${hostName}/geo/1.0/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: appId,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const getModalCitySuggestions = createAsyncThunk(
  "weather/getModalCitySuggestions",
  async (query) => {
    try {
      const response = await axios.get(`${hostName}/geo/1.0/direct`, {
        params: {
          q: query,
          limit: 5,
          appid: appId,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

export const addCityToFavorites = createAsyncThunk(
  "weather/addCityToFavorites",
  async (city, { getState, dispatch }) => {
    const state = getState();
    const existingCity = state.weather.selectedCities.find(
      (c) => c.city.toLowerCase() === city.city.toLowerCase()
    );

    if (existingCity) {
      return { error: "City already exists in favorites" };
    }

    if (state.weather.selectedCities.length >= 3) {
      return { error: "You can't add more than 3 cities" };
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
    mainCityLoading: false,
    mainCityData: null,
    citySearchLoading: false,
    citySearchData: null,
    forecastLoading: false,
    forecastData: null,
    forecastError: null,
    selectedCities: loadSelectedCities(),
    mainCitySuggestions: [],
    modalCitySuggestions: [],
    notificationMessage: "",
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
    setNotificationMessage: (state, action) => {
      state.notificationMessage = action.payload;
    },
    clearNotificationMessage: (state) => {
      state.notificationMessage = "";
    },
    clearMainCitySuggestions: (state) => {
      state.mainCitySuggestions = [];
    },
    clearModalCitySuggestions: (state) => {
      state.modalCitySuggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(getMainCitySuggestions.fulfilled, (state, action) => {
        state.mainCitySuggestions = action.payload;
      })
      .addCase(getModalCitySuggestions.fulfilled, (state, action) => {
        state.modalCitySuggestions = action.payload;
      })
      .addCase(addCityToFavorites.fulfilled, (state, action) => {
        if (action.payload.error) {
          state.notificationMessage = action.payload.error;
        } else {
          state.selectedCities.push(action.payload);
          localStorage.setItem(
            "selectedCities",
            JSON.stringify(state.selectedCities)
          );
          state.notificationMessage = "City added successfully!";
        }
      });
  },
});

export const {
  removeCity,
  setNotificationMessage,
  clearNotificationMessage,
  clearMainCitySuggestions,
  clearModalCitySuggestions
} = weatherSlice.actions;

export default weatherSlice.reducer;