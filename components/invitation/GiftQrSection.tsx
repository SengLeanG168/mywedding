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

  const isKm = locale === 'km';
  const title = isKm ? event.giftQrTitleKm : event.giftQrTitleEn;
  const note = isKm ? event.giftQrNoteKm : event.giftQrNoteEn;

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
      title: isKm ? 'QR Code លុយខ្មែរ' : 'Khmer Riel QR Code'
    });
  }

  if (usdImage) {
    usdIndex = qrItems.length;
    qrItems.push({
      src: usdImage,
      type: 'qr',
      title: isKm ? 'QR Code លុយដុល្លារ' : 'US Dollar QR Code'
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
          {title || (isKm ? "ចងដៃតាម QR Code" : "Wedding Gift QR Code")}
        </h2>
        <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
      </div>

      <div className={`grid ${khrImage && usdImage ? 'grid-cols-2 gap-3 sm:gap-6' : 'grid-cols-1 max-w-sm mx-auto'} w-full px-2 sm:px-4`}>
        
        {/* KHR Card */}
        {khrImage && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-primary/20 flex-1 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-sm sm:text-base font-bold text-primary mb-3 sm:mb-6 uppercase tracking-wider">
                {isKm ? "លុយខ្មែរ" : "KHR"}
              </h3>
              <div 
                className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm mb-4 sm:mb-6 inline-block cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(khrIndex)}
              >
                <img 
                  src={khrImage} 
                  alt="KHR QR Code" 
                  className="w-32 h-32 sm:w-48 sm:h-48 object-contain rounded-xl"
                />
              </div>
              <div className="space-y-2 text-center w-full">
                {(event.giftKhBankName || event.giftBankName) && (
                  <p className="text-sm sm:text-base font-semibold text-foreground break-words">
                    {event.giftKhBankName || event.giftBankName}
                  </p>
                )}
                {(event.giftKhAccountName || event.giftAccountName) && (
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide break-words">
                    {event.giftKhAccountName || event.giftAccountName}
                  </p>
                )}
                {(event.giftKhAccountNumber || event.giftAccountNumber) && (
                  <p className="text-sm sm:text-base font-mono text-primary font-medium tracking-wider bg-primary/5 py-1 px-3 rounded-lg inline-block mt-1 break-words">
                    {event.giftKhAccountNumber || event.giftAccountNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USD Card */}
        {usdImage && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-primary/20 flex-1 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-sm sm:text-base font-bold text-primary mb-3 sm:mb-6 uppercase tracking-wider">
                {isKm ? "លុយដុល្លារ" : "USD"}
              </h3>
              <div 
                className="bg-white p-2 sm:p-3 rounded-2xl shadow-sm mb-4 sm:mb-6 inline-block cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openLightbox(usdIndex)}
              >
                <img 
                  src={usdImage} 
                  alt="USD QR Code" 
                  className="w-32 h-32 sm:w-48 sm:h-48 object-contain rounded-xl"
                />
              </div>
              <div className="space-y-2 text-center w-full">
                {event.giftUsdBankName && (
                  <p className="text-sm sm:text-base font-semibold text-foreground break-words">
                    {event.giftUsdBankName}
                  </p>
                )}
                {event.giftUsdAccountName && (
                  <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide break-words">
                    {event.giftUsdAccountName}
                  </p>
                )}
                {event.giftUsdAccountNumber && (
                  <p className="text-sm sm:text-base font-mono text-primary font-medium tracking-wider bg-primary/5 py-1 px-3 rounded-lg inline-block mt-1 break-words">
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
