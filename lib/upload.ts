import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { put } from '@vercel/blob';

export interface UploadConfig {
  maxSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  uploadDir: string;
  prefix?: string;
}

export const IMAGE_CONFIG: UploadConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'images'),
};

export const AVATAR_CONFIG: UploadConfig = {
  maxSize: 20 * 1024 * 1024, // 20MB
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'images'),
  prefix: 'admin-avatar',
};

export const AUDIO_CONFIG: UploadConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedExtensions: ['.mp3', '.wav', '.m4a', '.ogg', '.aac', '.flac', '.webm'],
  allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/webm'],
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'audio'),
};

export const VIDEO_CONFIG: UploadConfig = {
  maxSize: 250 * 1024 * 1024, // 250MB
  allowedExtensions: ['.mp4', '.webm', '.mov'],
  allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
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
  if (file.type && !file.type.startsWith('application/')) {
    if (!config.allowedMimeTypes.includes(file.type)) {
      return { success: false, error: 'Unsupported file type' };
    }
  }

  const uniqueId = crypto.randomBytes(8).toString('hex');
  const sanitizedOriginalName = file.name
    .replace(/[^a-zA-Z0-9.]/g, '_')
    .replace(/_{2,}/g, '_');
  const nameWithoutExt = path.parse(sanitizedOriginalName).name;
  const filePrefix = config.prefix || nameWithoutExt;
  const finalFilename = `${filePrefix}-${uniqueId}${ext}`;

  // Priority 1: Vercel Blob Storage (if BLOB_READ_WRITE_TOKEN is set)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(finalFilename, file, {
        access: 'public',
        addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      if (blob && blob.url) {
        return { success: true, path: blob.url };
      }
    } catch (blobErr) {
      console.error('Vercel Blob upload failed, falling back to disk:', blobErr);
    }
  }

  // Priority 2: Fallback to local disk storage
  try {
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }

    const destinationPath = path.join(config.uploadDir, finalFilename);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destinationPath, buffer);

    const relativeFolder = path.basename(config.uploadDir);
    const publicPath = `/uploads/${relativeFolder}/${finalFilename}`;

    return { success: true, path: publicPath };
  } catch (err) {
    console.error('File save error:', err);
    return { success: false, error: 'Failed to write file' };
  }
}
