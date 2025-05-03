import redis
from flask_caching import Cache


def init_redis():
    return redis.StrictRedis(host='localhost', port=6379, db=0)


def init_cache(app):
    """config cache"""
    app.config['CACHE_TYPE'] = 'RedisCache'
    app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
    app.config["REDIS_URL"] = "redis://localhost:6379/0"

    cache = Cache(app)
    return cache


redis_client = init_redis()
