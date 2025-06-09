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
 * Roles permitidos para autenticación
 */
const ALLOWED_LOGIN_ROLES = ['admin', 'teacher'] as const;

export class AuthRepository {
    // ... registerUser permanece igual ...

    /**
     * Hace login de un usuario con role 'admin' o 'teacher'.
     * Verifica user_name o email, compara la contraseña y genera tokens.
     *
     * @param identifier - Puede ser user_name o email
     * @param plainPassword - Contraseña en texto plano
     * @returns Promise<{ accessToken: string; refreshToken: string }>
     * @throws Error si usuario no existe, rol no permitido, contraseña inválida, etc.
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

            // 2) Ejecutamos la consulta y mapeamos el resultado a Pick<User, ...>
            const { rows } = await client.query<
                Pick<User, 'uuid' | 'user_name' | 'password' | 'role' | 'is_active'>
            >(loginQuery, [identifier, ALLOWED_LOGIN_ROLES]);

            // 3) Si no encontramos ningún registro, las credenciales son inválidas o el rol/no activo
            if (rows.length === 0) {
                throw new Error('Credentials invalid or user not allowed to login');
            }

            const userRecord = rows[0];

            // 4) Verificamos que el usuario realmente esté activo (por si acaso)
            if (!userRecord.is_active) {
                throw new Error('User is not active');
            }

            // 5) Comparamos la contraseña en texto plano con el hash almacenado
            const isPasswordMatch = await bcrypt.compare(plainPassword, userRecord.password);
            if (!isPasswordMatch) {
                throw new Error('Credentials invalid, password does not match');
            }

            // 6) Generamos los payloads para JWT: AccessToken y RefreshToken
            const accessPayload: AccessTokenPayload = {
                sub: userRecord.uuid,               // aquí usamos el alias "uuid"
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
            throw new Error('Error en login');
        } finally {
            client.release();
        }
    }
}
