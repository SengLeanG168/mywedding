import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadConfig {
  maxSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  uploadDir: string;
  prefix?: string;
}

export const IMAGE_CONFIG: UploadConfig = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'images'),
};

export const AVATAR_CONFIG: UploadConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'images'),
  prefix: 'admin-avatar',
};

export const AUDIO_CONFIG: UploadConfig = {
  maxSize: 15 * 1024 * 1024, // 15MB
  allowedExtensions: ['.mp3', '.wav', '.m4a', '.ogg'],
  allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'audio'),
};

export const VIDEO_CONFIG: UploadConfig = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedExtensions: ['.mp4', '.webm'],
  allowedMimeTypes: ['video/mp4', 'video/webm'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'videos'),
};

export async function saveFile(
  file: File,
  config: UploadConfig
): Promise<{ success: boolean; path?: string; error?: string }> {
  // Validate size
  if (file.size > config.maxSize) {
    return { success: false, error: 'File is too large' };
  }

  // Validate extension
  const ext = path.extname(file.name).toLowerCase();
  if (!config.allowedExtensions.includes(ext)) {
    return { success: false, error: 'Unsupported file type' };
  }

  // Validate mime type
  if (!config.allowedMimeTypes.includes(file.type)) {
    // Some audio/video types might have inconsistent mime types on some platforms,
    // so we will allow extension fallback validation if the browser reports blank or slightly different mime.
    if (file.type && !file.type.startsWith('application/')) {
      return { success: false, error: 'Unsupported file type' };
    }
  }

  try {
    // Ensure upload directory exists
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }

    // Generate safe unique filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const sanitizedOriginalName = file.name
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .replace(/_{2,}/g, '_');
    const nameWithoutExt = path.parse(sanitizedOriginalName).name;
    const filePrefix = config.prefix || nameWithoutExt;
    const finalFilename = `${filePrefix}-${uniqueId}${ext}`;
    const destinationPath = path.join(config.uploadDir, finalFilename);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    // Get public path (e.g. /uploads/images/file.jpg)
    const relativeFolder = path.basename(config.uploadDir);
    const publicPath = `/uploads/${relativeFolder}/${finalFilename}`;

    return { success: true, path: publicPath };
  } catch (err) {
    console.error('File save error:', err);
    return { success: false, error: 'Failed to write file' };
  }
}
