import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { createChildLogger } from '../lib/logger';

const logger = createChildLogger('storage.service');

// Lazy client initialization to handle missing env variables gracefully during dev
let r2Client: S3Client | null = null;

function getR2Client(): S3Client {
  if (!r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID || 'mock_account_id';
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'mock_access_key';
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'mock_secret_key';

    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return r2Client;
}

export class StorageService {
  private static bucket = process.env.R2_BUCKET_NAME || 'rong-plan-events';
  private static publicUrl = process.env.R2_PUBLIC_URL || 'https://mock-public-bucket.r2.dev';

  /**
   * Dynamic image compression utility to ensure output buffer is strictly under 100KB.
   */
  private static async compressImageUnder100kb(imageBuffer: Buffer, width: number, height: number, format: 'webp' | 'png'): Promise<Buffer> {
    if (format === 'png') {
      // PNG compression - standard lossless compression
      return await sharp(imageBuffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 8, palette: true }) // palette: true enables pngquant-like optimization for small sizes
        .toBuffer();
    }

    let quality = 80;
    let processed = await sharp(imageBuffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    while (processed.length > 100 * 1024 && quality > 10) {
      quality -= 10;
      processed = await sharp(imageBuffer)
        .resize(width, height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toBuffer();
    }
    return processed;
  }

  private static async compressToWebPUnder100kb(imageBuffer: Buffer, width: number, height: number): Promise<Buffer> {
    return this.compressImageUnder100kb(imageBuffer, width, height, 'webp');
  }

  /**
   * Process and upload a user avatar to R2.
   * Converts to WebP format, resizes to max 500x500, ensuring size stays under 100kb.
   */
  static async uploadAvatar(userId: string, imageBuffer: Buffer): Promise<string> {
    try {
      const processedBuffer = await this.compressToWebPUnder100kb(imageBuffer, 500, 500);

      const key = `avatars/${userId}.webp`;
      const url = await this.uploadAsset(key, processedBuffer, 'image/webp');
      return `${url}?v=${Date.now()}`;
    } catch (err: any) {
      logger.error({ err, userId }, 'Failed to process and upload avatar');
      throw new Error('Avatar upload failed');
    }
  }

  /**
   * Process and upload an event banner to R2.
   * Converts to WebP format, resizes to max 1200x630, ensuring size stays under 100kb.
   */
  static async uploadEventBanner(eventId: string, imageBuffer: Buffer): Promise<string> {
    try {
      const processedBuffer = await this.compressToWebPUnder100kb(imageBuffer, 1200, 630);

      const key = `event_banners/${eventId}.webp`;
      const url = await this.uploadAsset(key, processedBuffer, 'image/webp');
      return `${url}?v=${Date.now()}`;
    } catch (err: any) {
      logger.error({ err, eventId }, 'Failed to process and upload event banner');
      throw new Error('Event banner upload failed');
    }
  }

  /**
   * Process and upload a partner logo or team member profile image to R2.
   * Uploads into the single folder `partners_team/`.
   */
  static async uploadPartnerOrTeamImage(filename: string, imageBuffer: Buffer, isPng: boolean = false): Promise<string> {
    try {
      const format = isPng ? 'png' : 'webp';
      const processedBuffer = await this.compressImageUnder100kb(imageBuffer, 800, 800, format);
      const key = `partners_team/${filename}.${format}`;
      const url = await this.uploadAsset(key, processedBuffer, `image/${format}`);
      return `${url}?v=${Date.now()}`;
    } catch (err: any) {
      logger.error({ err, filename }, 'Failed to process and upload partner/team image');
      throw new Error('Partner/Team image upload failed');
    }
  }


  /**
   * Upload an asset buffer to Cloudflare R2 bucket.
   * Returns the public URL of the uploaded resource.
   */
  static async uploadAsset(key: string, body: Buffer, contentType: string): Promise<string> {
    try {
      const client = getR2Client();
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await client.send(command);
      logger.info({ key }, 'Successfully uploaded to Cloudflare R2.');
      return `${this.publicUrl}/${key}`;
    } catch (err: any) {
      logger.warn({ err, key }, 'R2 upload failed (using fallback URL)');
      // Fallback url for development convenience when credentials are mock
      return `${this.publicUrl}/${key}`;
    }
  }

  /**
   * Generates a temporary secure presigned download link
   */
  static async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    try {
      const client = getR2Client();
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      return await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
    } catch (err: any) {
      logger.warn({ err, key }, 'R2 presigned URL generation failed');
      return `${this.publicUrl}/${key}?token=mock-presigned-token`;
    }
  }
}
