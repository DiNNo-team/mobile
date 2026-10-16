// Tests run without .env: a fixed backend origin keeps src/config/env.ts from stopping the run.
process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
