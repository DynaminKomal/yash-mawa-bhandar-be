import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './router';
import { errorMiddleware, sendResponse } from './utility/response-utility';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';

const app: Application = express();

// Body parser
app.use(express.json({ limit: '10kb' }));

// Use cookie-parser middleware
app.use(cookieParser());

// File upload middleware
app.use(
    fileUpload({
        useTempFiles: true
    })
);

// Logger (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('tiny'));
}

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://www.yashmawabhandar.com",
    "https://yashmawabhandar.com",
    "https://admin-yash-mawa-bhandar.com",
    "https://www.admin-yash-mawa-bhandar.com",
    "http://admin-yash-mawa-bhandar.com",
    "http://www.admin-yash-mawa-bhandar.com"
];

// Enable CORS
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const cleanOrigin = origin.replace(/\/$/, "");
            if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            console.warn(`CORS blocked request from origin: ${origin}`);
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        optionsSuccessStatus: 200
    })
);

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.API_KEY as string,
    api_secret: process.env.API_SECRET as string,
});


// Routes
app.use('/api', router);

// Handle undefined routes
app.use((req: Request, res: Response) => {
    sendResponse(res, 404, 'fail', `Can't find ${req.originalUrl} on this server!`);
});

app.use(errorMiddleware);

export default app;