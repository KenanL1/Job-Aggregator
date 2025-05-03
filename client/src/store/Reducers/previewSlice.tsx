import { Job } from "../../types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

export interface PreviewState {
  isPreviewOpen: boolean;
  job?: Job;
}

const initialState: PreviewState = {
  isPreviewOpen: false,
};

const previewSlice = createSlice({
  name: "preview",
  initialState,
  reducers: {
    openPreview: (state: PreviewState, action: PayloadAction<Job>) => {
      state.isPreviewOpen = true;
      state.job = action.payload;
    },
    closePreview: (state: PreviewState) => {
      state.isPreviewOpen = false;
      state.job = undefined;
    },
  },
});

export const { openPreview, closePreview } = previewSlice.actions;
export const selectIsPreviewOpen = (state: RootState) =>
  state.preview.isPreviewOpen;
export const selectJob = (state: RootState) => state.preview.job;
export default previewSlice.reducer;
