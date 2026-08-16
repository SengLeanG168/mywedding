"use client";

import { Gift } from 'lucide-react';

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

  return (
    <section className="mt-16 text-center">
      <div className="mb-8">
        <h2 className="text-4xl font-serif text-primary flex items-center justify-center gap-3">
          <Gift className="w-8 h-8" />
          {title || (isKm ? "ចងដៃតាម QR Code" : "Wedding Gift QR Code")}
        </h2>
        <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-6 max-w-4xl mx-auto px-4">
        
        {/* KHR Card */}
        {khrImage && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-primary/20 flex-1 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider">
                {isKm ? "លុយខ្មែរ" : "KHR"}
              </h3>
              <div className="bg-white p-3 rounded-2xl shadow-sm mb-6 inline-block">
                <img 
                  src={khrImage} 
                  alt="KHR QR Code" 
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                />
              </div>
              <div className="space-y-2 text-center w-full">
                {(event.giftKhBankName || event.giftBankName) && (
                  <p className="text-base sm:text-lg font-semibold text-foreground break-words">
                    {event.giftKhBankName || event.giftBankName}
                  </p>
                )}
                {(event.giftKhAccountName || event.giftAccountName) && (
                  <p className="text-sm sm:text-base text-muted-foreground uppercase tracking-wide break-words">
                    {event.giftKhAccountName || event.giftAccountName}
                  </p>
                )}
                {(event.giftKhAccountNumber || event.giftAccountNumber) && (
                  <p className="text-base sm:text-lg font-mono text-primary font-medium tracking-wider bg-primary/5 py-1 px-3 rounded-lg inline-block mt-1 break-words">
                    {event.giftKhAccountNumber || event.giftAccountNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* USD Card */}
        {usdImage && (
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-primary/20 flex-1 relative overflow-hidden flex flex-col items-center">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider">
                {isKm ? "លុយដុល្លារ" : "USD"}
              </h3>
              <div className="bg-white p-3 rounded-2xl shadow-sm mb-6 inline-block">
                <img 
                  src={usdImage} 
                  alt="USD QR Code" 
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                />
              </div>
              <div className="space-y-2 text-center w-full">
                {event.giftUsdBankName && (
                  <p className="text-base sm:text-lg font-semibold text-foreground break-words">
                    {event.giftUsdBankName}
                  </p>
                )}
                {event.giftUsdAccountName && (
                  <p className="text-sm sm:text-base text-muted-foreground uppercase tracking-wide break-words">
                    {event.giftUsdAccountName}
                  </p>
                )}
                {event.giftUsdAccountNumber && (
                  <p className="text-base sm:text-lg font-mono text-primary font-medium tracking-wider bg-primary/5 py-1 px-3 rounded-lg inline-block mt-1 break-words">
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
    </section>
  );
}
