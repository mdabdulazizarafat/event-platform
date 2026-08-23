import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('certificate.controller');

/**
 * Get the certificate template for an event
 */
export const getCertificateTemplate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Get event ID
    const evRes = await pool.query('SELECT id FROM events WHERE slug = $1', [slug]);
    if (evRes.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventId = evRes.rows[0].id;

    const result = await pool.query('SELECT * FROM certificate_templates WHERE event_id = $1', [eventId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'No template found' });
    }
    
    return res.json(result.rows[0]);
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to get certificate template');
    return res.status(500).json({ error: 'Failed to fetch certificate template' });
  }
};

/**
 * Upsert certificate template for an event
 */
export const upsertCertificateTemplate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { template_url, sending_time } = req.body;

    if (!template_url) {
      return res.status(400).json({ error: 'Template URL is required' });
    }

    // Get event ID
    const evRes = await pool.query('SELECT id FROM events WHERE slug = $1', [slug]);
    if (evRes.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventId = evRes.rows[0].id;

    const sendingTimeVal = sending_time ? new Date(sending_time) : null;

    const result = await pool.query(`
      INSERT INTO certificate_templates (event_id, template_url, sending_time)
      VALUES ($1, $2, $3)
      ON CONFLICT (event_id) DO UPDATE 
      SET template_url = EXCLUDED.template_url,
          sending_time = EXCLUDED.sending_time
      RETURNING *
    `, [eventId, template_url, sendingTimeVal]);

    return res.json({ message: 'Certificate template saved successfully', data: result.rows[0] });
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to save certificate template');
    return res.status(500).json({ error: 'Failed to save certificate template' });
  }
};

/**
 * Get all issued certificates for an event
 */
export const getEventCertificates = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const evRes = await pool.query('SELECT id FROM events WHERE slug = $1', [slug]);
    if (evRes.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventId = evRes.rows[0].id;

    const result = await pool.query(`
      SELECT c.*, u.name as participant_name 
      FROM certificates c
      JOIN users u ON c.issued_to = u.username
      WHERE c.event_id = $1
      ORDER BY c.issued_at DESC
    `, [eventId]);

    return res.json(result.rows);
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to list event certificates');
    return res.status(500).json({ error: 'Failed to list certificates' });
  }
};

/**
 * Issue certificate to a specific participant
 */
export const issueCertificate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { registration_id, title, description, certificate_url, certificate_type } = req.body;
    const issued_by = req.user?.username;

    if (!registration_id || !title) {
      return res.status(400).json({ error: 'Registration ID and Title are required' });
    }

    const evRes = await pool.query('SELECT id FROM events WHERE slug = $1', [slug]);
    if (evRes.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventId = evRes.rows[0].id;

    const regRes = await pool.query('SELECT user_id FROM registrations WHERE id = $1 AND event_id = $2', [registration_id, eventId]);
    if (regRes.rowCount === 0) {
      return res.status(404).json({ error: 'Registration not found for this event' });
    }
    const issued_to = regRes.rows[0].user_id;

    const type = certificate_type || 'PARTICIPATION';

    const result = await pool.query(`
      INSERT INTO certificates (event_id, registration_id, issued_to, issued_by, certificate_type, title, description, certificate_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (registration_id, certificate_type) DO UPDATE
      SET title = EXCLUDED.title,
          description = EXCLUDED.description,
          certificate_url = EXCLUDED.certificate_url,
          issued_by = EXCLUDED.issued_by,
          issued_at = NOW()
      RETURNING *
    `, [eventId, registration_id, issued_to, issued_by, type, title, description, certificate_url]);

    return res.json({ message: 'Certificate issued successfully', data: result.rows[0] });
  } catch (error) {
    logger.error({ err: error, slug: req.params.slug }, 'Failed to issue certificate');
    return res.status(500).json({ error: 'Failed to issue certificate' });
  }
};
