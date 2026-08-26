import { Request, Response } from 'express';
import { pool } from '../db/pool';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('settings.controller');

// Auto-initialize the table
async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(100) UNIQUE NOT NULL,
      value JSONB NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  await pool.query(`
    INSERT INTO platform_settings (key, value) VALUES
    ('general', '{"platformName": "Rong Plan", "supportEmail": "support@rongplan.com", "platformFee": "5"}'),
    ('features', '{"email": true, "signIn": true, "signUp": true, "organizerApplication": true, "participantRegistration": true}')
    ON CONFLICT (key) DO NOTHING;
  `);
}

// Call it once on start
initTable().catch(err => logger.error({ err }, 'Failed to initialize platform_settings table'));

export class SettingsController {
  static async getSettings(req: Request, res: Response) {
    try {
      const result = await pool.query('SELECT key, value FROM platform_settings');
      const settings: any = {};
      result.rows.forEach(row => {
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
        await pool.query(
          'INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
          ['general', JSON.stringify(general)]
        );
      }
      
      if (features) {
        await pool.query(
          'INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
          ['features', JSON.stringify(features)]
        );
      }
      
      return res.status(200).json({ message: 'Settings updated successfully' });
    } catch (error: any) {
      logger.error({ err: error }, 'Update settings error');
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
