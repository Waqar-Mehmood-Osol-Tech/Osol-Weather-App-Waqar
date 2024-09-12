import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./Slices/WeatherSlice";
import themeReducer from "./Slices/ThemeSlice"; // Import the theme reducer

const store = configureStore({
  reducer: {
    weather: weatherReducer,
    theme: themeReducer, // Add the theme reducer
  },
});

export default store;
