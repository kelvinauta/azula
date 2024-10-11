import Redis from 'ioredis';

class RedisHelper {
  constructor() {
    this.redis = null;
  }

  async connect() {
    if (!this.redis) {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
      const password = process.env.REDIS_PASSWORD || null; // Sending null is the default behavior of ioredis
      const db = parseInt(process.env.REDIS_DB, 10) || 0; // 0 is default start for most Redis db's

      this.redis = new Redis({
        host: host,
        port: port,
        password: password,
        db: db,
      });

      //TODO: Add error handling
      this.redis.on('error', (err) => {
        console.error('Redis connection error:', err);
      });
    }

    return this.redis;
  }

  async set(key, value) {
    const client = await this.connect();
    await client.set(key, value);
  }

  async get(key) {
    const client = await this.connect();
    const value = await client.get(key);
    return value;
  }

  async delete(key) {
    const client = await this.connect();
    await client.del(key);
  }

  async close() {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}

const redisHelperInstance =  new RedisHelper()

export default redisHelperInstance;
