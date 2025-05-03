import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";

export interface ThemeState {
  darkMode: boolean;
}

const darkMode: boolean = localStorage.getItem("darkMode") == "true";
const initialState: ThemeState = { darkMode };

if (darkMode) window.document.documentElement.classList.add("dark");

const setLocalStorage = (useDarkMode: boolean) => {
  localStorage.setItem("darkMode", useDarkMode.toString());
};

const clearLocalStorage = () => {
  localStorage.removeItem("darkMode");
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    useDarkMode: (state: ThemeState) => {
      setLocalStorage(true);
      state.darkMode = true;
      window.document.documentElement.classList.add("dark");
    },
    useLightMode: (state: ThemeState) => {
      clearLocalStorage();
      state.darkMode = false;
      window.document.documentElement.classList.remove("dark");
    },
    toggleMode: (state: ThemeState) => {
      state.darkMode = !state.darkMode;
      setLocalStorage(state.darkMode);
      if (state.darkMode) window.document.documentElement.classList.add("dark");
      else window.document.documentElement.classList.remove("dark");
    },
  },
});

export const { useDarkMode, useLightMode, toggleMode } = themeSlice.actions;
export const selectDarkMode = (state: RootState) => state.theme.darkMode;
export default themeSlice.reducer;
