"use client";

import { useState } from 'react';
import { Gift } from 'lucide-react';
import MediaLightbox, { MediaItem } from '@/components/invitation/MediaLightbox';

interface GiftQrSectionProps {
  event: any;
  locale: string;
}

export default function GiftQrSection({ event, locale }: GiftQrSectionProps) {
  const khrImage = event.giftQrKhImageUrl || event.giftQrImageUrl;
  const usdImage = event.giftQrUsdImageUrl;

  if (!event.showGiftQrCode || (!khrImage && !usdImage)) return null;

  const isKm = true;
  const rawTitle = event.giftQrTitleKm || event.giftQrTitleEn;
  const title = (!rawTitle || rawTitle === "ចងដៃតាម QR Code" || rawTitle === "Wedding Gift QR Code") ? "KHQR" : rawTitle;
  const note = event.giftQrNoteKm || event.giftQrNoteEn;

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const qrItems: MediaItem[] = [];
  let khrIndex = -1;
  let usdIndex = -1;

  if (khrImage) {
    khrIndex = qrItems.length;
    qrItems.push({
      src: khrImage,
      type: 'qr',
      title: 'KHQR ប្រាក់រៀល'
    });
  }

  if (usdImage) {
    usdIndex = qrItems.length;
    qrItems.push({
      src: usdImage,
      type: 'qr',
      title: 'KHQR ប្រាក់ដុល្លារ'
    });
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <section className="mt-16 text-center scroll-mt-8 sm:scroll-mt-10" id="gift-qr-section">
      <div className="mb-8">
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary flex items-center justify-center gap-3">
          <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
          {title || "KHQR"}
        </h2>
        <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
      </div>

      <div className={`grid ${khrImage && usdImage ? 'grid-cols-2 gap-2.5 sm:gap-6' : 'grid-cols-1 max-w-sm mx-auto'} w-full px-1 sm:px-4`}>
        
        {/* KHR Card */}
        {khrImage && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-2.5 sm:p-6 shadow-xl border border-primary/20 flex-1 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-xs sm:text-base font-bold text-primary mb-2 sm:mb-6 uppercase tracking-wider">
                {isKm ? "ប្រាក់រៀល" : "KHR"}
              </h3>
              <div 
                className="bg-white p-1.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-6 inline-block cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(khrIndex)}
              >
                <img 
                  src={khrImage} 
                  alt="KHQR ប្រាក់រៀល" 
                  className="w-24 h-24 xs:w-28 xs:h-28 sm:w-44 sm:h-44 object-contain rounded-lg sm:rounded-xl"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-center w-full min-w-0">
                {(event.giftKhBankName || event.giftBankName) && (
                  <p className="text-xs sm:text-base font-semibold text-foreground break-words px-1">
                    {event.giftKhBankName || event.giftBankName}
                  </p>
                )}
                {(event.giftKhAccountName || event.giftAccountName) && (
                  <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide break-words px-1">
                    {event.giftKhAccountName || event.giftAccountName}
                  </p>
                )}
                {(event.giftKhAccountNumber || event.giftAccountNumber) && (
                  <p className="text-xs sm:text-base font-mono text-primary font-medium tracking-wider bg-primary/5 py-1 px-2 sm:px-3 rounded-lg inline-block mt-0.5 break-all max-w-full">
                    {event.giftKhAccountNumber || event.giftAccountNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USD Card */}
        {usdImage && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-2.5 sm:p-6 shadow-xl border border-primary/20 flex-1 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-xs sm:text-base font-bold text-primary mb-2 sm:mb-6 uppercase tracking-wider">
                {isKm ? "ប្រាក់ដុល្លារ" : "USD"}
              </h3>
              <div 
                className="bg-white p-1.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm mb-3 sm:mb-6 inline-block cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(usdIndex)}
              >
                <img 
                  src={usdImage} 
                  alt="KHQR ប្រាក់ដុល្លារ" 
                  className="w-24 h-24 xs:w-28 xs:h-28 sm:w-44 sm:h-44 object-contain rounded-lg sm:rounded-xl"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-center w-full min-w-0">
                {event.giftUsdBankName && (
                  <p className="text-xs sm:text-base font-semibold text-foreground break-words px-1">
                    {event.giftUsdBankName}
                  </p>
                )}
                {event.giftUsdAccountName && (
                  <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wide break-words px-1">
                    {event.giftUsdAccountName}
                  </p>
                )}
                {event.giftUsdAccountNumber && (
                  <p className="text-xs sm:text-base font-mono text-primary font-medium tracking-wider bg-primary/5 py-1 px-2 sm:px-3 rounded-lg inline-block mt-0.5 break-all max-w-full">
                    {event.giftUsdAccountNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
      </div>

      {note && (
        <div className="mt-8 pt-6 w-full px-4">
          <p className="text-sm italic text-muted-foreground max-w-[350px] mx-auto leading-relaxed border-t border-primary/10 pt-6">
            "{note}"
          </p>
        </div>
      )}

      <MediaLightbox 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        items={qrItems} 
        initialIndex={lightboxIndex}
        locale={locale}
      />
    </section>
  );
}
