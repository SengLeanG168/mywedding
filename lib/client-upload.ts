import { upload } from '@vercel/blob/client';

/**
 * Resizes and center-crops an image file to exact 1200x630 (1.91:1 ratio) for social previews
 */
export async function optimizeSocialPreviewImage(
  file: File,
  targetWidth = 1200,
  targetHeight = 630
): Promise<File> {
  // If not an image, return original
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
        // Image is wider than 1.91:1 -> crop sides
        cropWidth = img.height * targetRatio;
        cropHeight = img.height;
        cropX = (img.width - cropWidth) / 2;
        cropY = 0;
      } else {
        // Image is taller than 1.91:1 -> crop top/bottom
        cropWidth = img.width;
        cropHeight = img.width / targetRatio;
        cropX = 0;
        cropY = (img.height - cropHeight) / 2;
      }

      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw cropped and scaled image onto 1200x630 canvas
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

export async function uploadClientFile(
  file: File,
  type: 'image' | 'video' | 'audio',
  options?: { autoOptimizeSocialPreview?: boolean }
): Promise<string> {
  let fileToUpload = file;

  if (type === 'image' && options?.autoOptimizeSocialPreview) {
    try {
      fileToUpload = await optimizeSocialPreviewImage(file, 1200, 630);
    } catch (err) {
      console.warn('Social preview optimization warning, using original file:', err);
    }
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

  throw new Error(data.error || 'File upload failed');
}
