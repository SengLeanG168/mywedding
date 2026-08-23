"use client"

import { useState, useEffect } from 'react';
import RSVPForm from '@/components/invitation/RSVPForm';
import Countdown from '@/components/invitation/Countdown';
import InvitationVideoIntro from '@/components/invitation/InvitationVideoIntro';
import ContinueTransitionAnimation from '@/components/invitation/ContinueTransitionAnimation';
import FloatingButterflies from '@/components/invitation/FloatingButterflies';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import OpeningScreen from '@/components/invitation/OpeningScreen';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurtainIntro from '@/components/invitation/CurtainIntro';
import WeddingProgram from '@/components/invitation/WeddingProgram';
import TraditionalInvitationSection from '@/components/invitation/TraditionalInvitationSection';
import MapQrCode from '@/components/invitation/MapQrCode';
import GiftQrSection from '@/components/invitation/GiftQrSection';
import WeddingLetterSection from '@/components/invitation/WeddingLetterSection';
import AddToCalendarButton from '@/components/invitation/AddToCalendarButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MapPin, Calendar, Clock, Map } from 'lucide-react';
import MediaLightbox, { MediaItem } from '@/components/invitation/MediaLightbox';
import { formatLocalizedDate } from '@/lib/date';

interface InvitationContentProps {
  event: any;
  locale: string;
  guest?: any;
  programDays?: any[];
}

export default function InvitationContent({ event, locale, guest, programDays }: InvitationContentProps) {
  // If event.showCurtainIntro is missing, we default to true. If explicitly false, we skip it.
  const shouldShowCurtain = event.showCurtainIntro !== false;
  const hasHeroVideo = Boolean(event.showHeroVideo && event.heroVideoUrl && event.heroVideoType !== 'none');

  const [curtainDone, setCurtainDone] = useState(!shouldShowCurtain);
  const [isOpened, setIsOpened] = useState(!event.showOpeningScreen);
  const [showContinueAnimation, setShowContinueAnimation] = useState(false);
  const [videoIntroDone, setVideoIntroDone] = useState(!hasHeroVideo);

  // Disable background scrolling while video intro screen or transition animation is active
  useEffect(() => {
    const isVideoActive = curtainDone && isOpened && hasHeroVideo && !videoIntroDone;
    const isAnimating = showContinueAnimation;

    if (isVideoActive || isAnimating) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [curtainDone, isOpened, hasHeroVideo, videoIntroDone, showContinueAnimation]);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const isKm = locale === 'km';
  const brideName = isKm ? event.brideNameKm : event.brideNameEn;
  const groomName = isKm ? event.groomNameKm : event.groomNameEn;
  const locationName = isKm ? event.locationNameKm : event.locationNameEn;
  const locationAddress = isKm ? event.locationAddressKm : event.locationAddressEn;
  const invitationMessage = isKm ? event.invitationMessageKm : event.invitationMessageEn;

  // Create a full date time string for the countdown
  const eventDateTime = new Date(event.eventDate);
  const [hours, minutes] = (event.eventTime || '00:00').split(':');
  eventDateTime.setHours(Number(hours) || 0, Number(minutes) || 0);

  return (
    <>
      {/* Background Music */}
      {event.musicUrl && (
        <MusicPlayer url={event.musicUrl} title={event.musicTitle} />
      )}

      {/* 1. Curtain Intro overlay */}
      {!curtainDone && (
        <CurtainIntro
          enabled={shouldShowCurtain}
          onComplete={() => setCurtainDone(true)}
          curtainIntroType={event.curtainIntroType || 'css'}
          curtainIntroVideoUrl={event.curtainIntroVideoUrl || ''}
          allowSkip={event.allowSkipCurtainIntro ?? true}
        />
      )}

      {/* 2. Opening Screen (Khmer Wedding Card) */}
      {curtainDone && event.showOpeningScreen && !isOpened && (
        <OpeningScreen
          brideName={brideName}
          groomName={groomName}
          guest={guest}
          onOpen={() => setIsOpened(true)}
          event={event}
        />
      )}

      {/* 3. Video Intro Screen: Displayed as a separate full screen before main invitation */}
      {curtainDone && isOpened && hasHeroVideo && !videoIntroDone && !showContinueAnimation && (
        <InvitationVideoIntro 
          type={event.heroVideoType || 'mp4'} 
          url={event.heroVideoUrl} 
          poster={event.heroVideoPosterUrl} 
          locale={locale}
          onContinue={() => {
            setShowContinueAnimation(true);
          }}
        />
      )}

      {/* 4. Romantic Transition Animation Screen: Shown after clicking continue on video intro */}
      {curtainDone && isOpened && showContinueAnimation && (
        <ContinueTransitionAnimation 
          onComplete={() => {
            setShowContinueAnimation(false);
            setVideoIntroDone(true);
          }}
        />
      )}

      {/* 5. Main Content: Rendered ONLY after video intro & transition animation are finished */}
      {curtainDone && isOpened && videoIntroDone && !showContinueAnimation && (
        <div className="min-h-screen bg-background relative animate-fade-in">
          {/* Floating Gold & Silver Butterflies Layer */}
          <FloatingButterflies />
          
          {/* Main Invitation Content Section */}
          <div id="invitation-content" className="relative w-full min-h-screen overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-3xl" />

            {/* Floating controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-50">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            <main className="w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
              
              {/* 1. Traditional Invitation Section */}
              <div className="-mx-4">
                <TraditionalInvitationSection event={event} locale={locale} />
              </div>

              {/* Header section */}
              <section className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16 overflow-hidden">
                <p className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs text-primary font-bold px-2">
                  {isKm ? "សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការរបស់" : "You are invited to the wedding of"}
                </p>
                
                <h1 className="text-[clamp(1.625rem,6vw,2rem)] font-serif text-primary font-bold break-words px-2">
                  {brideName}
                  <span className="block text-xl sm:text-2xl my-2 text-foreground/50 italic font-light">&</span>
                  {groomName}
                </h1>
                
                <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap w-full mx-auto px-4 mt-2">
                  {invitationMessage}
                </p>
              </section>

              {/* Cover Image (optional) */}
              {event.coverImage && (
                <div className="w-full aspect-[4/3] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-12 sm:mb-16 border border-primary/20">
                  <img src={event.coverImage} alt="Couple" className="w-full h-full object-cover" />
                </div>
              )}

              {/* 2. Wedding Program Section */}
              <WeddingProgram programDays={programDays || []} locale={locale} />

              {/* 3. Gallery Section (Memory Gallery) */}
              {(() => {
                const galleryUrls = Array.isArray(event.galleryImages)
                  ? (event.galleryImages as string[])
                  : (typeof event.galleryImages === 'string' && event.galleryImages
                      ? JSON.parse(event.galleryImages)
                      : []);
                if (galleryUrls.length === 0) return null;
                
                return (
                  <section className="mt-12 sm:mt-16">
                    <div className="text-center mb-6 sm:mb-8">
                      <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary">{isKm ? "រូបថតអនុស្សាវរីយ៍" : "Gallery"}</h2>
                      <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 px-2 sm:px-0">
                      {galleryUrls.map((url: string, index: number) => (
                        <div 
                          key={url + index} 
                          className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-primary/20 shadow-sm bg-card cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setLightboxItems(galleryUrls.map((src: string) => ({ src, type: 'image' })));
                            setLightboxIndex(index);
                            setIsLightboxOpen(true);
                          }}
                        >
                          <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })()}

              {/* 4 & 5. Thank You & Apology Letter Section */}
              <WeddingLetterSection event={event} locale={locale} />

              {/* 6. Location & Details section */}
              <section className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-primary/20 mb-12 sm:mb-16 relative overflow-hidden">
                {/* subtle pattern inside card */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                
                <div className="space-y-6 sm:space-y-8 relative z-10 w-full">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <Calendar className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-base sm:text-lg font-serif font-bold">{formatLocalizedDate(eventDateTime, locale)}</div>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-border" />
                  
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <Clock className="h-8 w-8 text-primary" />
                    <div>
                      <div className="text-base sm:text-lg font-serif font-bold">{event.eventTime}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{isKm ? "កម្មវិធីចាប់ផ្តើម" : "Reception begins"}</div>
                    </div>
                  </div>
                  
                  <div className="h-px w-full bg-border" />
                  
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <MapPin className="h-8 w-8 text-primary shrink-0" />
                    <div>
                      <div className="text-base sm:text-lg font-serif font-bold">{locationName}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{locationAddress}</div>
                      {event.googleMapUrl && (
                        <a href={event.googleMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm text-primary hover:underline font-medium">
                          <Map className="h-4 w-4" /> {isKm ? "បើកមើលផែនទី" : "Open in Google Maps"}
                        </a>
                      )}
                      {event.showMapQrCode && event.googleMapUrl && (
                        <MapQrCode 
                          url={event.googleMapUrl} 
                          buttonLabel={isKm ? "ស្កេនមើលទីតាំង" : "Scan for Location"}
                          qrLabel={isKm ? "ស្កេន QR Code ដើម្បីមើលទីតាំង" : "Scan QR Code to view location"}
                          locale={locale}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Countdown */}
              <Countdown date={eventDateTime.toISOString()} />

              {/* Add to Calendar Button */}
              <AddToCalendarButton event={event} locale={locale} />

              {/* 7. Gift QR Section */}
              <GiftQrSection event={event} locale={locale} />

              {/* 8. RSVP Form */}
              <section className="mt-12 sm:mt-16 w-full" id="rsvp">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary">RSVP</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-4">{isKm ? "សូមបញ្ជាក់ពីការចូលរួមរបស់អ្នក" : "Please let us know if you can make it"}</p>
                </div>
                <RSVPForm eventId={event.id} guest={guest} />
              </section>

            </main>

          </div>
        </div>
      )}

      {/* Global Lightbox */}
      <MediaLightbox 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        items={lightboxItems} 
        initialIndex={lightboxIndex}
        locale={locale}
      />
    </>
  );
}
