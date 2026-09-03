import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { TicketTypeController } from '../controllers/ticket-type.controller';
import { authMiddleware, authMiddlewareOptional } from '../middleware/auth.middleware';
import { EventService } from '../services/event.service';

import { EventTeamController } from '../controllers/event-team.controller';
import { EventActivityController } from '../controllers/event-activity.controller';
import { ActivityLogController } from '../controllers/activity-log.controller';
import { ScheduleController } from '../controllers/schedule.controller';
import { requireEventRole } from '../middleware/rbac.middleware';

const router = Router();

router.post('/upload-image', authMiddleware, EventController.uploadImage);
router.post('/', authMiddleware, EventController.create);
router.get('/', authMiddlewareOptional, EventController.list);
router.get('/my-managed', authMiddleware, EventController.getMyManagedEvents);
router.get('/dashboard-stats', authMiddleware, EventController.getDashboardStats);
router.get('/:slug', authMiddlewareOptional, EventController.getBySlug);
router.get('/:slug/registrations', authMiddleware, requireEventRole(['ORGANIZER']), EventController.getRegistrations);
router.put('/:slug', authMiddleware, requireEventRole(['ORGANIZER']), EventController.update);
router.post('/:slug/register', authMiddleware, EventController.register);

// Debug route
router.get('/debug', async (req, res) => {
  try {
    const events = await EventService.getEvents({ username: 'icd', role: 'USER', mine: true });
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Ticket Type sub-routes
router.post('/:slug/ticket-types', authMiddleware, requireEventRole(['ORGANIZER']), TicketTypeController.create);
router.get('/:slug/ticket-types', TicketTypeController.list);
router.put('/:slug/ticket-types/:id', authMiddleware, requireEventRole(['ORGANIZER']), TicketTypeController.update);
router.delete('/:slug/ticket-types/:id', authMiddleware, requireEventRole(['ORGANIZER']), TicketTypeController.deactivate);

// Event Team sub-routes
router.post('/:slug/team', authMiddleware, requireEventRole(['ORGANIZER']), EventTeamController.invite);
router.get('/:slug/team', authMiddleware, requireEventRole(['ORGANIZER', 'MANAGER']), EventTeamController.list);
router.delete('/:slug/team/:username', authMiddleware, requireEventRole(['ORGANIZER']), EventTeamController.remove);

// Schedule sub-routes
router.post('/:slug/schedules', authMiddleware, requireEventRole(['ORGANIZER']), ScheduleController.create);
router.get('/:slug/schedules', ScheduleController.list);
router.delete('/:slug/schedules/:id', authMiddleware, requireEventRole(['ORGANIZER']), ScheduleController.delete);

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
