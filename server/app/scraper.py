import hashlib
import json
from jobspy import scrape_jobs
from datetime import datetime
from flask_sse import sse
from .config import redis_client

UNIQUE_JOBS_KEY = "unique_jobs"


def scrape_jobs_with_jobspy(keyword, location, posted_within, site_names):
    # Convert posted_within to days (JobSpy uses days)
    if posted_within:
        posted_within_days = float(posted_within)
    else:
        posted_within_days = 30  # Default to last 30 days

    print(posted_within_days)
    # Scrape jobs using JobSpy
    jobs = scrape_jobs(
        site_name=site_names,
        search_term=keyword,  # developer
        google_search_term=f"{keyword} jobs near {location} since yesterday",
        location=location,  # Toronto, ON
        distance=50,  # in miles
        # job_type, #fulltime, parttime, internship, contract
        results_wanted=100,  # Number of jobs to fetch
        hours_old=posted_within_days * 24,  # Convert days to hours
        include_promoted_jobs=False,  # Exclude promoted/sponsored jobs
        # fetches full description and direct job url for LinkedIn (Increases requests by O(n))
        linkedin_fetch_description=True,
        country_indeed='Canada',
    ).fillna('')
    # linkedin_fetch_description=True # gets more info such as description, direct job url (slower)
    # proxies=["208.195.175.46:65095", "208.195.175.45:65095", "localhost"],
    # print(f"Found {len(jobs)} jobs")
    # print(jobs.head())
    # jobs.to_csv("jobs.csv", quoting=csv.QUOTE_NONNUMERIC, escapechar="\\", index=False) # to_excel
    # Convert the DataFrame to a list of dictionaries
    job_list = jobs.to_dict(orient='records')

    # Add a human-readable posted date
    for job in job_list:
        job['posted_date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Remove duplicates based on a unique combination of attributes
    seen = set()
    unique_jobs = []
    for job in job_list:
        # Create a unique key based on title, company, location, and URL
        unique_key = (job.get('title'), job.get(
            'company'), job.get('location'))
        if unique_key not in seen:
            seen.add(unique_key)
            unique_jobs.append(job)

    return unique_jobs


def generate_job_id(job):
    """Generate a unique ID for a job posting by hashing key fields"""
    # Combine key fields to create a unique string
    key_string = f"{job["title"]}:{job["company"]}:{job["location"]}"
    # Create a SHA-256 hash of the key string
    return hashlib.sha256(key_string.encode('utf-8')).hexdigest()


def add_job_posting(job):
    """Add a job posting to Redis if it's not a duplication"""
    job_id = generate_job_id(job)

    # Check if job_id exists in the set
    if not redis_client.sismember(UNIQUE_JOBS_KEY, job_id):
        redis_client.sadd(UNIQUE_JOBS_KEY, job_id)
        redis_client.hset(f"job:{job_id}", mapping={
            "title": job["title"],
            "company": job["company"],
            "location": job["location"],
            "description": job["description"],
            "site": job["site"],
            "job_url": job["job_url"],
            "date_posted": job["posted_date"]
        })
        # Expiration 7 days
        redis_client.expire(f"job:{job_id}", 604800)
        return True
    return False


def get_all_jobs():
    """Retrieve all unique job postings from Redis"""
    job_ids = redis_client.smembers(UNIQUE_JOBS_KEY)
    jobs = []
    for job_id in job_ids:
        jobs.append(redis_client.hgetall(f"jobs:{job_id}"))
    return jobs


def contains_keyword(str, keywords):
    for keyword in keywords:
        if keyword in str:
            return True
    return False


def stream_new_jobs(app, data):
    """SSE stream new jobs to client"""
    with app.app_context():
        keyword = data.get('keyword') or 'Software Developer'
        exclude = data.get('exclude').split(",")
        location = data.get('location') or 'Toronto, ON'
        posted_within = data.get(
            'posted_within') or '0.25'  # Default: last 1 hour
        site_names = data.get('site_names') or ['indeed']
        jobs = []

        # Scrape jobs based on user input
        if (site_names):
            jobs = scrape_jobs_with_jobspy(
                keyword, location, posted_within, site_names)

        new_jobs = []
        excluded = 0
        for job in jobs:
            if add_job_posting(job) and (not exclude or not contains_keyword(job["title"], exclude)):
                new_jobs.append(job)
            else:
                excluded += 1

        # Return jobs as JSON
        # return jsonify(jobs)
        print(
            f"Found {len(new_jobs)} new jobs out of {len(jobs)} - Excluded jobs {excluded}")
        sse.publish(new_jobs, channel='test')
