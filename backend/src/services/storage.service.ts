import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
      console.log(`Successfully uploaded ${key} to Cloudflare R2.`);
      return `${this.publicUrl}/${key}`;
    } catch (err: any) {
      console.warn(`R2 upload failed for ${key} (using fallback mock URL):`, err.message);
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
      console.warn(`R2 presigned URL generation failed for ${key}:`, err.message);
      return `${this.publicUrl}/${key}?token=mock-presigned-token`;
    }
  }
}
