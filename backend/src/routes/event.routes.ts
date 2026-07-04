import { Router } from 'express';
import { EventController } from '../controllers/event.controller';

const router = Router();

router.post('/', EventController.create);
router.get('/', EventController.list);
router.get('/:slug', EventController.getBySlug);
router.post('/:slug/register', EventController.register);

export default router;
