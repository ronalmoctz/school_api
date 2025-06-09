import { createLogger, transports, format, addColors } from 'winston';
import { config } from 'dotenv';

config();

// Niveles personalizados
const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};
const logColors = {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
    trace: 'magenta',
};
addColors(logColors);

// Helper para formatear metadata
const formatMeta = (meta: any) => {
    if (!meta || Object.keys(meta).length === 0) return '';
    const filteredMeta = Object.keys(meta)
        .filter((key) => !['level', 'message', 'timestamp', 'label'].includes(key))
        .reduce((obj, key) => {
            obj[key] = meta[key];
            return obj;
        }, {} as any);
    if (Object.keys(filteredMeta).length === 0) return '';
    const metaEntries = Object.entries(filteredMeta)
        .map(([key, value]) => {
            if (typeof value === 'object') {
                return `${key}: ${JSON.stringify(value, null, 2)}`;
            }
            return `${key}: ${value}`;
        })
        .join(', ');
    return ` | ${metaEntries}`;
};

const logger = createLogger({
    levels: logLevels,
    level: process.env.LOG_LEVEL || 'info',
    defaultMeta: { service: 'school-api' },
    exitOnError: false,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        ...(process.env.NODE_ENV === 'development'
            ? [
                format.colorize({ all: true }),
                format.printf(({ timestamp, level, message, stack, ...meta }) => {
                    const baseMessage = `[${timestamp}] ${level}: ${message}`;
                    const metaString = formatMeta(meta);
                    if (stack) {
                        return `${baseMessage}${metaString}\n🔥 STACK TRACE:\n${stack}`;
                    }
                    return `${baseMessage}${metaString}`;
                }),
            ]
            : [format.json()])
    ),
    transports: [
        new transports.Console({
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        }),
        ...(process.env.NODE_ENV === 'production'
            ? [
                new transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    format: format.combine(format.timestamp(), format.json()),
                }),
                new transports.File({
                    filename: 'logs/combined.log',
                    format: format.json(),
                }),
            ]
            : []),
    ],
    exceptionHandlers:
        process.env.NODE_ENV === 'production'
            ? [new transports.File({ filename: 'logs/exceptions.log' })]
            : [],
    rejectionHandlers:
        process.env.NODE_ENV === 'production'
            ? [new transports.File({ filename: 'logs/rejections.log' })]
            : [],
});

export { logger };
