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

export async function uploadClientFile(
  file: File,
  type: 'image' | 'video' | 'audio',
  options?: { autoOptimizeSocialPreview?: boolean }
): Promise<string> {
  let fileToUpload = file;

  if (type === 'image') {
    if (options?.autoOptimizeSocialPreview) {
      try {
        fileToUpload = await optimizeSocialPreviewImage(file, 1200, 630);
      } catch (err) {
        console.warn('Social preview optimization warning, using original file:', err);
      }
    } else if (file.size > 3 * 1024 * 1024) {
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

  // Priority 1: Direct Vercel Blob client-side upload (bypasses 4.5MB serverless limit)
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
  }

  // Priority 2: Fallback to server route /api/upload/[type] for local development
  const formData = new FormData();
  formData.append('file', fileToUpload);

  const response = await fetch(`/api/upload/${type}`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (response.ok && (data.url || data.success)) {
    return data.url || data.path;
  }

  let errorMessage = data.error || 'File upload failed';
  if (data.error === 'File is too large') {
    errorMessage = 'ទំហំឯកសារធំពេក! សូមជ្រើសរើសរូបភាព/វីដេអូដែលមានទំហំតូចជាង (File is too large)';
  }

  throw new Error(errorMessage);
}
