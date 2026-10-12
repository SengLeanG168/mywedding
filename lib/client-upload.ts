import { upload } from '@vercel/blob/client';

/**
 * Resizes and center-crops an image file to exact 1200x630 (1.91:1 ratio) for social previews
 */
export async function optimizeSocialPreviewImage(
  file: File,
  targetWidth = 1200,
  targetHeight = 630
): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(file);
        return;
      }

      const sourceRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;

      let cropWidth = img.width;
      let cropHeight = img.height;
      let cropX = 0;
      let cropY = 0;

      if (sourceRatio > targetRatio) {
        cropWidth = img.height * targetRatio;
        cropHeight = img.height;
        cropX = (img.width - cropWidth) / 2;
        cropY = 0;
      } else {
        cropWidth = img.width;
        cropHeight = img.width / targetRatio;
        cropX = 0;
        cropY = (img.height - cropHeight) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        targetWidth,
        targetHeight
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const fileName = file.name.replace(/\.[^/.]+$/, '') + '-1200x630.jpg';
          const resizedFile = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(resizedFile);
        },
        'image/jpeg',
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Validates audio file duration (up to 10 minutes = 600s) without cutting or trimming the audio.
 * Preserves the full original song quality and length.
 */
export async function optimizeAudioFile(file: File): Promise<File> {
  if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const duration = audio.duration;
        // Limit: 10 minutes = 600 seconds
        if (duration && duration > 600) {
          reject(new Error(`បទចម្រៀងត្រូវតែមានរយៈពេលមិនលើសពី 10 នាទី (Music exceeds 10 minutes limit. Duration: ${Math.round(duration)}s)`));
          return;
        }
        resolve(file);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        // If browser cannot probe metadata, allow the full file to upload intact
        resolve(file);
      };

      audio.src = url;
    } catch (err) {
      resolve(file);
    }
  });
}

export function isLocalDevelopment(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  }
  return false;
}

export function getUploadLimitBytes(
  type: 'image' | 'video' | 'audio' | string,
  isLocalDev: boolean,
  blobEnabled: boolean
): number {
  if (isLocalDev) {
    switch (type) {
      case 'image':
        return 50 * 1024 * 1024; // 50MB
      case 'video':
        return 500 * 1024 * 1024; // 500MB
      case 'audio':
        return 100 * 1024 * 1024; // 100MB
      default:
        return 50 * 1024 * 1024; // 50MB
    }
  }

  if (blobEnabled) {
    switch (type) {
      case 'image':
        return 25 * 1024 * 1024; // 25MB
      case 'video':
        return 250 * 1024 * 1024; // 250MB
      case 'audio':
        return 50 * 1024 * 1024; // 50MB
      default:
        return 25 * 1024 * 1024; // 25MB
    }
  }

  // Production server/local fallback without Blob
  return 8 * 1024 * 1024; // 8MB
}

export function formatSizeLimitErrorMessage(
  fileSize: number,
  limitBytes: number,
  isLocalDev: boolean,
  blobEnabled: boolean
): string {
  const sizeMB = (fileSize / (1024 * 1024)).toFixed(1).replace(/\.0$/, '');
  const limitMB = Math.round(limitBytes / (1024 * 1024));

  if (!isLocalDev && !blobEnabled) {
    return `ទំហំឯកសារធំពេក។ ឯកសារនេះមានទំហំ ${sizeMB}MB ប៉ុន្តែអនុញ្ញាតត្រឹម ${limitMB}MB ប៉ុណ្ណោះ។ ឯកសារនេះធំពេកសម្រាប់ upload តាម Server។ សូមប្រើ Vercel Blob ឬ upload ទៅ Hostinger media subdomain រួចយក URL មកដាក់។`;
  }

  return `ទំហំឯកសារធំពេក។ ឯកសារនេះមានទំហំ ${sizeMB}MB ប៉ុន្តែអនុញ្ញាតត្រឹម ${limitMB}MB ប៉ុណ្ណោះ។`;
}

let blobStatusCache: { blobEnabled: boolean; isProduction: boolean } | null = null;
let hasWarnedMissingToken = false;

async function getBlobStatus(): Promise<{ blobEnabled: boolean; isProduction: boolean }> {
  if (blobStatusCache !== null) {
    return blobStatusCache;
  }

  const isLocalHost = isLocalDevelopment();

  try {
    const res = await fetch('/api/upload/blob', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      blobStatusCache = {
        blobEnabled: Boolean(data.blobEnabled),
        isProduction: data.isProduction !== undefined ? Boolean(data.isProduction) : !isLocalHost,
      };
      return blobStatusCache;
    }
  } catch (err) {
    // If probe fails, assume standard environment defaults
  }

  blobStatusCache = {
    blobEnabled: false,
    isProduction: process.env.NODE_ENV === 'production' && !isLocalHost,
  };
  return blobStatusCache;
}

export async function uploadClientFile(
  file: File,
  type: 'image' | 'video' | 'audio',
  options?: { autoOptimizeSocialPreview?: boolean }
): Promise<string> {
  const isLocalDev = isLocalDevelopment();
  const { blobEnabled, isProduction } = await getBlobStatus();
  const maxSizeBytes = getUploadLimitBytes(type, isLocalDev, blobEnabled);

  // Validate initial file size before processing
  if (file.size > maxSizeBytes) {
    throw new Error(formatSizeLimitErrorMessage(file.size, maxSizeBytes, isLocalDev, blobEnabled));
  }

  let fileToUpload = file;

  if (type === 'image') {
    if (options?.autoOptimizeSocialPreview) {
      try {
        fileToUpload = await optimizeSocialPreviewImage(file, 1200, 630);
      } catch (err) {
        console.warn('Social preview optimization warning, using original file:', err);
      }
    } else if (file.size > 3 * 1024 * 1024 && !file.type.includes('svg')) {
      try {
        const imageCompression = (await import('browser-image-compression')).default;
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 3,
          maxWidthOrHeight: 2560,
          useWebWorker: true,
        });
        fileToUpload = new File([compressedBlob], file.name, {
          type: compressedBlob.type || file.type,
          lastModified: Date.now(),
        });
      } catch (compressErr) {
        console.warn('Client-side image compression warning:', compressErr);
      }
    }
  }

  if (type === 'audio') {
    fileToUpload = await optimizeAudioFile(file);
  }

  // Validate post-compression file size
  if (fileToUpload.size > maxSizeBytes) {
    throw new Error(formatSizeLimitErrorMessage(fileToUpload.size, maxSizeBytes, isLocalDev, blobEnabled));
  }

  // If BLOB_READ_WRITE_TOKEN is not configured:
  if (!blobEnabled) {
    // In production without Blob, disallow large files that exceed server limits
    if (isProduction && !isLocalDev) {
      throw new Error(
        'មិនទាន់បានកំណត់ BLOB_READ_WRITE_TOKEN ទេ។ សូមកំណត់ BLOB_READ_WRITE_TOKEN ក្នុង Environment Variables លើ Vercel សម្រាប់ Upload ឯកសារ ឬ upload ទៅ Hostinger media subdomain រួចយក URL មកដាក់។'
      );
    }

    // In local development, bypass @vercel/blob completely and go straight to local server upload
    if (!hasWarnedMissingToken) {
      console.info(
        'BLOB_READ_WRITE_TOKEN មិនត្រូវបានកំណត់។ Upload ដំណើរការតាម Local fallback សម្រាប់ localhost development។'
      );
      hasWarnedMissingToken = true;
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);

    const response = await fetch(`/api/upload/${type}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && (data.url || data.path || data.success)) {
      return data.url || data.path;
    }

    let errorMessage = data.error || 'ការបង្ហោះឯកសារបរាជ័យ';
    if (data.error === 'File is too large') {
      errorMessage = formatSizeLimitErrorMessage(fileToUpload.size, maxSizeBytes, isLocalDev, blobEnabled);
    }

    throw new Error(errorMessage);
  }

  // Priority 1: Direct Vercel Blob client-side upload when Blob is enabled
  try {
    const blob = await upload(fileToUpload.name, fileToUpload, {
      access: 'public',
      handleUploadUrl: '/api/upload/blob',
    });
    if (blob && blob.url) {
      return blob.url;
    }
  } catch (blobErr: any) {
    console.warn('Vercel Blob client upload fallback triggered:', blobErr);
    if (isProduction && !isLocalDev && fileToUpload.size > 4.5 * 1024 * 1024) {
      throw new Error(`Upload ទៅ Vercel Blob បរាជ័យ: ${blobErr?.message || blobErr}`);
    }
  }

  // Priority 2: Fallback to server route /api/upload/[type]
  const formData = new FormData();
  formData.append('file', fileToUpload);

  const response = await fetch(`/api/upload/${type}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (response.ok && (data.url || data.path || data.success)) {
    return data.url || data.path;
  }

  let errorMessage = data.error || 'ការបង្ហោះឯកសារបរាជ័យ';
  if (data.error === 'File is too large') {
    errorMessage = formatSizeLimitErrorMessage(fileToUpload.size, maxSizeBytes, isLocalDev, blobEnabled);
  }

  throw new Error(errorMessage);
}
