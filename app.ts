import express from 'express';
import cors from 'cors';
import { ENV } from '@/config/env';
import { logger } from '@/helpers/logger';
import usersRoute from '@/routes/usersRoute';
import authRoute from '@routes/authRoute'
import cookieParser from 'cookie-parser';
import { errorHandler, notFoundHandler } from '@/middlewares/errorHandler';


const app = express();

app.use(cors({}))
app.use(express.json());
app.use(cookieParser());


app.get('/', (_req, res) => {
    logger.info('Health check endpoint accessed');
    res.json({
        success: true,
        message: 'School API is working',
        timestamp: new Date().toISOString(),
    });
});
app.use('/auth', authRoute)
app.use('/api/users', usersRoute);

app.use(notFoundHandler)
app.use(errorHandler)


logger.info('Intentando iniciar el servidor...');
app.listen(ENV.SERVER_PORT, () => {
    logger.info(`Server is running on port  http://localhost:${ENV.SERVER_PORT}`);
});