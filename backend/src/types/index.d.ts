export interface UserPayload {
  username: string;
  email: string;
  role: 'host' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
