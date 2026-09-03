import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { StorageService } from '../services/storage.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('partners-team.controller');

export class PartnersTeamController {
  // --- Partners Endpoints ---

  static async listPartners(req: Request, res: Response) {
    try {
      const items = await prisma.partnersTeam.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      });
      return res.status(200).json(items);
    } catch (error: any) {
      logger.error({ err: error }, 'Error listing partners');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async createPartner(req: Request, res: Response) {
    try {
      const { name, logo, role, category, sort_order } = req.body;
      const image = logo || req.body.image;
      if (!name || !image) {
        return res.status(400).json({ error: 'Partner name and logo image are required' });
      }

      const item = await prisma.partnersTeam.create({
        data: {
          name,
          role: role || null,
          image,
          category: category || 'Other Organizations',
          sortOrder: sort_order !== undefined ? parseInt(sort_order, 10) : 0,
        },
      });
      return res.status(201).json(item);
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updatePartner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, logo, role, category, sort_order } = req.body;
      const image = logo || req.body.image;

      if (!id) {
        return res.status(400).json({ error: 'Partner ID is required' });
      }

      const partnerId = parseInt(id, 10);
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (image !== undefined) updateData.image = image;
      if (category !== undefined) updateData.category = category;
      if (sort_order !== undefined) updateData.sortOrder = parseInt(sort_order, 10);

      const item = await prisma.partnersTeam.update({
        where: { id: partnerId },
        data: updateData,
      });

      return res.status(200).json(item);
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

      const item = await prisma.partnersTeam.delete({
        where: { id: parseInt(id, 10) },
      });
      return res.status(200).json({ message: 'Partner successfully deleted', partner: item });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deleting partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // --- Team Endpoints ---

  static async listTeam(req: Request, res: Response) {
    try {
      const items = await prisma.partnersTeam.findMany({
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      });
      return res.status(200).json(items);
    } catch (error: any) {
      logger.error({ err: error }, 'Error listing team members');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async createTeamMember(req: Request, res: Response) {
    try {
      const { name, role, image, category, sort_order } = req.body;
      if (!name || !image) {
        return res.status(400).json({ error: 'Name and portrait image are required' });
      }

      const item = await prisma.partnersTeam.create({
        data: {
          name,
          role: role || null,
          image,
          category: category || 'Core Team',
          sortOrder: sort_order !== undefined ? parseInt(sort_order, 10) : 0,
        },
      });
      return res.status(201).json(item);
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating team member');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updateTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role, image, category, sort_order } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Team member ID is required' });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (image !== undefined) updateData.image = image;
      if (category !== undefined) updateData.category = category;
      if (sort_order !== undefined) updateData.sortOrder = parseInt(sort_order, 10);

      const item = await prisma.partnersTeam.update({
        where: { id: parseInt(id, 10) },
        data: updateData,
      });

      return res.status(200).json(item);
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

      const item = await prisma.partnersTeam.delete({
        where: { id: parseInt(id, 10) },
      });
      return res.status(200).json({ message: 'Team member successfully deleted', member: item });
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
      const safeFilename = (filename || 'img').replace(/[^a-zA-Z0-9_-]/g, '');
      const targetFilename = `${safeFilename}-${Date.now()}`;
      const url = await StorageService.uploadPartnerOrTeamImage(targetFilename, buffer, isPng);

      return res.status(200).json({ url });
    } catch (error: any) {
      logger.error({ err: error }, 'Error uploading partner/team image');
      return res.status(500).json({ error: error.message || 'Upload failed' });
    }
  }
}
