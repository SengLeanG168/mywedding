"use client";

import React from 'react';
import KhmerOrnamentLetterFrame from '@/components/invitation/KhmerOrnamentLetterFrame';

interface WeddingLetterSectionProps {
  event: any;
  locale: string;
}

const DEFAULT_THANK_YOU_KM = "យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅចំពោះ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា និងភ្ញៀវកិត្តិយសទាំងអស់ ដែលបានអញ្ជើញចូលរួម និងផ្តល់កិត្តិយសក្នុងពិធីមង្គលអាពាហ៍ពិពាហ៍របស់យើងខ្ញុំ។";
const DEFAULT_THANK_YOU_EN = "We sincerely thank all honored guests for joining and blessing our wedding ceremony. Your presence means a lot to us.";

const DEFAULT_APOLOGY_KM = "ក្នុងឱកាសពិធីមង្គលអាពាហ៍ពិពាហ៍នេះ បើមានការខ្វះខាត ឬការទទួលភ្ញៀវមិនបានសមរម្យតាមប្រការណាមួយ យើងខ្ញុំសូមមេត្តាអភ័យទោសដោយក្តីគោរព។";
const DEFAULT_APOLOGY_EN = "If there are any shortcomings during our wedding ceremony or hospitality, we respectfully ask for your kind understanding and forgiveness.";

export default function WeddingLetterSection({ event }: WeddingLetterSectionProps) {
  const isKm = true;

  const showThankYou = event.showThankYouLetter !== false;
  const showApology = event.showApologyLetter !== false;

  if (!showThankYou && !showApology) {
    return null;
  }

  // Thank You Title & Text
  const thankYouTitle = event.thankYouTitleKm || event.thankYouTitleEn || 'លិខិតថ្លែងអំណរគុណ';
  const thankYouText = event.thankYouTextKm || event.thankYouTextEn || DEFAULT_THANK_YOU_KM;

  // Apology Title & Text
  const apologyTitle = event.apologyTitleKm || event.apologyTitleEn || 'លិខិតសូមអភ័យទោស';
  const apologyText = event.apologyTextKm || event.apologyTextEn || DEFAULT_APOLOGY_KM;

  return (
    <section className="my-10 sm:my-14 space-y-6">
      {/* Thank You Letter */}
      {showThankYou && (
        <KhmerOrnamentLetterFrame title={thankYouTitle} text={thankYouText} />
      )}

      {/* Apology Letter */}
      {showApology && (
        <KhmerOrnamentLetterFrame title={apologyTitle} text={apologyText} />
      )}
    </section>
  );
}
