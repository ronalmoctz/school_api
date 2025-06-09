import { Router } from 'express';
import { registerController, loginController } from '@/controllers/authController';

const router = Router();

// POST /api/users/register
// Crea un nuevo usuario (roles permitidos: 'admin', 'teacher', 'student', 'tutor_parent').
router.post('/register', registerController);

// POST /api/users/login
// Hace login de un usuario con rol 'admin' o 'teacher', devuelve { accessToken, refreshToken }.
router.post('/login', loginController);

export default router;
