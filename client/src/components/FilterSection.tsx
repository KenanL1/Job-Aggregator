import React from "react";

const FilterSection = React.memo(
  React.forwardRef<HTMLDivElement>((_, ref) => {
    return (
      <div className="filter-section" ref={ref}>
        <strong>Filter by Site:</strong>
        <br />
        <label>
          <input type="checkbox" name="site_name" value="indeed" />
          Indeed
        </label>
        <label>
          <input type="checkbox" name="site_name" value="linkedin" /> LinkedIn
        </label>
        <label>
          <input type="checkbox" name="site_name" value="zip_recruiter" />
          ZipRecruiter
        </label>
        <label>
          <input type="checkbox" name="site_name" value="glassdoor" /> Glassdoor
        </label>
        <label>
          <input type="checkbox" name="site_name" value="google" /> Google
        </label>
      </div>
    );
  })
);

export default FilterSection;
