"use client"

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, Film, Music as MusicIcon, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { uploadClientFile } from '@/lib/client-upload';

interface MediaUploadProps {
  type: 'image' | 'video' | 'audio';
  value: string;
  onChange: (path: string) => void;
  label?: string;
  autoOptimizeSocialPreview?: boolean;
  uploadButtonText?: string;
  viewButtonText?: string;
  removeButtonText?: string;
}

export default function MediaUpload({ 
  type, 
  value, 
  onChange, 
  label, 
  autoOptimizeSocialPreview,
  uploadButtonText,
  viewButtonText,
  removeButtonText,
}: MediaUploadProps) {
  const t = useTranslations('Event');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Determine accepted file formats based on media type
  const getAcceptedFormats = () => {
    switch (type) {
      case 'image':
        return 'image/png, image/jpeg, image/webp, image/svg+xml, .png, .jpg, .jpeg, .webp, .svg';
      case 'video':
        return 'video/mp4, video/webm';
      case 'audio':
        return 'audio/mpeg, audio/wav, audio/x-wav, audio/mp4, audio/x-m4a, audio/ogg';
    }
  };

  // Trigger file selection dialog
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Perform upload request to Vercel Blob client-side (bypasses 4.5MB serverless limit)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const url = await uploadClientFile(file, type, { autoOptimizeSocialPreview });
      onChange(url);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || t('uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input to allow re-uploading same file
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setError('');
  };

  return (
    <div className="space-y-2 border border-dashed border-border rounded-xl p-4 bg-muted/30">
      {label && <div className="text-sm font-medium text-muted-foreground">{label}</div>}

      {error && <div className="text-xs text-destructive font-medium">{error}</div>}

      {value ? (
        <div className="space-y-3">
          {/* Media Preview Section */}
          <div className="relative rounded-lg overflow-hidden border border-border bg-background p-2">
            {type === 'image' && (
              <div className="relative aspect-video max-h-[160px] w-full flex items-center justify-center bg-muted rounded-md overflow-hidden">
                <img src={value} alt="Preview" className="h-full object-contain" />
              </div>
            )}

            {type === 'video' && (
              <div className="relative aspect-video max-h-[200px] w-full flex items-center justify-center bg-black rounded-md overflow-hidden">
                <video src={value} controls className="w-full h-full object-contain" playsInline />
              </div>
            )}

            {type === 'audio' && (
              <div className="w-full py-4 px-2 bg-muted rounded-md flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 text-primary">
                  <MusicIcon className="w-5 h-5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{t('preview')}</span>
                </div>
                <audio src={value} controls className="w-full" />
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2 items-center">
            {value && (
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                {viewButtonText || (type === 'video' ? 'មើលវីដេអូ' : t('preview'))}
              </a>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              disabled={uploading}
            >
              {uploadButtonText || t('replaceFile')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
            >
              <X className="w-4 h-4 mr-1" />
              {removeButtonText || (type === 'image' ? t('removeImage') : type === 'video' ? t('removeVideo') : t('removeMusic'))}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={getAcceptedFormats()}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground font-medium">{t('uploading')}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                {type === 'image' && <ImageIcon className="w-6 h-6" />}
                {type === 'video' && <Film className="w-6 h-6" />}
                {type === 'audio' && <MusicIcon className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleButtonClick}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadButtonText || (type === 'image' ? t('uploadImage') : type === 'video' ? t('uploadVideo') : t('uploadAudio'))}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
