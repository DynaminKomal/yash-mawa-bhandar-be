
export {};

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
    }
  }
}