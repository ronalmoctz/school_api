// src/controllers/authController.ts

import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { catchAsync } from '@/middlewares/errorHandler';

/**
 * Controller para registrar un nuevo usuario.
 * - Recibe en `req.body` las propiedades definidas en `CreateUser` (user_name, password, email, is_active, role).
 * - Llama a AuthService.registerUser() y responde con status 201 y el usuario creado (sin contraseña).
 * - En caso de error, delega a errorHandler a través de catchAsync.
 */
export const registerController = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Llama al servicio que valida payload y crea el usuario
        const newUser = await AuthService.registerUser(req.body);

        // Responde con 201 Created y el usuario (sin field "password")
        return res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: newUser,
        });
    }
);

/**
 * Controller para loguear a un usuario con rol 'admin' o 'teacher'.
 * - Recibe en `req.body` los campos { identifier, password }.
 * - Llama a AuthService.loginUser() y responde con status 200 y los tokens generados.
 * - En caso de error, delega a errorHandler a través de catchAsync.
 */
export const loginController = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Llama al servicio que valida payload, verifica credenciales y devuelve tokens
        const { accessToken, refreshToken } = await AuthService.loginUser(req.body);

        // Responde con 200 OK y los tokens
        return res.status(200).json({
            message: 'Login exitoso',
            tokens: {
                accessToken,
                refreshToken,
            },
        });
    }
);
