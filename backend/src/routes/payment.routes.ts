import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Payment initiation (called by frontend before redirecting to SSLCommerz)
router.post('/initiate', authMiddleware, PaymentController.initiate);

// SSLCommerz callback endpoints (form-encoded POST from SSLCommerz gateway)
router.post('/success', PaymentController.handleSuccess);
router.post('/fail', PaymentController.handleFail);
router.post('/cancel', PaymentController.handleCancel);

// SSLCommerz IPN webhook
router.post('/ipn', PaymentController.handleIPN);

// Payment status check (for frontend polling after redirect)
router.get('/status/:tranId', PaymentController.getStatus);

export default router;
