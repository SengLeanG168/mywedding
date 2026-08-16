"use client"

import { useState } from 'react';
import RSVPForm from '@/components/invitation/RSVPForm';
import Countdown from '@/components/invitation/Countdown';
import InvitationVideoIntro from '@/components/invitation/InvitationVideoIntro';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import OpeningScreen from '@/components/invitation/OpeningScreen';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import CurtainIntro from '@/components/invitation/CurtainIntro';
import WeddingProgram from '@/components/invitation/WeddingProgram';
import TraditionalInvitationSection from '@/components/invitation/TraditionalInvitationSection';
import MapQrCode from '@/components/invitation/MapQrCode';
import GiftQrSection from '@/components/invitation/GiftQrSection';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MapPin, Calendar, Clock, Map } from 'lucide-react';
import { format } from 'date-fns';

interface InvitationContentProps {
  event: any;
  locale: string;
  guest?: any;
  programDays?: any[];
}

export default function InvitationContent({ event, locale, guest, programDays }: InvitationContentProps) {
  // If event.showCurtainIntro is missing, we default to true. If explicitly false, we skip it.
  const shouldShowCurtain = event.showCurtainIntro !== false;
  const [curtainDone, setCurtainDone] = useState(!shouldShowCurtain);
  const [isOpened, setIsOpened] = useState(!event.showOpeningScreen);

  const isKm = locale === 'km';
  const brideName = isKm ? event.brideNameKm : event.brideNameEn;
  const groomName = isKm ? event.groomNameKm : event.groomNameEn;
  const locationName = isKm ? event.locationNameKm : event.locationNameEn;
  const locationAddress = isKm ? event.locationAddressKm : event.locationAddressEn;
  const invitationMessage = isKm ? event.invitationMessageKm : event.invitationMessageEn;
  
  const openingTitle = isKm ? event.openingTitleKm : event.openingTitleEn;
  const openingMessage = isKm ? event.openingMessageKm : event.openingMessageEn;

  // Create a full date time string for the countdown
  const eventDateTime = new Date(event.eventDate);
  const [hours, minutes] = event.eventTime.split(':');
  eventDateTime.setHours(Number(hours), Number(minutes));

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

      {/* 3. Main Content: Render only if opened or if opening screen is disabled */}
      {curtainDone && isOpened && (
        <div className="min-h-screen bg-background relative animate-fade-in">
          
          {/* Video Intro Section */}
          {event.showHeroVideo && event.heroVideoUrl && event.heroVideoType !== 'none' && (
            <InvitationVideoIntro 
              type={event.heroVideoType || 'mp4'} 
              url={event.heroVideoUrl} 
              poster={event.heroVideoPosterUrl} 
              onContinue={() => {
                document.getElementById('invitation-content')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          )}

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

          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10 w-full">
            
            {/* Traditional Invitation Section */}
            <div className="-mx-4 md:-mx-12">
              <TraditionalInvitationSection event={event} locale={locale} />
            </div>

            {/* Header section */}
            <section className="text-center space-y-6 sm:space-y-8 mb-12 sm:mb-16 overflow-hidden">
              <p className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm text-primary font-bold px-2">
                {isKm ? "សូមគោរពអញ្ជើញចូលរួមពិធីមង្គលការរបស់" : "You are invited to the wedding of"}
              </p>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-primary break-words px-2">
                {brideName}
                <span className="block text-2xl sm:text-3xl md:text-4xl my-3 sm:my-4 text-foreground/50 italic font-light">&</span>
                {groomName}
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground whitespace-pre-wrap max-w-lg mx-auto px-4">
                {invitationMessage}
              </p>
            </section>

            {/* Cover Image (optional) */}
            {event.coverImage && (
              <div className="w-full aspect-[4/3] sm:aspect-video rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-12 sm:mb-16 border border-primary/20">
                <img src={event.coverImage} alt="Couple" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Details section */}
            <section className="bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl border border-primary/20 mb-12 sm:mb-16 relative overflow-hidden">
              {/* subtle pattern inside card */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              <div className="space-y-6 sm:space-y-8 relative z-10 w-full">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                  <Calendar className="h-10 w-10 text-primary" />
                  <div>
                    <div className="text-xl font-serif">{format(eventDateTime, 'EEEE, MMMM do, yyyy')}</div>
                    <div className="text-muted-foreground">{isKm ? "សូមកត់ចំណាំថ្ងៃចូលរួម" : "Please save the date"}</div>
                  </div>
                </div>
                
                <div className="h-px w-full bg-border" />
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                  <Clock className="h-10 w-10 text-primary" />
                  <div>
                    <div className="text-xl font-serif">{event.eventTime}</div>
                    <div className="text-muted-foreground">{isKm ? "កម្មវិធីចាប់ផ្តើម" : "Reception begins"}</div>
                  </div>
                </div>
                
                <div className="h-px w-full bg-border" />
                
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                  <MapPin className="h-10 w-10 text-primary shrink-0" />
                  <div>
                    <div className="text-xl font-serif">{locationName}</div>
                    <div className="text-muted-foreground mt-1">{locationAddress}</div>
                    {event.googleMapUrl && (
                      <a href={event.googleMapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-primary hover:underline font-medium">
                        <Map className="h-4 w-4" /> {isKm ? "បើកមើលផែនទី" : "Open in Google Maps"}
                      </a>
                    )}
                    {event.showMapQrCode && event.googleMapUrl && (
                      <MapQrCode 
                        url={event.googleMapUrl} 
                        buttonLabel={isKm ? "ស្កេនមើលទីតាំង" : "Scan for Location"}
                        qrLabel={isKm ? "ស្កេន QR Code ដើម្បីមើលទីតាំង" : "Scan QR Code to view location"} 
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Countdown */}
            <Countdown date={eventDateTime.toISOString()} />

            {/* Wedding Program Section */}
            <WeddingProgram programDays={programDays || []} locale={locale} />

            {/* Gallery Section */}
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
                    <h2 className="text-3xl sm:text-4xl font-serif text-primary">{isKm ? "រូបថតអនុស្សាវរីយ៍" : "Gallery"}</h2>
                    <span className="inline-block w-8 h-[1px] bg-primary mt-2" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0">
                    {galleryUrls.map((url: string, index: number) => (
                      <div key={url + index} className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden border border-primary/20 shadow-lg bg-card">
                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Gift QR Section */}
            <GiftQrSection event={event} locale={locale} />

            {/* RSVP Form */}
            <section className="mt-12 sm:mt-16 w-full" id="rsvp">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-3xl sm:text-4xl font-serif text-primary">RSVP</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">{isKm ? "សូមបញ្ជាក់ពីការចូលរួមរបស់អ្នក" : "Please let us know if you can make it"}</p>
              </div>
              <RSVPForm eventId={event.id} guest={guest} />
            </section>

          </main>

          </div>
        </div>
      )}
    </>
  );
}
