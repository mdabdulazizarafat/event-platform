import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { StorageService } from '../services/storage.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('partners-team.controller');

export class PartnersTeamController {
  // --- Partners Endpoints ---

  static async listPartners(req: Request, res: Response) {
    try {
      const showAll = req.query.all === 'true'; // Admin might want to see inactive ones
      const query = showAll 
        ? 'SELECT * FROM partners ORDER BY sort_order ASC, id DESC'
        : 'SELECT * FROM partners WHERE is_active = true ORDER BY sort_order ASC, id DESC';
      
      const result = await pool.query(query);
      return res.status(200).json(result.rows);
    } catch (error: any) {
      logger.error({ err: error }, 'Error listing partners');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async createPartner(req: Request, res: Response) {
    try {
      const { name, logo, description, website, founder_name, founder_title, category, sort_order, is_active } = req.body;
      if (!name || !logo) {
        return res.status(400).json({ error: 'Partner name and logo image are required' });
      }

      const query = `
        INSERT INTO partners (name, logo, description, website, founder_name, founder_title, category, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
      `;
      const values = [
        name,
        logo || null,
        description || null,
        website || null,
        founder_name || null,
        founder_title || null,
        category || 'Other Organizations',
        sort_order !== undefined ? parseInt(sort_order) : 0,
        is_active !== undefined ? !!is_active : true
      ];

      const result = await pool.query(query, values);
      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updatePartner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, logo, description, website, founder_name, founder_title, category, sort_order, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Partner ID is required' });
      }

      const query = `
        UPDATE partners
        SET name = COALESCE($1, name),
            logo = COALESCE($2, logo),
            description = COALESCE($3, description),
            website = COALESCE($4, website),
            founder_name = COALESCE($5, founder_name),
            founder_title = COALESCE($6, founder_title),
            category = COALESCE($7, category),
            sort_order = COALESCE($8, sort_order),
            is_active = COALESCE($9, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *;
      `;
      const values = [
        name || null,
        logo || null,
        description || null,
        website || null,
        founder_name || null,
        founder_title || null,
        category || null,
        sort_order !== undefined ? parseInt(sort_order) : null,
        is_active !== undefined ? !!is_active : null,
        parseInt(id)
      ];

      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async deletePartner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Partner ID is required' });
      }

      const result = await pool.query('DELETE FROM partners WHERE id = $1 RETURNING *', [parseInt(id)]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      return res.status(200).json({ message: 'Partner successfully deleted', partner: result.rows[0] });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deleting partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // --- Team Endpoints ---

  static async listTeam(req: Request, res: Response) {
    try {
      const showAll = req.query.all === 'true';
      const query = showAll 
        ? 'SELECT * FROM team_members ORDER BY sort_order ASC, id DESC'
        : 'SELECT * FROM team_members WHERE is_active = true ORDER BY sort_order ASC, id DESC';
      
      const result = await pool.query(query);
      return res.status(200).json(result.rows);
    } catch (error: any) {
      logger.error({ err: error }, 'Error listing team members');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async createTeamMember(req: Request, res: Response) {
    try {
      const { name, role, image, bio, sort_order, is_active } = req.body;
      if (!name || !image) {
        return res.status(400).json({ error: 'Name and portrait image are required' });
      }

      const query = `
        INSERT INTO team_members (name, role, image, bio, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [
        name,
        role,
        image || null,
        bio || null,
        sort_order !== undefined ? parseInt(sort_order) : 0,
        is_active !== undefined ? !!is_active : true
      ];

      const result = await pool.query(query, values);
      return res.status(201).json(result.rows[0]);
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating team member');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updateTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role, image, bio, sort_order, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Team member ID is required' });
      }

      const query = `
        UPDATE team_members
        SET name = COALESCE($1, name),
            role = COALESCE($2, role),
            image = COALESCE($3, image),
            bio = COALESCE($4, bio),
            sort_order = COALESCE($5, sort_order),
            is_active = COALESCE($6, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
      `;
      const values = [
        name || null,
        role || null,
        image || null,
        bio || null,
        sort_order !== undefined ? parseInt(sort_order) : null,
        is_active !== undefined ? !!is_active : null,
        parseInt(id)
      ];

      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error: any) {
      logger.error({ err: error }, 'Error updating team member');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async deleteTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: 'Team member ID is required' });
      }

      const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [parseInt(id)]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      return res.status(200).json({ message: 'Team member successfully deleted', member: result.rows[0] });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deleting team member');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // --- Image Upload ---

  static async uploadImage(req: Request, res: Response) {
    try {
      const { imageBase64, filename } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'Missing imageBase64' });
      }

      const matches = imageBase64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Invalid base64 format' });
      }

      const isPng = matches[1].toLowerCase() === 'png';
      const buffer = Buffer.from(matches[2], 'base64');
      const targetFilename = filename || `img-${Date.now()}`;
      const url = await StorageService.uploadPartnerOrTeamImage(targetFilename, buffer, isPng);
      
      return res.status(200).json({ url });
    } catch (error: any) {
      logger.error({ err: error }, 'Error uploading partner/team image');
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
}
