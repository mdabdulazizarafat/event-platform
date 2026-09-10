import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { StorageService } from '../services/storage.service';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('partners-team.controller');

export class PartnersTeamController {
  private static mapPartnerToFrontend(item: any) {
    return {
      ...item,
      logo: item.image,
      sort_order: item.sortOrder,
      founder_name: item.founderName,
      founder_title: item.founderTitle,
      is_active: item.isActive,
      created_at: item.createdAt,
    };
  }

  private static mapTeamToFrontend(item: any) {
    return {
      ...item,
      sort_order: item.sortOrder,
      founder_name: item.founderName,
      founder_title: item.founderTitle,
      is_active: item.isActive,
      created_at: item.createdAt,
    };
  }

  // --- Partners Endpoints ---

  static async listPartners(req: Request, res: Response) {
    try {
      const whereClause: any = { category: { in: ['Educational Institutions', 'Clubs', 'Companies', 'Other Organizations'] } };
      if (req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'ADMIN') {
        whereClause.isActive = true;
      }
      const items = await prisma.partnersTeam.findMany({
        where: whereClause,
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      });
      return res.status(200).json(items.map(PartnersTeamController.mapPartnerToFrontend));
    } catch (error: any) {
      logger.warn({ err: error }, 'Partners table not ready or error listing partners');
      return res.status(200).json([]);
    }
  }

  static async createPartner(req: Request, res: Response) {
    try {
      const { name, logo, role, category, sort_order, description, website, founder_name, founder_title, bio, is_active } = req.body;
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
          description: description || null,
          website: website || null,
          founderName: founder_name || null,
          founderTitle: founder_title || null,
          bio: bio || null,
          isActive: is_active !== undefined ? is_active : true,
        },
      });
      return res.status(201).json(PartnersTeamController.mapPartnerToFrontend(item));
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updatePartner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, logo, role, category, sort_order, description, website, founder_name, founder_title, bio, is_active } = req.body;
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
      if (description !== undefined) updateData.description = description;
      if (website !== undefined) updateData.website = website;
      if (founder_name !== undefined) updateData.founderName = founder_name;
      if (founder_title !== undefined) updateData.founderTitle = founder_title;
      if (bio !== undefined) updateData.bio = bio;
      if (is_active !== undefined) updateData.isActive = is_active;

      const item = await prisma.partnersTeam.update({
        where: { id: partnerId },
        data: updateData,
      });

      return res.status(200).json(PartnersTeamController.mapPartnerToFrontend(item));
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
      return res.status(200).json({ message: 'Partner successfully deleted', partner: PartnersTeamController.mapPartnerToFrontend(item) });
    } catch (error: any) {
      logger.error({ err: error }, 'Error deleting partner');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  // --- Team Endpoints ---

  static async listTeam(req: Request, res: Response) {
    try {
      const whereClause: any = { category: { notIn: ['Educational Institutions', 'Clubs', 'Companies', 'Other Organizations'] } };
      if (req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'ADMIN') {
        whereClause.isActive = true;
      }
      const items = await prisma.partnersTeam.findMany({
        where: whereClause,
        orderBy: [{ sortOrder: 'asc' }, { id: 'desc' }],
      });
      return res.status(200).json(items.map(PartnersTeamController.mapTeamToFrontend));
    } catch (error: any) {
      logger.warn({ err: error }, 'Team table not ready or error listing team members');
      return res.status(200).json([]);
    }
  }

  static async createTeamMember(req: Request, res: Response) {
    try {
      const { name, role, image, category, sort_order, description, website, founder_name, founder_title, bio, is_active } = req.body;
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
          description: description || null,
          website: website || null,
          founderName: founder_name || null,
          founderTitle: founder_title || null,
          bio: bio || null,
          isActive: is_active !== undefined ? is_active : true,
        },
      });
      return res.status(201).json(PartnersTeamController.mapTeamToFrontend(item));
    } catch (error: any) {
      logger.error({ err: error }, 'Error creating team member');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updateTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, role, image, category, sort_order, description, website, founder_name, founder_title, bio, is_active } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Team member ID is required' });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (image !== undefined) updateData.image = image;
      if (category !== undefined) updateData.category = category;
      if (sort_order !== undefined) updateData.sortOrder = parseInt(sort_order, 10);
      if (description !== undefined) updateData.description = description;
      if (website !== undefined) updateData.website = website;
      if (founder_name !== undefined) updateData.founderName = founder_name;
      if (founder_title !== undefined) updateData.founderTitle = founder_title;
      if (bio !== undefined) updateData.bio = bio;
      if (is_active !== undefined) updateData.isActive = is_active;

      const item = await prisma.partnersTeam.update({
        where: { id: parseInt(id, 10) },
        data: updateData,
      });

      return res.status(200).json(PartnersTeamController.mapTeamToFrontend(item));
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
      return res.status(200).json({ message: 'Team member successfully deleted', member: PartnersTeamController.mapTeamToFrontend(item) });
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
