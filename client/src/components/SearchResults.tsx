// import { useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
// import { fetchJobs } from "../api/jobs";
import { Job, JobFilters } from "../types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useEventSourceQuery from "../hooks/useEventSourceQuery";
import { useAppDispatch } from "../store";
import { openPreview } from "../store/Reducers/previewSlice";

const VISITED_JOBS_KEY = ["visitedJobs"] as const;

const SearchResult: React.FC<{
  filters: JobFilters;
  setLastUpdated: (value: string) => void;
}> = ({ filters, setLastUpdated }) => {
  const [showVisited, setShowVisited] = useState<boolean>(true);
  const selectedItem = useRef<HTMLElement>(null);
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  // Subscribe visited jobs from React Query cache
  const { data: visitedJobs = {} } = useQuery<Record<string, boolean>>({
    queryKey: VISITED_JOBS_KEY,
    initialData: {},
  });

  const {
    data: jobs = [] as Job[],
    error,
    isLoading,
  } = useEventSourceQuery(
    ["jobs", filters],
    "http://localhost:5000/stream?channel=test",
    setLastUpdated
  );

  // Filter jobs based on visited status if needed
  const filteredJobs = showVisited
    ? jobs
    : jobs.filter((job) => !visitedJobs[job.id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const showDescription = (e: React.MouseEvent<HTMLLIElement>, job: Job) => {
    selectedItem.current?.classList.remove("selected");
    e.currentTarget.classList.add("selected");
    selectedItem.current = e.currentTarget;

    // Mark as visited in React Query cache
    queryClient.setQueryData<Record<string, boolean>>(
      VISITED_JOBS_KEY,
      (old = {}) => ({
        ...old,
        [job.id]: true,
      })
    );

    dispatch(openPreview(job));

    // Open preview using custom event
    // window.dispatchEvent(new CustomEvent("preview-job", { detail: job }));
  };

  const onDoubleClickHandler = (job_url: string) => {
    window.open(job_url);
  };

  // Clear jobs lists
  const clearResults = () => {
    queryClient.setQueryData(["jobs", filters], []);
    queryClient.setQueryData(VISITED_JOBS_KEY, {});
  };

  return (
    <div className="flex flex-col grow max-w-[65%] space-y-4">
      <h2>Results:</h2>
      <div className="flex grow gap-3">
        <label className="flex items-center space-x-2">
          <input
            checked={showVisited}
            onChange={() => setShowVisited(!showVisited)}
            type="checkbox"
          />
          <span>Show visited jobs</span>
        </label>
        <button onClick={clearResults}>Clear Results</button>
      </div>
      {filteredJobs.length > 0 ? (
        <>
          <p>Total Jobs Found: {filteredJobs.length}</p>
          <ul>
            {filteredJobs.map((job, index) => (
              <li
                key={job.id}
                className={`list-none cursor-pointer p-4 border-b hover:bg-gray-500 ${
                  visitedJobs[job.id] ? "text-gray-600" : ""
                }`}
                onClick={(e) => showDescription(e, job)}
                onDoubleClick={() => onDoubleClickHandler(job.job_url)}
              >
                <strong>Job {index}: </strong> <strong>{job.title}</strong> at{" "}
                {job.company} ({job.location}) {job.date_posted}
                {visitedJobs[job.id] && <span className="ml-2">(Visited)</span>}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No jobs found.</p>
      )}
    </div>
  );
};

export default SearchResult;
