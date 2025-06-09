import jwt from 'jsonwebtoken';
import type { SignOptions, Algorithm, JwtPayload, VerifyErrors } from 'jsonwebtoken';
import { ENV } from '@/config/env';
import { logger } from '@/helpers/logger';


const validateJWTConfig = (): void => {
    const requiredEnvVars = [
        { key: 'JWT_SECRET', value: ENV.JWT_SECRET, message: 'JWT_SECRET (ACCESS_SECRET) no está definido' },
        { key: 'REFRESH_TOKEN', value: ENV.REFRESH_TOKEN, message: 'REFRESH_TOKEN (REFRESH_SECRET) no está definido' },
        { key: 'JWT_EXPIRATION', value: ENV.JWT_EXPIRATION, message: 'JWT_EXPIRATION no está definido' },
        { key: 'REFRESH_TOKEN_EXPIRATION', value: ENV.REFRESH_TOKEN_EXPIRATION, message: 'REFRESH_TOKEN_EXPIRATION no está definido' }
    ];

    for (const { key, value, message } of requiredEnvVars) {
        if (!value) {
            logger.error(`${message} en las variables de entorno`);
            throw new Error(`Falta ${key} en configuración`);
        }
    }
};


validateJWTConfig();

/**
 * Interface for JWT payload
 */
export interface AccessTokenPayload {
    sub: string; // User ID
    user_name: string; // Username
    role: 'admin' | 'teacher' | 'student' | 'tutor_parent';
    iat?: number; // Issued at
    exp?: number; // Expiration time
}

export interface RefreshTokenPayload {
    sub: string; // User ID
    iat?: number; // Issued at
    exp?: number; // Expiration time
}

// Constantes después de validación
const ACCESS_SECRET = ENV.JWT_SECRET!;
const REFRESH_SECRET = ENV.REFRESH_TOKEN!;

/**
 * Helper para validar y normalizar expiresIn
 * Maneja strings, números y valida formato de duración
 */
const normalizeExpiresIn = (value: unknown): string => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        // Validar formato: número + unidad (s, m, h, d) o solo número
        return /^\d+[smhd]?$/.test(trimmed) ? trimmed
            : (() => { throw new Error(`Formato de expiresIn inválido: ${trimmed}`); })();
    }

    if (typeof value === 'number' && value > 0) {
        return value.toString();
    }

    throw new Error(`Valor de expiresIn inválido: ${value}`);
};

/**
 * Configuración base para tokens
 */
const getBaseSignOptions = (isRefresh = false): SignOptions => ({
    algorithm: 'HS256',
    issuer: ENV.JWT_ISSUER,
    audience: ENV.JWT_AUDIENCE + (isRefresh ? '_refresh' : ''),
});

/**
 * Generate an access token signed with HS256 algorithm
 */
export function signAccessToken(
    payload: Omit<AccessTokenPayload, 'iat' | 'exp'>
): Promise<string> {
    return new Promise((resolve, reject) => {
        const options: SignOptions = {
            ...getBaseSignOptions(),
            expiresIn: normalizeExpiresIn(ENV.JWT_EXPIRATION) as any,
        };

        jwt.sign(payload, ACCESS_SECRET, options, (err: Error | null, token?: string) => {
            if (err) {
                logger.error('Error generando access token', { error: err, payload });
                return reject(err);
            }

            if (!token) {
                const error = new Error('No se pudo generar access token');
                logger.error(error.message, { payload });
                return reject(error);
            }

            logger.debug('Access token generado correctamente', { payload });
            resolve(token);
        });
    });
}

/**
 * Genera un Refresh Token firmado con HS256
 */
export function signRefreshToken(
    payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>
): Promise<string> {
    return new Promise((resolve, reject) => {
        const options: SignOptions = {
            ...getBaseSignOptions(true),
            expiresIn: normalizeExpiresIn(ENV.REFRESH_TOKEN_EXPIRATION) as any,
        };

        jwt.sign(payload, REFRESH_SECRET, options, (err: Error | null, token?: string) => {
            if (err) {
                logger.error('Error generando refresh token', { error: err, payload });
                return reject(err);
            }

            if (!token) {
                const error = new Error('No se pudo generar refresh token');
                logger.error(error.message, { payload });
                return reject(error);
            }

            logger.debug('Refresh token generado correctamente', { payload });
            resolve(token);
        });
    });
}

/**
 * Verifica y decodifica un Access Token HS256
 */
export function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    return new Promise((resolve, reject) => {
        const options = {
            algorithms: ['HS256' as Algorithm],
            issuer: ENV.JWT_ISSUER,
            audience: ENV.JWT_AUDIENCE,
        };

        jwt.verify(token, ACCESS_SECRET, options, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
            if (err) {
                logger.warn('Access token inválido o expirado', { error: err.message });
                return reject(new Error('Access token inválido o expirado'));
            }

            // decoded puede ser string o JwtPayload
            if (!decoded || typeof decoded === 'string') {
                const error = new Error('Access token con payload inválido');
                logger.warn(error.message, { decoded });
                return reject(error);
            }

            const payload = decoded as AccessTokenPayload;

            if (!payload?.sub || !payload?.user_name || !payload?.role) {
                const error = new Error('Access token con payload inválido');
                logger.warn(error.message, { payload });
                return reject(error);
            }

            logger.debug('Access token verificado correctamente', { sub: payload.sub });
            resolve(payload);
        });
    });
}

/**
 * Verifica y decodifica un Refresh Token HS256
 */
export function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return new Promise((resolve, reject) => {
        const options = {
            algorithms: ['HS256' as Algorithm],
            issuer: ENV.JWT_ISSUER,
            audience: ENV.JWT_AUDIENCE + '_refresh',
        };

        jwt.verify(token, REFRESH_SECRET, options, (err: VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
            if (err) {
                logger.warn('Refresh token inválido o expirado', { error: err.message });
                return reject(new Error('Refresh token inválido o expirado'));
            }

            if (!decoded || typeof decoded === 'string') {
                const error = new Error('Refresh token con payload inválido');
                logger.warn(error.message, { decoded });
                return reject(error);
            }

            const payload = decoded as RefreshTokenPayload;

            if (!payload?.sub) {
                const error = new Error('Refresh token con payload inválido');
                logger.warn(error.message, { payload });
                return reject(error);
            }

            logger.debug('Refresh token verificado correctamente', { sub: payload.sub });
            resolve(payload);
        });
    });
}