import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('settings.controller');

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const rows = await prisma.platformSetting.findMany();
      const settings: Record<string, any> = {};
      rows.forEach((row: any) => {
        settings[row.key] = row.value;
      });
      return res.status(200).json(settings);
    } catch (error: any) {
      logger.error({ err: error }, 'Get settings error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const { general, features } = req.body;

      if (general) {
        await prisma.platformSetting.upsert({
          where: { key: 'general' },
          update: { value: general },
          create: { key: 'general', value: general },
        });
      }

      if (features) {
        await prisma.platformSetting.upsert({
          where: { key: 'features' },
          update: { value: features },
          create: { key: 'features', value: features },
        });
      }

      return res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error: any) {
      logger.error({ err: error }, 'Update settings error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
