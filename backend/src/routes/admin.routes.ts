import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireGlobalRole } from '../middleware/rbac.middleware';

const router = Router();

// Protect all admin routes with authentication first
router.use(authMiddleware);

// User administration routes
router.get('/users', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.listUsers);
router.put('/users/:username/role', requireGlobalRole(['SUPER_ADMIN']), AdminController.updateUserRole);

// Event moderation/administration routes
router.get('/events', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.listEvents);
router.delete('/events/:id', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.deleteEvent);

// Audit logs
router.get('/logs', requireGlobalRole(['SUPER_ADMIN']), AdminController.listLogs);

export default router;
