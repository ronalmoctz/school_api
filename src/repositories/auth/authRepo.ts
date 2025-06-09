import pool from '@config/neon';
import type { PoolClient } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';
import type { User } from '@/interfaces/usersInterface';
import {
    signAccessToken,
    signRefreshToken,
    type AccessTokenPayload,
    type RefreshTokenPayload
} from '@/utils/jwt';
import { logger } from '@/helpers/logger';

/**
 * Allowed roles for authentication
 */
const ALLOWED_LOGIN_ROLES = ['admin', 'teacher'] as const;

// Interface for user creation (you might need to adjust based on your actual interface)
interface CreateUser {
    user_name: string;
    email: string;
    password: string;
    is_active?: boolean;
    role: string;
}

export class AuthRepository {
    /**
     * Logs in a user with 'admin' or 'teacher' role.
     * Verifies user_name or email, compares password and generates tokens.
     *
     * @param identifier - Can be user_name or email
     * @param plainPassword - Password in plain text
     * @returns Promise<{ accessToken: string; refreshToken: string }>
     * @throws Error if user doesn't exist, role not allowed, invalid password, etc.
     */
    static async loginUser(
        identifier: string,
        plainPassword: string
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const client: PoolClient = await pool.connect();
        try {
            const loginQuery = `
                SELECT
                    id AS uuid,
                    user_name,
                    password,
                    role,
                    is_active
                FROM users
                WHERE (user_name = $1 OR email = $1)
                AND role::text = ANY($2)
                AND is_active = TRUE
                LIMIT 1
            `;

            // Execute query and map result to Pick<User, ...>
            const { rows } = await client.query<
                Pick<User, 'uuid' | 'user_name' | 'password' | 'role' | 'is_active'>
            >(loginQuery, [identifier, ALLOWED_LOGIN_ROLES]);

            // If no record found, credentials are invalid or user not allowed/inactive
            if (rows.length === 0) {
                throw new Error('Credentials invalid or user not allowed to login');
            }

            const userRecord = rows[0];

            // Verify user is actually active (just in case)
            if (!userRecord.is_active) {
                throw new Error('User is not active');
            }

            // Compare plain text password with stored hash
            const isPasswordMatch = await bcrypt.compare(plainPassword, userRecord.password);
            if (!isPasswordMatch) {
                throw new Error('Credentials invalid, password does not match');
            }

            // Generate JWT payloads: AccessToken and RefreshToken
            const accessPayload: AccessTokenPayload = {
                sub: userRecord.uuid,               // using "uuid" alias here
                user_name: userRecord.user_name,
                role: userRecord.role as typeof ALLOWED_LOGIN_ROLES[number]
            };

            const refreshPayload: RefreshTokenPayload = {
                sub: userRecord.uuid
            };

            const [accessToken, refreshToken] = await Promise.all([
                signAccessToken(accessPayload),
                signRefreshToken(refreshPayload)
            ]);

            return { accessToken, refreshToken };
        } catch (error) {
            logger.error('Error on AuthRepository.loginUser', {
                error: error instanceof Error ? error.message : error
            });
            throw new Error('Error in login');
        } finally {
            client.release();
        }
    }

    /**
     * Registers a new user in the database
     * @param createUserDto - Object with user data
     * @returns Promise with created user data
     * 
     * @throws Error if user already exists or database operation fails
     */
    static async registerUser(createUserDto: CreateUser): Promise<User> {
        const client: PoolClient = await pool.connect();
        try {
            const { user_name, email, password, is_active = true, role } = createUserDto;

            // Check if user already exists
            const checkQuery = `
                SELECT id FROM users 
                WHERE user_name = $1 OR email = $2 
                LIMIT 1
            `;

            const { rows: existingRows } = await client.query<{ id: string }>(
                checkQuery,
                [user_name, email]
            );

            if (existingRows.length > 0) {
                throw new Error('User already exists with this username or email');
            }

            // Hash the password
            const SALT_ROUNDS = 12;
            const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

            // Insert new user into the database
            const insertQuery = `
                INSERT INTO users (
                    user_name, password, email, is_active, role, created_at
                ) 
                VALUES ($1, $2, $3, $4, $5, NOW()) 
                RETURNING id, user_name, email, is_active, role, created_at
            `;

            const { rows } = await client.query<User>(insertQuery, [
                user_name,
                hashedPassword,
                email,
                is_active,
                role
            ]);

            if (rows.length === 0) {
                throw new Error('Failed to create user');
            }

            logger.info(`User ${user_name} created successfully`);
            const createdUser = rows[0];
            return createdUser;

        } catch (error) {
            logger.error(`Error creating user: ${error instanceof Error ? error.message : 'Error on repository user creation'}`);
            throw new Error('Failed to create user');
        } finally {
            client.release();
        }
    }
}