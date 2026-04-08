Installation & configuration notes for Redis

1. Install dependency

cd backend
npm install ioredis

or with yarn

cd backend
yarn add ioredis

2. Environment variables (one of the options)

- Use a single URL:
  REDIS_URL=redis://:password@redis-host:6379/0

- Or use host/port/password:
  REDIS_HOST=127.0.0.1
  REDIS_PORT=6379
  REDIS_PASSWORD=yourpassword

3. Usage

- OTP: use `setOTP(contact, code, ttlSeconds)`, `getOTP(contact)`, `deleteOTP(contact)`
- JWT blacklist: use `blacklistToken(jti, ttlSeconds)` and `isTokenBlacklisted(jti)`
- Cache: use `cacheSet(key, value, ttlSeconds)`, `cacheGet(key)`, `cacheDel(key)`

4. Middleware

- A lightweight middleware `jwtBlacklistMiddleware` is provided at `backend/src/middleware/jwtBlacklist.middleware.ts`.
- Register it in your route chain near your auth middleware so revoked tokens are rejected.
