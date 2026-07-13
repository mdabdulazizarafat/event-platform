import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

// Payment initiation (called by frontend before redirecting to SSLCommerz)
router.post('/initiate', PaymentController.initiate);

// SSLCommerz callback endpoints (form-encoded POST from SSLCommerz gateway)
router.post('/success', PaymentController.success);
router.post('/fail', PaymentController.fail);
router.post('/cancel', PaymentController.cancel);

// SSLCommerz IPN webhook
router.post('/ipn', PaymentController.ipn);

// Payment status check (for frontend polling after redirect)
router.get('/status/:tranId', PaymentController.getStatus);

export default router;
