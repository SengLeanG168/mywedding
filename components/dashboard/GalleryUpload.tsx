"use client"

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';
import { uploadClientFile } from '@/lib/client-upload';

interface GalleryUploadProps {
  value: string[];
  onChange: (paths: string[]) => void;
  label?: string;
}

export default function GalleryUpload({ value = [], onChange, label }: GalleryUploadProps) {
  const t = useTranslations('Event');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setUploading(true);

    const uploadedUrls: string[] = [];

    try {
      // Upload files sequentially or in parallel
      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // Compress image before upload
        if (file.type.startsWith('image/')) {
          try {
            const options = {
              maxSizeMB: 1, // Max 1MB
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: 'image/webp'
            };
            const compressedBlob = await imageCompression(file, options);
            
            // Create a new File object with .webp extension
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            file = new File([compressedBlob], newName, { type: 'image/webp' });
          } catch (compErr) {
            console.error("Image compression error", compErr);
            // Fallback to original file if compression fails
          }
        }

        try {
          const url = await uploadClientFile(file, 'image');
          uploadedUrls.push(url);
        } catch (uploadErr: any) {
          console.error('Gallery image upload error:', uploadErr);
          setError(uploadErr?.message || t('uploadFailed'));
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
      }
    } catch (err) {
      console.error(err);
      setError(t('uploadFailed'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset
      }
    }
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = value.filter((_, index) => index !== indexToRemove);
    onChange(updated);
  };

  return (
    <div className="space-y-4 border border-dashed border-border rounded-xl p-4 bg-muted/30">
      {label && <div className="text-sm font-semibold">{label}</div>}
      
      {error && <div className="text-xs text-destructive font-medium">{error}</div>}

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((path, index) => (
            <div key={path + index} className="relative aspect-square border border-border rounded-lg overflow-hidden bg-background group">
              <img src={path} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
              
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button wrapper */}
      <div className="flex items-center justify-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          multiple
          className="hidden"
        />

        {uploading ? (
          <div className="flex items-center space-x-2 py-2">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground font-medium">{t('uploading')}</span>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            className="w-full max-w-xs"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('uploadImage')}
          </Button>
        )}
      </div>
    </div>
  );
}
