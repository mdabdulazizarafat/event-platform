export interface UserPayload {
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'USER';
  mobile?: string;
  org?: string;
  status?: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
      resolvedEventId?: number;
    }
  }
}
