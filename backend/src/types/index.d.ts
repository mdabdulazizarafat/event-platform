export interface UserPayload {
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'PARTICIPANT';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      resolvedEventId?: number;
    }
  }
}
