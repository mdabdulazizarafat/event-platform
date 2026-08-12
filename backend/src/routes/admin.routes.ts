import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireGlobalRole } from '../middleware/rbac.middleware';

const router = Router();

// Protect all admin routes with authentication first
router.use(authMiddleware);

// User administration routes
router.get('/users', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.listUsers);
router.post('/users', requireGlobalRole(['SUPER_ADMIN']), AdminController.createUser);
router.put('/users/:username', requireGlobalRole(['SUPER_ADMIN']), AdminController.updateUser);
router.delete('/users/:username', requireGlobalRole(['SUPER_ADMIN']), AdminController.deleteUser);
router.put('/users/:username/role', requireGlobalRole(['SUPER_ADMIN']), AdminController.updateUserRole);

// Event moderation/administration routes
router.get('/events', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.listEvents);
router.post('/events', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.createEvent);
router.put('/events/:id', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.updateEvent);
router.delete('/events/:id', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.deleteEvent);
router.get('/events/:id/team', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.listEventTeam);
router.post('/events/:id/team', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.addEventTeamMember);
router.delete('/events/:id/team/:username', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.removeEventTeamMember);

// Audit logs
router.get('/logs', requireGlobalRole(['SUPER_ADMIN']), AdminController.listLogs);

// Organizer Applications moderation routes
router.get('/organizer-applications', requireGlobalRole(['ADMIN', 'SUPER_ADMIN']), AdminController.listOrganizerApplications);
router.put('/organizer-applications/:username/approve', requireGlobalRole(['SUPER_ADMIN']), AdminController.approveOrganizer);
router.put('/organizer-applications/:username/reject', requireGlobalRole(['SUPER_ADMIN']), AdminController.rejectOrganizer);


// Granular admin permissions routes
router.get('/permissions/:username', requireGlobalRole(['SUPER_ADMIN']), AdminController.listAdminPermissions);
router.post('/permissions/:username', requireGlobalRole(['SUPER_ADMIN']), AdminController.grantAdminPermission);
router.delete('/permissions/:username/:permission', requireGlobalRole(['SUPER_ADMIN']), AdminController.revokeAdminPermission);

export default router;

