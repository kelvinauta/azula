import Redis from 'ioredis';
import Rules from 'tuki_rules';

class RedisHelper {
  constructor() {
    this.redis = null;
    this.rules = new Rules("REDIS_HELPER").build();
  }

  async connect() {
    if (!this.redis) {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
      const password = process.REDIS_PASSWORD || null;
      const db = parseInt(process.env.REDIS_DB, 10) || 0;
      
      const rules = this.rules(".connect")
      rules(
        ['Redis host is not defined', !host],
        ['Redis port is not valid', isNaN(port)],
        ['Redis database is not valid', isNaN(db)],
        ['Redis host must be a string', typeof host !== 'string'],
        ['Redis port must be a number', typeof port !== 'number'],
        ['Redis database must be a number', typeof db !== 'number']
      );
      
      this.redis = new Redis({
        host: host,
        port: port,
        password: password,
        db: db,
      });

      this.redis.on('error', (err) => {
        console.error('Redis connection error:', err);
      });
    }

    return this.redis;
  }

  async set(key, value) {
    const rules = this.rules(".set")
    rules(
      ['Key is required', !key],
      ['Value is required', value === undefined],
      ['Key must be a string', typeof key !== 'string'],
      ['Value must be a string or number', typeof value !== 'string' && typeof value !== 'number']
    );
    const client = await this.connect();
    await client.set(key, value);
  }

  async get(key) {
      const rules = this.rules(".get")
    rules(
      ['Key is required', !key],
      ['Key must be a string', typeof key !== 'string']
    );
    const client = await this.connect();
    const value = await client.get(key);
    return value;
  }

  async delete(key) {
    const rules = this.rules(".delete")
    rules(
      ['Key is required', !key],
      ['Key must be a string', typeof key !== 'string']
    );
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

const redisHelperInstance = new RedisHelper();

export default redisHelperInstance;
