import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import router from './router';
import { sendResponse } from './utility/response-utility';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';

const app: Application = express();

// Use cookie-parser middleware
app.use(cookieParser());

// File upload middleware
app.use(
    fileUpload({
        useTempFiles: true,
    })
);

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.API_KEY as string,
    api_secret: process.env.API_SECRET as string,
});

// Body parser
app.use(express.json({ limit: '10kb' }));

// Logger (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
}

// Enable CORS
app.use(
    cors({
        origin: '*',
    })
);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Routes
app.use('/api', router);

// Handle undefined routes
app.use((req: Request, res: Response) => {
    sendResponse(res, 404, 'fail', `Can't find ${req.originalUrl} on this server!`);
});

export default app;