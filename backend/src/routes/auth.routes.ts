import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.post('/upload-avatar', authMiddleware, AuthController.uploadAvatar);
router.post('/apply-organizer', authMiddleware, AuthController.applyOrganizer);
router.post('/send-signup-code', AuthController.sendSignupCode);
router.post('/reset-password', AuthController.resetPassword);

export default router;
