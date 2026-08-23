import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireEventRole, requireGlobalRole } from '../middleware/rbac.middleware';
import {
  getCertificateTemplate,
  upsertCertificateTemplate,
  getEventCertificates,
  issueCertificate
} from '../controllers/certificate.controller';

const router = Router();

// Middleware applied to all routes
router.use(authMiddleware);

// Get/Upsert template (only organizers and above)
router.get('/:slug/template', requireEventRole(['ORGANIZER']), getCertificateTemplate);
router.post('/:slug/template', requireEventRole(['ORGANIZER']), upsertCertificateTemplate);

// List event certificates (only organizers and above)
router.get('/:slug', requireEventRole(['ORGANIZER']), getEventCertificates);

// Issue certificate manually (only organizers and above)
router.post('/:slug/issue', requireEventRole(['ORGANIZER']), issueCertificate);

export default router;
