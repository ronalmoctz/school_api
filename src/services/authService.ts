import { parse, pipe, object, string, minLength, maxLength } from 'valibot'
import type { CreateUser, User } from '@/interfaces/usersInterface'
import { createUserSchema } from '@/schemas/userSchema'
import { AuthRepository } from '@/repositories/auth/authRepo'
import { logger } from '@/helpers/logger'

/**
 * Define a runtime schema for login payload validation:
 *- identifier: puede ser user_name o email (cualquier string entre 1 y 100 caracteres)
 *- password: string entre 8 y 100 caracteres
 */

const loginSchema = object({
    identifier: pipe(string(), minLength(1), maxLength(100)),
    password: pipe(string(), minLength(8), maxLength(20)),
})

/**
 * AuthService: capa de negocio para registro y login de usuarios.
 * - Valida payloads usando Valibot antes de delegar en el repositorio.
 * - Maneja posibles errores de validación o de repositorio.
 */

export class AuthService {
    /**
     * Register new user
     * @param payload - Raw data recib (body)
     * @return Promise<User> - User don have password
     * @throws Error if fail the validation via Valibot or respository show any error
     */
    static async registerUser(payload: unknown): Promise<User> {
        try {
            // Validated the payload according to createUSerSchema
            const validatedUser = parse(createUserSchema, payload) as CreateUser;

            // Call to respository for create a new user in Db
            const newUser = await AuthRepository.registerUser(validatedUser)

            logger.info(`AuthService: user success register -> ${newUser.user_name}`)
            return newUser
        } catch (error) {
            //If a one Valibot validation error, parse(), show a detail exception
            if (error instanceof Error && error.message.includes('valibot')) {
                logger.warn('AuthService.registerUser: Validation Error', { error: error.message })
                throw new Error(`Payload not valid: ${error.message}`)
            }

            // Anyware other error (for example, respository error)
            logger.error('AuthService.registerUser: Error in the respository or unexpect', {
                error: error instanceof Error ? error.message : error
            })
            throw error
        }
    }

    /**
     * Relice the login to the user with role 'admin' or 'teacher'
     * @param payload - Object with contain `identifier`
     * @returns Promise<{ accessToken: string; refreshToken: string }> - Ambos tokens firmados.
     * @throws Error si falla la validación de payload o el repositorio arroja un error (credenciales inválidas, usuario no activo, etc.).
     */

    static async loginUser(payload: unknown): Promise<{
        accessToken: string;
        refreshToken: string
    }> {
        try {
            // Validate the payload according to loginSchema
            const { identifier, password } = parse(loginSchema, payload) as {
                identifier: string,
                password: string
            }

            // Call the repository for obtain token
            const tokens = await AuthRepository.loginUser(identifier, password)

            logger.info(`AuthService: user loging success -> ${identifier}`)
            return tokens
        } catch (error) {
            if (error instanceof Error && error.message.includes('valibot')) {
                logger.warn('AuthService.loginUser: Error de validación', { error: error.message });
                throw new Error(`Payload inválido: ${error.message}`);
            }
            logger.error('AuthService.loginUser: Error en el proceso de login', {
                error: error instanceof Error ? error.message : error,
            });
            throw error;
        }
    }

}