import type { Request, Response, NextFunction } from 'express';
import { logger } from '@/helpers/logger';

/**
 * ErrorHandler simplificado:
 * - Muestra el error en consola (o Winston).
 * - Envía una respuesta JSON con status (por defecto 500) y mensaje.
 */
export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    // Si ya se envió respuesta, delegamos al siguiente
    if (res.headersSent) {
        return next(err);
    }

    // Convertimos unknown a Error
    const error = err instanceof Error ? err : new Error('Unknown error occurred');

    // Logueamos completo (stack) con Winston o con console.error
    logger.error('Unhandled Error:', { message: error.message, stack: error.stack });

    // Determinamos statusCode (si el error tiene statusCode, lo usamos; sino 500)
    const statusCode = (error as any).statusCode && typeof (error as any).statusCode === 'number'
        ? (error as any).statusCode
        : 500;

    // En desarrollo, devolvemos el stack para facilitar debugging
    const responseBody: any = {
        message: error.message || 'Internal Server Error',
    };
    if (process.env.NODE_ENV !== 'production') {
        responseBody.stack = error.stack;
    }

    return res.status(statusCode).json(responseBody);
};

/**
 * NotFoundHandler simplificado: crea un Error con status 404 y lo pasa a errorHandler.
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    (error as any).statusCode = 404;
    next(error);
};

/**
 * catchAsync: envuelve rutas async para capturar excepciones con next(err).
 */
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
