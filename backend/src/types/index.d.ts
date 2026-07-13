export interface UserPayload {
  username: string;
  email: string;
  role: 'USER' | 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'USER_ADMIN' | 'SUPPORT_ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      resolvedEventId?: number;
    }
  }
}
