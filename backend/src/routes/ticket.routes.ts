import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Endpoints secured by authMiddleware
router.get('/my-registrations', authMiddleware, TicketController.myRegistrations);
router.post('/verify', authMiddleware, TicketController.verifyScan);
router.post('/sync-offline', authMiddleware, TicketController.syncOffline);
router.post('/:id/resend', authMiddleware, TicketController.resendTicket);
router.post('/:id/cancel', authMiddleware, TicketController.cancelTicket);

export default router;
