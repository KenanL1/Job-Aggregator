import React, { useRef, useState } from "react";
import { JobFilters } from "../types";
import FilterSection from "../components/FilterSection";
import SearchResult from "../components/SearchResults";
import { triggerJobFeed } from "../api/jobs";

const Main: React.FC = () => {
  const [filters, setFilters] = useState<JobFilters>({
    keywords: "software developer",
    exclude: "",
    location: "toronto, ON",
    posted_within: "1",
    site_names: ["indeed"],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selected_sites = Array.from(
      site_names.current?.querySelectorAll('input[type="checkbox"]') || []
    )
      .filter((checkbox) => (checkbox as HTMLInputElement).checked)
      .map((checkbox) => (checkbox as HTMLInputElement).value);
    const updatedFilters: JobFilters = {
      keywords: keywords.current?.value || "software developer",
      exclude: exclude.current?.value || "",
      location: location.current?.value || "toronto, ON",
      posted_within: posted_within.current?.value || "1",
      site_names: selected_sites || ["indeed"],
    };

    try {
      setFilters(updatedFilters);
      triggerJobFeed(updatedFilters);
    } catch (err) {
      console.log("Error fetching jobs", err);
    }
  };

  const keywords = useRef<HTMLInputElement>(null);
  const exclude = useRef<HTMLInputElement>(null);
  const location = useRef<HTMLInputElement>(null);
  const posted_within = useRef<HTMLSelectElement>(null);
  const site_names = useRef<HTMLDivElement>(null);

  return (
    <div className="container p-4">
      <h1 className="text-3xl font-bold mb-4">Job Aggregator</h1>
      <form onSubmit={handleSubmit} id="jobForm" className="mb-6">
        <div className="flex gap-4">
          <div>
            <label htmlFor="keyword">Keywords:</label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              placeholder="e.g., Software Developer"
              ref={keywords}
            />
          </div>
          <div>
            <label htmlFor="exclude">Exclude:</label>
            <input
              type="text"
              id="exclude"
              name="exclude"
              placeholder="e.g., Software Developer"
              ref={exclude}
            />
          </div>
        </div>
        <div>
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            ref={location}
            placeholder="e.g., New York"
          />
        </div>
        <div>
          <label htmlFor="posted_within">Posted Within:</label>
          <select id="posted_within" name="posted_within" ref={posted_within}>
            <option value="0.25">Last 1 hours</option>
            <option value="1">Last 24 hours</option>
            <option value="2">Last 2 days</option>
            <option value="3">Last 3 days</option>

            <option value="7">Last week</option>
            <option value="30">Last month</option>
          </select>
        </div>

        <FilterSection ref={site_names} />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Search Jobs
        </button>
      </form>

      <SearchResult filters={filters} />
    </div>
  );
};

export default Main;
