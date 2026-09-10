import { Router } from 'express';
import { PartnersTeamController } from '../controllers/partners-team.controller';
import { authMiddleware, authMiddlewareOptional } from '../middleware/auth.middleware';
import { requireGlobalRole } from '../middleware/rbac.middleware';

const router = Router();

// Public routes
router.get('/partners', authMiddlewareOptional, PartnersTeamController.listPartners);
router.get('/team', authMiddlewareOptional, PartnersTeamController.listTeam);

// Admin-only protected routes (requires authentication and SUPER_ADMIN role)
router.post(
  '/partners',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.createPartner
);
router.put(
  '/partners/:id',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.updatePartner
);
router.delete(
  '/partners/:id',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.deletePartner
);

router.post(
  '/team',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.createTeamMember
);
router.put(
  '/team/:id',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.updateTeamMember
);
router.delete(
  '/team/:id',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.deleteTeamMember
);

router.post(
  '/upload-image',
  authMiddleware,
  requireGlobalRole(['SUPER_ADMIN']),
  PartnersTeamController.uploadImage
);

export default router;
