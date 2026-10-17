"use client"

import { useState, useEffect } from 'react';
import RSVPForm from '@/components/invitation/RSVPForm';
import Countdown from '@/components/invitation/Countdown';
import InvitationVideoIntro from '@/components/invitation/InvitationVideoIntro';
import InvitationTransitionVideo from '@/components/invitation/InvitationTransitionVideo';
import FloatingButterflies from '@/components/invitation/FloatingButterflies';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import OpeningScreen from '@/components/invitation/OpeningScreen';
import CurtainIntro from '@/components/invitation/CurtainIntro';
import WeddingProgram from '@/components/invitation/WeddingProgram';
import TraditionalInvitationSection from '@/components/invitation/TraditionalInvitationSection';
import MapQrCode from '@/components/invitation/MapQrCode';
import GiftQrSection from '@/components/invitation/GiftQrSection';
import WeddingLetterSection from '@/components/invitation/WeddingLetterSection';
import AddToCalendarButton from '@/components/invitation/AddToCalendarButton';
import { MapPin, Calendar, Clock, Map, Sparkles } from 'lucide-react';
import MediaLightbox, { MediaItem } from '@/components/invitation/MediaLightbox';
import { formatLocalizedDate } from '@/lib/date';
import ScrollReveal from '@/components/invitation/ScrollReveal';
import MemoryGallery from '@/components/invitation/MemoryGallery';
import FloatingBottomNav from '@/components/invitation/FloatingBottomNav';
import WishMarquee, { WishItem } from '@/components/invitation/WishMarquee';
import { ThemeToggle } from '@/components/ThemeToggle';
import { isWeddingEvent, getEventTitle, getEventSubtitle, getEventMainName } from '@/lib/event-helpers';

interface InvitationContentProps {
  event: any;
  locale: string;
  guest?: any;
  programDays?: any[];
}

export default function InvitationContent({ event, locale, guest, programDays }: InvitationContentProps) {
  // Only show curtain if explicitly enabled AND actual curtain media (video or image) exists
  const hasCurtainMedia = Boolean(
    (event.curtainIntroVideoUrl && String(event.curtainIntroVideoUrl).trim()) ||
    (event.curtainVideoUrl && String(event.curtainVideoUrl).trim()) ||
    (event.curtainImageUrl && String(event.curtainImageUrl).trim()) ||
    (event.curtainIntroImageUrl && String(event.curtainIntroImageUrl).trim())
  );
  const shouldShowCurtain = Boolean(event.showCurtainIntro !== false && hasCurtainMedia);
  const hasHeroVideo = Boolean(event.showHeroVideo && event.heroVideoUrl && event.heroVideoType !== 'none');
  const hasTransitionVideo = Boolean(event.showTransitionVideo !== false && event.transitionVideoUrl);

  const [curtainDone, setCurtainDone] = useState(!shouldShowCurtain);
  const [isOpened, setIsOpened] = useState(!event.showOpeningScreen);
  const [isPlayingTransitionVideo, setIsPlayingTransitionVideo] = useState(false);
  const [videoIntroDone, setVideoIntroDone] = useState(!hasHeroVideo);


  // Check if returning from calendar bridge with skipIntro=1 or openContent=1
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const shouldSkip = params.get('skipIntro') === '1' || params.get('openContent') === '1';
      if (shouldSkip) {
        setCurtainDone(true);
        setIsOpened(true);
        setVideoIntroDone(true);
        setIsPlayingTransitionVideo(false);

        setTimeout(() => {
          const calendarSection = document.getElementById('calendar-section');
          if (calendarSection) {
            calendarSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 350);
      }
    }
  }, []);

  // Disable background scrolling while full screen video or curtain overlays are active
  useEffect(() => {
    const isVideoActive = curtainDone && isOpened && hasHeroVideo && !videoIntroDone;
    const isTransitioning = isPlayingTransitionVideo;
    const isOpeningActive = curtainDone && event.showOpeningScreen && !isOpened;
    const isCurtainActive = !curtainDone && shouldShowCurtain;

    if (isCurtainActive || isOpeningActive || isVideoActive || isTransitioning) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [curtainDone, isOpened, hasHeroVideo, videoIntroDone, isPlayingTransitionVideo, shouldShowCurtain, event.showOpeningScreen]);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<MediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Wish Marquee Real-time State
  const [newWishes, setNewWishes] = useState<WishItem[]>([]);

  const isKm = true;
  const brideName = event.brideNameKm || event.brideNameEn;
  const groomName = event.groomNameKm || event.groomNameEn;
  const locationName = event.locationNameKm || event.locationNameEn;
  const locationAddress = event.locationAddressKm || event.locationAddressEn;
  const invitationMessage = event.invitationMessageKm || event.invitationMessageEn;

  // Create a full date time string for the countdown
  const eventDateTime = new Date(event.eventDate);
  const [hours, minutes] = (event.eventTime || '00:00').split(':');
  const mainContentVisible = curtainDone && isOpened && videoIntroDone && !isPlayingTransitionVideo;

  return (
    <>
      {/* 1. Curtain Intro overlay (Only rendered if actual curtain media exists) */}
      {!curtainDone && shouldShowCurtain && (
        <CurtainIntro
          enabled={shouldShowCurtain}
          onComplete={() => setCurtainDone(true)}
          curtainIntroType={event.curtainIntroType || 'video'}
          curtainIntroVideoUrl={event.curtainIntroVideoUrl || event.curtainVideoUrl || ''}
          curtainImageUrl={event.curtainImageUrl || event.curtainIntroImageUrl || ''}
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
      {curtainDone && isOpened && hasHeroVideo && !videoIntroDone && !isPlayingTransitionVideo && (
        <InvitationVideoIntro 
          type={event.heroVideoType || 'mp4'} 
          url={event.heroVideoUrl} 
          poster={event.heroVideoPosterUrl} 
          locale="km"
          onContinue={() => {
            if (hasTransitionVideo) {
              setIsPlayingTransitionVideo(true);
            } else {
              setVideoIntroDone(true);
            }
          }}
        />
      )}

      {/* 4. Fullscreen Content Transition Video: Shown after clicking continue on video intro */}
      {curtainDone && isOpened && isPlayingTransitionVideo && hasTransitionVideo && (
        <InvitationTransitionVideo 
          url={event.transitionVideoUrl} 
          onComplete={() => {
            setIsPlayingTransitionVideo(false);
            setVideoIntroDone(true);
          }}
        />
      )}

      {/* 5. Main Content: Rendered ONLY after video intro & transition video are finished */}
      {curtainDone && isOpened && videoIntroDone && !isPlayingTransitionVideo && (
        <div className="min-h-[100dvh] bg-background text-foreground relative overflow-x-hidden animate-fade-in">
          {/* Floating Gold & Silver Butterflies Layer */}
          <FloatingButterflies />
          
          {/* Main Invitation Content Section constrained to mobile max width */}
          <div id="invitation-content" className="relative w-full max-w-[430px] mx-auto overflow-x-hidden">
            {/* Decorative background circles confined to content bounds */}
            <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10" />

            <main 
              className="w-full mx-auto px-3.5 sm:px-4 pt-6 sm:pt-8 relative z-10 space-y-10 sm:space-y-14"
              style={{ paddingBottom: 'calc(84px + env(safe-area-inset-bottom, 0px))' }}
            >
              
              {/* 1. Header Section: Traditional Invitation Section for wedding, or dynamic event card for other events */}
              {isWeddingEvent(event) ? (
                <ScrollReveal direction="up" delay={50}>
                  <div className="w-full">
                    <TraditionalInvitationSection event={event} locale="km" />
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal direction="up" delay={50}>
                  <section className="w-full relative py-8 sm:py-10 px-4 mb-4 sm:mb-6 overflow-hidden flex flex-col items-center text-center bg-card rounded-2xl sm:rounded-3xl shadow-2xl border border-primary/20">
                    <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                    <div className="w-full relative z-10 space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-center gap-1.5 text-primary text-xs tracking-wider uppercase">
                        <Sparkles className="w-4 h-4" />
                        <span>សូមគោរពអញ្ជើញ</span>
                        <Sparkles className="w-4 h-4" />
                      </div>

                      <h2 className="text-[clamp(1.25rem,4.5vw,1.65rem)] font-serif text-primary font-bold leading-tight px-2">
                        {getEventTitle(event, true)}
                      </h2>

                      {/* Ornament */}
                      <div className="flex items-center justify-center gap-2 my-2 w-full max-w-[160px] mx-auto">
                        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent to-primary" />
                        <div className="w-1.5 h-1.5 rotate-45 bg-primary shrink-0" />
                        <div className="h-[1.5px] w-full bg-gradient-to-l from-transparent to-primary" />
                      </div>

                      {event.eventSubtitle && (
                        <p className="text-sm sm:text-base font-serif text-foreground/90 leading-relaxed max-w-md mx-auto px-2">
                          {event.eventSubtitle}
                        </p>
                      )}

                      {(event.celebrantName || event.hostName) && (
                        <div className="pt-1 text-primary font-serif font-bold text-base sm:text-lg">
                          {event.celebrantName ? `ម្ចាស់កម្មវិធី៖ ${event.celebrantName}` : `រៀបចំដោយ៖ ${event.hostName}`}
                        </div>
                      )}

                      {(event.invitationMessageKm || event.invitationMessageEn) && (
                        <p className="text-xs sm:text-sm text-muted-foreground/90 max-w-md mx-auto px-4 leading-relaxed pt-2">
                          {event.invitationMessageKm || event.invitationMessageEn}
                        </p>
                      )}
                    </div>
                  </section>
                </ScrollReveal>
              )}

              {/* Cover Image (optional) */}
              {event.coverImage && (
                <ScrollReveal direction="zoom" delay={150}>
                  <div className="w-full aspect-[4/3] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-primary/20">
                    <img src={event.coverImage} alt="Couple" className="w-full h-full object-cover" />
                  </div>
                </ScrollReveal>
              )}

              {/* 2. Countdown */}
              <ScrollReveal direction="zoom">
                <div id="calendar-section" className="scroll-mt-8 sm:scroll-mt-10">
                  <Countdown date={eventDateTime.toISOString()} event={event} />
                </div>
              </ScrollReveal>

              {/* 3. Add to Calendar Button */}
              <ScrollReveal direction="up">
                <AddToCalendarButton
                  event={event}
                  locale="km"
                  guestId={guest?.id}
                  guestName={guest?.name}
                />
              </ScrollReveal>

              {/* 4. Location & Details section */}
              <ScrollReveal direction="up">
                <section className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-primary/20 relative overflow-hidden scroll-mt-8 sm:scroll-mt-10" id="location-section">
                  {/* subtle pattern inside card */}
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                  
                  <div className="space-y-4 sm:space-y-6 relative z-10 w-full">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                        <MapPin className="h-6 w-6 text-primary shrink-0" />
                      </div>
                      <div>
                        <h3 className="text-xs uppercase tracking-widest text-primary font-bold mb-2">
                          ទីតាំងកម្មវិធី
                        </h3>
                        <div className="text-base sm:text-lg font-serif font-bold text-foreground">
                          {locationName}
                        </div>
                        <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
                          {locationAddress}
                        </div>
                        {event.googleMapUrl && (
                          <a href={event.googleMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline font-medium">
                            <Map className="h-4 w-4" /> បើកមើលផែនទី
                          </a>
                        )}
                        {event.showMapQrCode && event.googleMapUrl && (
                          <MapQrCode 
                            url={event.googleMapUrl} 
                            buttonLabel="ស្កេនមើលទីតាំង"
                            qrLabel="ស្កេន QR Code ដើម្បីមើលទីតាំង"
                            locale="km"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </ScrollReveal>

              {/* 5. Program Section */}
              <ScrollReveal direction="up">
                <WeddingProgram programDays={programDays || []} locale="km" event={event} />
              </ScrollReveal>

              {/* 6. Gallery Section (Memory Gallery) */}
              {(() => {
                const galleryUrls = Array.isArray(event.galleryImages)
                  ? (event.galleryImages as string[])
                  : (typeof event.galleryImages === 'string' && event.galleryImages
                      ? JSON.parse(event.galleryImages)
                      : []);
                const hasGalleryContent = galleryUrls.length > 0 || Boolean(event.galleryVideoUrl);
                if (!hasGalleryContent) return null;
                
                return (
                  <MemoryGallery 
                    images={galleryUrls} 
                    videoUrl={event.galleryVideoUrl || undefined}
                    isKm={true} 
                    onImageClick={(index) => {
                      setLightboxItems(galleryUrls.map((src: string) => ({ src, type: 'image' })));
                      setLightboxIndex(index);
                      setIsLightboxOpen(true);
                    }} 
                  />
                );
              })()}

              {/* 7. Thank You & Apology Letter Section */}
              <ScrollReveal direction="up">
                <WeddingLetterSection event={event} locale="km" />
              </ScrollReveal>

              {/* 8. Gift QR Section */}
              <ScrollReveal direction="up">
                <GiftQrSection event={event} locale="km" />
              </ScrollReveal>

              {/* 8. RSVP Form */}
              <ScrollReveal direction="up">
                <section className="w-full scroll-mt-8 sm:scroll-mt-10" id="rsvp-section">
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif font-bold text-primary">
                      ការចូលរួម
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-4">សូមបញ្ជាក់ពីការចូលរួមរបស់អ្នក</p>
                  </div>
                  <RSVPForm 
                    eventId={event.id} 
                    guest={guest} 
                    onWishSubmitted={(wish) => setNewWishes((prev) => [wish, ...prev])} 
                  />
                </section>
              </ScrollReveal>

              {/* 9. Wedding Wish Marquee (Bottom-most section) */}
              <ScrollReveal direction="up">
                <WishMarquee eventId={event.id} newWishes={newWishes} refreshTrigger={newWishes.length} />
              </ScrollReveal>

            </main>

          </div>
        </div>
      )}

      {/* Floating Controls: Theme Toggle & Sound Icon stacked vertically on the right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-auto animate-fade-in">
        {mainContentVisible && (
          <ThemeToggle className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-background/80 dark:bg-card/80 backdrop-blur-md shadow-md border border-primary/30 flex items-center justify-center text-primary hover:bg-background transition-all active:scale-95" />
        )}
        {event.musicUrl && (
          <MusicPlayer url={event.musicUrl} title={event.musicTitle} />
        )}
      </div>

      {/* Floating Bottom Shortcut Navigation Bar */}
      <FloatingBottomNav visible={mainContentVisible} />

      {/* Global Lightbox */}
      <MediaLightbox 
        isOpen={isLightboxOpen} 
        onClose={() => setIsLightboxOpen(false)} 
        items={lightboxItems} 
        initialIndex={lightboxIndex}
        locale="km"
      />
    </>
  );
}