import axios from "axios";
import { Job, JobFilters } from "../types";

const API_URL = import.meta.env.JOBS_API_URL || "http://localhost:5000";

export const fetchJobs = async (filters: JobFilters): Promise<Job[]> => {
  try {
    const res = await axios.get(`${API_URL}/api/jobs`, { params: filters });
    console.log(`data retreieved ${filters.site_names}`);
    return res.data;
    // return [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const triggerJobFeed = (filters: JobFilters) => {
  try {
    axios.post(`${API_URL}/api/scheduler/start`, {
      body: filters,
    });
    // console.log(res.data);
  } catch (error) {
    console.error("Error starting scheduler", error);
    throw error;
  }
};
