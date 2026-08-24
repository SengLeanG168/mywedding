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
 * Optimizes heavy audio files (>3.5MB) to a lightweight 128kbps web stream (~1.5MB) for instant loading
 */
export async function optimizeAudioFile(file: File): Promise<File> {
  if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|flac)$/i)) {
    return file;
  }

  // If already lightweight (under 3.5MB), use original file as is
  if (file.size <= 3.5 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          if (!buffer) {
            resolve(file);
            return;
          }

          const ctx = new AudioCtx();
          const audioBuffer = await ctx.decodeAudioData(buffer);

          const maxDuration = 120; // 2 minutes max loop for web streaming
          const duration = Math.min(audioBuffer.duration, maxDuration);
          const sampleRate = 44100;
          const numberOfChannels = 2;
          const length = Math.floor(duration * sampleRate);

          const offlineCtx = new OfflineAudioContext(numberOfChannels, length, sampleRate);
          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(offlineCtx.destination);
          source.start(0);

          const renderedBuffer = await offlineCtx.startRendering();

          const streamDestination = ctx.createMediaStreamDestination();
          const source2 = ctx.createBufferSource();
          source2.buffer = renderedBuffer;
          source2.connect(streamDestination);

          const mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

          if (!mimeType) {
            ctx.close();
            resolve(file);
            return;
          }

          const mediaRecorder = new MediaRecorder(streamDestination.stream, {
            mimeType,
            audioBitsPerSecond: 128000, // 128 kbps
          });

          const chunks: Blob[] = [];
          mediaRecorder.ondataavailable = (ev) => {
            if (ev.data.size > 0) chunks.push(ev.data);
          };

          mediaRecorder.onstop = () => {
            ctx.close();
            const blob = new Blob(chunks, { type: mimeType });
            const ext = mimeType.includes('webm') ? '.webm' : '.m4a';
            const optFileName = file.name.replace(/\.[^/.]+$/, '') + '-optimized' + ext;
            const optFile = new File([blob], optFileName, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(optFile);
          };

          mediaRecorder.start();
          source2.start(0);

          setTimeout(() => {
            try {
              mediaRecorder.stop();
              source2.stop();
            } catch (e) {}
          }, Math.ceil(duration * 1000) + 100);

        } catch (err) {
          console.warn('Audio optimization failed, using original file:', err);
          resolve(file);
        }
      };

      reader.onerror = () => resolve(file);
      reader.readAsArrayBuffer(file);
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

  if (type === 'image' && options?.autoOptimizeSocialPreview) {
    try {
      fileToUpload = await optimizeSocialPreviewImage(file, 1200, 630);
    } catch (err) {
      console.warn('Social preview optimization warning, using original file:', err);
    }
  }

  if (type === 'audio') {
    try {
      fileToUpload = await optimizeAudioFile(file);
    } catch (err) {
      console.warn('Audio optimization warning, using original file:', err);
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
