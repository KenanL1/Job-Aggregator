from flask import jsonify, request
from .scraper import scrape_jobs_with_jobspy, stream_new_jobs
from .config import init_cache, redis_client
from apscheduler.schedulers.background import BackgroundScheduler
from functools import partial


def register_routes(app):
    cache = init_cache(app)

    # Initialize the scheduler with the app context
    scheduler = BackgroundScheduler()

    @app.route('/api/jobs', methods=['GET'])
    def get_jobs():
        keyword = request.args.get('keyword', 'software developer')
        location = request.args.get('location', 'Toronto, ON')
        posted_within = request.args.get(
            'posted_within', '0.25')  # Default: last 1 hour
        site_names = request.args.getlist('site_names[]') or ['indeed']
        jobs = []

        # Scrape jobs based on user input
        if (site_names):
            jobs = scrape_jobs_with_jobspy(
                keyword, location, posted_within, site_names)

        # Return jobs as JSON
        return jsonify(jobs)

    @app.route('/api/scheduler/start', methods=['POST'])
    def start_scheduler():
        """Schedule event to retrieve new jobs listing every interval"""
        if scheduler.running:
            scheduler.shutdown()
        data = request.json
        # Create a partial function with the app context
        job_function = partial(stream_new_jobs, app, data)
        scheduler.add_job(func=job_function,
                          trigger="interval", seconds=600)
        scheduler.start()
        return jsonify({"message": "Scheduler started"})

    @app.route('/api/scheduler/stop', methods=['POST'])
    def stop_scheduler():
        if scheduler.running:
            scheduler.shutdown()
            return jsonify({"message": "Scheduler stopped"}), 200
        return jsonify({"message": "Scheduler is not running"}), 400
