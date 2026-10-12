"use client"

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Link2, Plus, ChevronLeft, ChevronRight, Trash2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import imageCompression from 'browser-image-compression';
import { uploadClientFile } from '@/lib/client-upload';

interface GalleryUploadProps {
  value: string[];
  onChange: (paths: string[]) => void;
  label?: string;
}

export default function GalleryUpload({ value = [], onChange, label }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');
    setSuccessMsg('');
    setUploading(true);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // Compress image before upload
        if (file.type.startsWith('image/')) {
          try {
            const options = {
              maxSizeMB: 1, // Max 1MB
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: 'image/webp',
            };
            const compressedBlob = await imageCompression(file, options);
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
            file = new File([compressedBlob], newName, { type: 'image/webp' });
          } catch (compErr) {
            console.error("Image compression error", compErr);
          }
        }

        try {
          const url = await uploadClientFile(file, 'image');
          uploadedUrls.push(url);
        } catch (uploadErr: any) {
          console.error('Gallery image upload error:', uploadErr);
          setError(uploadErr?.message || 'បង្ហោះរូបភាពមិនបានជោគជ័យ');
        }
      }

      if (uploadedUrls.length > 0) {
        const existingSet = new Set(value);
        const newUniqueUrls = uploadedUrls.filter(u => !existingSet.has(u));
        onChange([...value, ...newUniqueUrls]);
        setSuccessMsg(`បានបង្ហោះ ${uploadedUrls.length} រូបភាពជោគជ័យ`);
      }
    } catch (err) {
      console.error(err);
      setError('បង្ហោះរូបភាពមិនបានជោគជ័យ');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddUrls = () => {
    setError('');
    setSuccessMsg('');

    if (!urlInput.trim()) {
      setError('សូមបញ្ចូល URL រូបភាព');
      return;
    }

    // Split by new lines or commas
    const rawLines = urlInput.split(/[\r\n,]+/);
    const parsedUrls: string[] = [];
    const invalidLines: string[] = [];

    rawLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Validate URL format (http/https or relative /uploads/)
      if (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/uploads/') ||
        trimmed.startsWith('/')
      ) {
        parsedUrls.push(trimmed);
      } else {
        invalidLines.push(trimmed);
      }
    });

    if (parsedUrls.length === 0) {
      setError('មិនមាន URL ត្រឹមត្រូវទេ។ URL ត្រូវចាប់ផ្ដើមដោយ https:// ឬ http://');
      return;
    }

    // Filter out duplicates against existing values and within the pasted batch
    const existingSet = new Set(value);
    const uniqueNewUrls: string[] = [];
    let duplicateCount = 0;

    parsedUrls.forEach((url) => {
      if (!existingSet.has(url) && !uniqueNewUrls.includes(url)) {
        uniqueNewUrls.push(url);
      } else {
        duplicateCount++;
      }
    });

    if (uniqueNewUrls.length === 0) {
      setError('URL ទាំងអស់នេះមានក្នុងវិចិត្រសាលរួចហើយ');
      return;
    }

    onChange([...value, ...uniqueNewUrls]);
    setUrlInput('');

    let msg = `បានបន្ថែម ${uniqueNewUrls.length} រូបភាព`;
    if (duplicateCount > 0) {
      msg += ` (${duplicateCount} រូបភាពស្ទួនត្រូវបានរំលង)`;
    }
    if (invalidLines.length > 0) {
      msg += ` [មិនត្រឹមត្រូវ ${invalidLines.length}]`;
    }
    setSuccessMsg(msg);
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = value.filter((_, index) => index !== indexToRemove);
    onChange(updated);
    // Clear broken image cache for this index
    setBrokenImages((prev) => {
      const next = { ...prev };
      delete next[indexToRemove];
      return next;
    });
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= value.length) return;

    const newArr = [...value];
    const [moved] = newArr.splice(index, 1);
    newArr.splice(targetIndex, 0, moved);
    onChange(newArr);
  };

  const handleClearAll = () => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបរូបភាពទាំងអស់ក្នុងវិចិត្រសាលមែនទេ?')) {
      onChange([]);
      setSuccessMsg('បានលុបរូបភាពទាំងអស់');
    }
  };

  return (
    <div className="space-y-6">
      {label && <div className="text-sm font-semibold">{label}</div>}

      {/* 1. Batch URL Input Area */}
      <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          <label htmlFor="gallery-url-textarea" className="text-sm font-semibold text-foreground">
            បន្ថែមរូបភាពវិចិត្រសាលពី URL
          </label>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          សម្រាប់រូបភាពច្រើន សូម upload រូបទៅ Hostinger media subdomain ឬ CDN រួចយក public HTTPS URL មកដាក់ទីនេះ។ មួយបន្ទាត់មួយ URL។
        </p>

        <textarea
          id="gallery-url-textarea"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder={`បញ្ចូល URL រូបភាព មួយបន្ទាត់មួយ URL\nឧទាហរណ៍:\nhttps://media.leangna.online/images/gallery/01.webp\nhttps://media.leangna.online/images/gallery/02.webp\nhttps://media.leangna.online/images/gallery/03.webp`}
          className="w-full min-h-[110px] p-3 rounded-lg border border-input bg-background text-xs font-mono placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            type="button"
            onClick={handleAddUrls}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            បន្ថែម URL ទាំងនេះ
          </Button>

          {urlInput.trim() && (
            <span className="text-[11px] text-muted-foreground">
              {urlInput.split(/[\r\n,]+/).filter(l => l.trim()).length} URLs
            </span>
          )}
        </div>
      </div>

      {/* 2. Direct File Upload Button */}
      <div className="border border-dashed border-border rounded-xl p-4 bg-muted/20 flex flex-col items-center justify-center gap-2 text-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          multiple
          className="hidden"
        />

        {uploading ? (
          <div className="flex items-center space-x-2 py-1">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground font-medium">កំពុងបង្ហោះ...</span>
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
            បង្ហោះរូបភាព (ពីឧបករណ៍)
          </Button>
        )}
        <span className="text-[11px] text-muted-foreground">
          គាំទ្រ PNG, JPG, WebP (បង្ហោះច្រើនរូបភាពក្នុងពេលតែមួយ)
        </span>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 font-medium">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* 3. Gallery Preview Grid & Management */}
      {value.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-foreground flex items-center gap-2">
              <span>រូបភាពក្នុងវិចិត្រសាល</span>
              <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                {value.length}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              លុបទាំងអស់
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {value.map((path, index) => {
              const isBroken = brokenImages[index];
              const isExternal = path.startsWith('http://') || path.startsWith('https://');

              return (
                <div
                  key={path + index}
                  className="relative aspect-square border border-border rounded-xl overflow-hidden bg-card group shadow-sm flex flex-col justify-between"
                >
                  {/* Thumbnail / Image Preview */}
                  {isBroken ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-muted text-muted-foreground text-[10px]">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                      <span className="truncate max-w-full px-1">មិនអាចទាញយករូបបាន</span>
                    </div>
                  ) : (
                    <img
                      src={path}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => setBrokenImages((prev) => ({ ...prev, [index]: true }))}
                    />
                  )}

                  {/* Index / URL Badge */}
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
                    <span className="px-1.5 py-0.5 rounded bg-black/75 text-white text-[10px] font-mono font-semibold backdrop-blur-xs">
                      #{index + 1}
                    </span>
                    {isExternal && (
                      <span className="px-1 py-0.5 rounded bg-blue-600/85 text-white text-[9px] font-sans font-medium" title={path}>
                        URL
                      </span>
                    )}
                  </div>

                  {/* Top Right: Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="absolute top-1.5 right-1.5 p-1 bg-destructive/90 hover:bg-destructive text-white rounded-full transition-all shadow-md active:scale-95 cursor-pointer z-10"
                    aria-label="Remove image"
                    title="លុបរូបភាពនេះ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Bottom Bar: Reordering Controls */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-1.5 flex items-center justify-between text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'left')}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="ផ្លាស់ទីទៅឆ្វេង"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[10px] truncate max-w-[80px] text-white/80 font-mono" title={path}>
                      {path.split('/').pop()}
                    </span>

                    <button
                      type="button"
                      disabled={index === value.length - 1}
                      onClick={() => handleMove(index, 'right')}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="ផ្លាស់ទីទៅស្ដាំ"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

