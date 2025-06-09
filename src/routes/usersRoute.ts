import pool from '@/config/neon';
import { Router } from 'express';
import { catchAsync } from '@middlewares/errorHandler'

/**
 * GET /users
 * @summary Get all users
 * @returns {Array} 200 - An array of user objects
 */

const router = Router();

router.get(
    '/',
    catchAsync(async (_req, res) => {
        const { rows: users } = await pool.query(`SELECT * FROM users`);
        return res.json({ success: true, data: users });
    })
);

export default router;

