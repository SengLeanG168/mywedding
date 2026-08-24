import { upload } from '@vercel/blob/client';

export async function uploadClientFile(
  file: File,
  type: 'image' | 'video' | 'audio'
): Promise<string> {
  // Priority 1: Direct Vercel Blob client-side upload (bypasses 4.5MB Vercel serverless payload limit)
  try {
    const blob = await upload(file.name, file, {
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
  formData.append('file', file);

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
