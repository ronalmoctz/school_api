import { config } from 'dotenv';

config();

// Load environment variables from .env file
export const ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    SERVER_PORT: process.env.SERVER_PORT,
    PGHOST: process.env.PGHOST,
    PGDATABASE: process.env.PGDATABASE,
    PGUSER: process.env.PGUSER,
    PGPASSWORD: process.env.PGPASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
}