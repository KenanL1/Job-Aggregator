import { combineReducers } from "redux";
import PreviewReducer from "./previewSlice";
import ThemeReducer from "./themeSlice";
import JobReducer from "./jobSlice";

const reducers = combineReducers({
  preview: PreviewReducer,
  theme: ThemeReducer,
  jobs: JobReducer,
});

export default reducers;
