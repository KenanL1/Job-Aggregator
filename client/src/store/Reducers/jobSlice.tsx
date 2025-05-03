import { Job, JobFilters } from "../../types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../../api/jobs";

export interface JobState {
  jobs?: Map<string, Job>;
  loading: boolean;
}

const initialState: JobState = {
  loading: false,
};

export const fetchJobPosts = createAsyncThunk(
  "post/fetchJobPosts",
  async (filters: JobFilters, { rejectWithValue }) => {
    try {
      const { data, error } = await useQuery({
        queryKey: ["jobs", filters],
        queryFn: () => fetchJobs(filters),
        refetchInterval: 3600,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      rejectWithValue(err);
    }
  }
);

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    addJobs: (state: JobState, action: PayloadAction<Job[]>) => {
      if (!state.jobs) {
        state.jobs = new Map();
      }

      action.payload?.forEach((item) => {
        const key = `${item.title}:${item.company}`;
        if (!state.jobs?.has(key)) {
          state.jobs?.set(key, item);
        }
      });
    },
    markVisited: (state: JobState, action: PayloadAction<Job>) => {
      const key = `${action.payload.title}:${action.payload.company}`;
      const job = state.jobs?.get(key);
      if (job) job.visited = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobPosts.pending, (state: JobState) => {
        state.loading = true;
      })
      .addCase(
        fetchJobPosts.fulfilled,
        (state: JobState, action: PayloadAction<Job[] | undefined>) => {
          state.loading = false;

          action.payload?.forEach((item) => {
            const key = `${item.title}:${item.company}`;
            if (!state.jobs?.has(key)) {
              state.jobs?.set(key, item);
            }
          });
        }
      )
      .addCase(fetchJobPosts.rejected, (state: JobState) => {
        state.loading = false;
        // console.log(action.payload);
      });
  },
});

export const { addJobs, markVisited } = jobSlice.actions;
export const selectAllJobs = (state: RootState) => state.jobs.jobs;
export const selectNonVisitedJobs = (state: RootState) => {
  const jobs = state.jobs.jobs;
  if (!jobs) return undefined;
  return new Map(Object.entries(jobs).filter(([, job]) => !job.visited));
};
export default jobSlice.reducer;
