import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: any;
      files?: any;
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

export type AuthRequest = express.Request;
