import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Endpoint secured by authMiddleware
router.post('/verify', authMiddleware, TicketController.verifyScan);

export default router;
