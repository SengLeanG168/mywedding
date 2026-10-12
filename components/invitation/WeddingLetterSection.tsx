"use client";

import React, { useState } from 'react';
import KhmerOrnamentLetterFrame from '@/components/invitation/KhmerOrnamentLetterFrame';
import { isWeddingEvent } from '@/lib/event-helpers';

interface WeddingLetterSectionProps {
  event: any;
  locale: string;
}

const DEFAULT_WEDDING_THANK_YOU_KM = "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា និងភ្ញៀវកិត្តិយសទាំងអស់ ដែលបានអញ្ជើញចូលរួម និងផ្តល់កិត្តិយសក្នុងពិធីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។";
const DEFAULT_EVENT_THANK_YOU_KM = "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា និងភ្ញៀវកិត្តិយសទាំងអស់ ដែលបានអញ្ជើញចូលរួម និងផ្តល់កិត្តិយសក្នុងកម្មវិធីរបស់យើងខ្ញុំ។";

const DEFAULT_WEDDING_APOLOGY_KM = "ក្នុងឱកាសពិធីមង្គលអាពាហ៍ពិពាហ៍នេះ បើមានការខ្វះខាត ឬការទទួលភ្ញៀវមិនបានសមរម្យតាមប្រការណាមួយ យើងខ្ញុំសូមមេត្តាអភ័យទោសដោយក្តីគោរព។";
const DEFAULT_EVENT_APOLOGY_KM = "ក្នុងឱកាសកម្មវិធីនេះ បើមានការខ្វះខាត ឬការទទួលភ្ញៀវមិនបានសមរម្យតាមប្រការណាមួយ យើងខ្ញុំសូមមេត្តាអភ័យទោសដោយក្តីគោរព។";

export default function WeddingLetterSection({ event }: WeddingLetterSectionProps) {
  const [thankYouFrameError, setThankYouFrameError] = useState(false);
  const [apologyFrameError, setApologyFrameError] = useState(false);
  const isKm = true;
  const isWedding = isWeddingEvent(event);

  const showThankYou = event.showThankYouLetter !== false;
  const showApology = event.showApologyLetter !== false;

  if (!showThankYou && !showApology) {
    return null;
  }

  const defaultThankYou = isWedding ? DEFAULT_WEDDING_THANK_YOU_KM : DEFAULT_EVENT_THANK_YOU_KM;
  const defaultApology = isWedding ? DEFAULT_WEDDING_APOLOGY_KM : DEFAULT_EVENT_APOLOGY_KM;

  // Thank You Title & Text
  const thankYouTitle = event.thankYouTitleKm || event.thankYouTitleEn || 'លិខិតថ្លែងអំណរគុណ';
  const thankYouText = event.thankYouTextKm || event.thankYouTextEn || defaultThankYou;

  // Apology Title & Text
  const apologyTitle = event.apologyTitleKm || event.apologyTitleEn || 'លិខិតសូមអភ័យទោស';
  const apologyText = event.apologyTextKm || event.apologyTextEn || defaultApology;

  const thankYouFrameUrl = event.thankYouFrameImageUrl && typeof event.thankYouFrameImageUrl === 'string'
    ? event.thankYouFrameImageUrl.trim()
    : null;

  const apologyFrameUrl = event.apologyFrameImageUrl && typeof event.apologyFrameImageUrl === 'string'
    ? event.apologyFrameImageUrl.trim()
    : null;

  return (
    <section className="my-10 sm:my-14 space-y-6">
      {/* Thank You Letter */}
      {showThankYou && (
        thankYouFrameUrl && !thankYouFrameError ? (
          <div className="relative w-full max-w-[430px] mx-auto my-6 sm:my-8 min-h-[260px] sm:min-h-[300px] flex items-center justify-center overflow-visible">
            {/* Custom Uploaded Frame Image Layer */}
            <img
              src={thankYouFrameUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              loading="lazy"
              onError={() => setThankYouFrameError(true)}
            />

            {/* Inner Thank You Letter Content Layer */}
            <div
              className="relative z-10 w-full text-center flex flex-col items-center justify-center"
              style={{
                padding: 'clamp(28px, 8vw, 56px)',
              }}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-bold text-primary tracking-wide mb-2 sm:mb-3 drop-shadow-sm px-2">
                {thankYouTitle}
              </h3>
              <p
                className="text-xs sm:text-sm md:text-base text-foreground/90 font-serif whitespace-pre-line drop-shadow-sm px-1"
                style={{ lineHeight: 1.8 }}
              >
                {thankYouText}
              </p>
            </div>
          </div>
        ) : (
          <KhmerOrnamentLetterFrame title={thankYouTitle} text={thankYouText} />
        )
      )}

      {/* Apology Letter */}
      {showApology && (
        apologyFrameUrl && !apologyFrameError ? (
          <div className="relative w-full max-w-[430px] mx-auto my-6 sm:my-8 min-h-[260px] sm:min-h-[300px] flex items-center justify-center overflow-visible">
            {/* Custom Uploaded Frame Image Layer */}
            <img
              src={apologyFrameUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
              loading="lazy"
              onError={() => setApologyFrameError(true)}
            />

            {/* Inner Apology Letter Content Layer */}
            <div
              className="relative z-10 w-full text-center flex flex-col items-center justify-center"
              style={{
                padding: 'clamp(28px, 8vw, 56px)',
              }}
            >
              <h3 className="text-base sm:text-lg md:text-xl font-serif font-bold text-primary tracking-wide mb-2 sm:mb-3 drop-shadow-sm px-2">
                {apologyTitle}
              </h3>
              <p
                className="text-xs sm:text-sm md:text-base text-foreground/90 font-serif whitespace-pre-line drop-shadow-sm px-1"
                style={{ lineHeight: 1.8 }}
              >
                {apologyText}
              </p>
            </div>
          </div>
        ) : (
          <KhmerOrnamentLetterFrame title={apologyTitle} text={apologyText} />
        )
      )}
    </section>
  );
}
