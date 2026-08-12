import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { TicketTypeController } from '../controllers/ticket-type.controller';
import { authMiddleware, authMiddlewareOptional } from '../middleware/auth.middleware';

import { EventTeamController } from '../controllers/event-team.controller';
import { EventActivityController } from '../controllers/event-activity.controller';
import { ActivityLogController } from '../controllers/activity-log.controller';
import { requireEventRole } from '../middleware/rbac.middleware';

const router = Router();

router.post('/upload-image', authMiddleware, EventController.uploadImage);
router.post('/', authMiddleware, EventController.create);
router.get('/', authMiddlewareOptional, EventController.list);
router.get('/my-managed', authMiddleware, EventController.getMyManagedEvents);
router.get('/:slug', authMiddlewareOptional, EventController.getBySlug);
router.get('/:slug/registrations', authMiddleware, EventController.getRegistrations);
router.put('/:slug', authMiddleware, EventController.update);
router.post('/:slug/register', EventController.register);

// Ticket Type sub-routes
router.post('/:slug/ticket-types', authMiddleware, TicketTypeController.create);
router.get('/:slug/ticket-types', TicketTypeController.list);
router.put('/:slug/ticket-types/:id', authMiddleware, TicketTypeController.update);
router.delete('/:slug/ticket-types/:id', authMiddleware, TicketTypeController.deactivate);

// Event Team sub-routes
router.post('/:slug/team', authMiddleware, requireEventRole(['ORGANIZER']), EventTeamController.invite);
router.get('/:slug/team', authMiddleware, requireEventRole(['ORGANIZER', 'MANAGER']), EventTeamController.list);
router.delete('/:slug/team/:username', authMiddleware, requireEventRole(['ORGANIZER']), EventTeamController.remove);

// Event Activities sub-routes
router.post('/:slug/activities', authMiddleware, requireEventRole(['ORGANIZER']), EventActivityController.create);
router.get('/:slug/activities', authMiddleware, requireEventRole(['ORGANIZER', 'MANAGER', 'SCANNER']), EventActivityController.list);
router.get('/:slug/activities/all', authMiddleware, requireEventRole(['ORGANIZER']), EventActivityController.listAll);
router.put('/:slug/activities/:id', authMiddleware, requireEventRole(['ORGANIZER']), EventActivityController.update);
router.delete('/:slug/activities/:id', authMiddleware, requireEventRole(['ORGANIZER']), EventActivityController.deactivate);

// Ticket Door Scanning & Analytics sub-routes
router.post('/:slug/scan', authMiddleware, requireEventRole(['ORGANIZER', 'MANAGER', 'SCANNER']), ActivityLogController.scan);
router.get('/:slug/scan/logs', authMiddleware, requireEventRole(['ORGANIZER', 'MANAGER', 'SCANNER']), ActivityLogController.listLogs);
router.get('/:slug/scan/stats', authMiddleware, requireEventRole(['ORGANIZER', 'MANAGER', 'SCANNER']), ActivityLogController.getStats);


export default router;
