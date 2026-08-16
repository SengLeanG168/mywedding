"use client"

import { useTranslations } from 'next-intl';
import HeartPhotoFrame from './HeartPhotoFrame';

interface TraditionalInvitationSectionProps {
  event: any;
  locale: string;
}

export default function TraditionalInvitationSection({ event, locale }: TraditionalInvitationSectionProps) {
  const t = useTranslations('Event');
  const isKm = locale === 'km';

  if (event.showTraditionalInvitationSection === false) {
    return null;
  }

  // Fallbacks for texts
  const blessingTitle = isKm 
    ? (event.blessingTitleKm || 'សិរីសួស្ដីជ័យមង្គលអាពាហ៍ពិពាហ៍')
    : (event.blessingTitleEn || event.blessingTitleKm || 'Wedding Blessing Ceremony');

  const defaultInvitationTextKm = 'យើងខ្ញុំមានសេចក្ដីសោមនស្សរីករាយ សូមគោរពអញ្ជើញ ឯកឧត្តម លោកជំទាវ លោក លោកស្រី អ្នកនាងកញ្ញា និងភ្ញៀវកិត្តិយសទាំងអស់ អញ្ជើញចូលរួមជាកិត្តិយសក្នុងពិធីមង្គលអាពាហ៍ពិពាហ៍របស់កូនប្រុស កូនស្រីយើងខ្ញុំ។';
  const defaultInvitationTextEn = 'We are delighted to respectfully invite you to join and honor the wedding ceremony of our beloved son and daughter.';

  const formalInvitationText = isKm
    ? (event.formalInvitationTextKm || defaultInvitationTextKm)
    : (event.formalInvitationTextEn || event.formalInvitationTextKm || defaultInvitationTextEn);

  // Fallbacks for names
  const brideName = isKm ? event.brideNameKm : event.brideNameEn;
  const groomName = isKm ? event.groomNameKm : event.groomNameEn;

  // Parents
  const groomFather = isKm ? event.groomFatherNameKm : (event.groomFatherNameEn || event.groomFatherNameKm);
  const groomMother = isKm ? event.groomMotherNameKm : (event.groomMotherNameEn || event.groomMotherNameKm);
  const brideFather = isKm ? event.brideFatherNameKm : (event.brideFatherNameEn || event.brideFatherNameKm);
  const brideMother = isKm ? event.brideMotherNameKm : (event.brideMotherNameEn || event.brideMotherNameKm);

  // Photo
  const photoUrl = event.couplePhotoUrl || event.coverImage;

  return (
    <section className="w-full relative py-12 sm:py-16 px-4 mb-12 sm:mb-16 overflow-hidden flex flex-col items-center text-center">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-card rounded-2xl sm:rounded-3xl shadow-2xl border border-primary/20 w-full mx-auto -z-10" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-2xl sm:rounded-3xl w-full mx-auto -z-10" />
      
      {/* Container */}
      <div className="w-full relative z-10 pt-6 sm:pt-8 pb-10 sm:pb-12 px-2 sm:px-8 flex flex-col items-center">
        
        {/* Blessing Title */}
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-serif text-primary mb-6 sm:mb-8 font-bold leading-tight px-2">
          {blessingTitle}
        </h2>

        {/* Ornament */}
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10 w-full max-w-[200px] sm:max-w-xs">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent to-primary" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rotate-45 bg-primary shrink-0" />
          <div className="h-[2px] w-full bg-gradient-to-l from-transparent to-primary" />
        </div>

        {/* Parents Section */}
        <div className="w-full grid grid-cols-2 gap-2 sm:gap-4 mb-10 sm:mb-12 relative">
          {/* Center Divider */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center h-full">
            <div className="w-px h-full bg-primary/20 absolute" />
            <div className="bg-card p-1 rounded-full z-10 border border-primary/20 shadow-sm">
              <svg className="w-2.5 h-2.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>

          {/* Groom Parents */}
          <div className="flex flex-col items-center text-center px-1">
            <h3 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 sm:mb-4">
              {isKm ? 'ខាងកូនប្រុស' : "Groom's Family"}
            </h3>
            <div className="space-y-1 sm:space-y-2 font-serif text-sm sm:text-base font-semibold">
              {groomFather && <div>{groomFather}</div>}
              {groomMother && <div>{groomMother}</div>}
            </div>
          </div>
          
          {/* Bride Parents */}
          <div className="flex flex-col items-center text-center px-1">
            <h3 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3 sm:mb-4">
              {isKm ? 'ខាងកូនស្រី' : "Bride's Family"}
            </h3>
            <div className="space-y-1 sm:space-y-2 font-serif text-sm sm:text-base font-semibold">
              {brideFather && <div>{brideFather}</div>}
              {brideMother && <div>{brideMother}</div>}
            </div>
          </div>
        </div>

        {/* Formal Invitation Text */}
        <div className="w-full mb-10 sm:mb-12 px-4">
          <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-serif">
            {formalInvitationText}
          </p>
        </div>

        {/* Couple Photo */}
        {photoUrl && (
          <HeartPhotoFrame src={photoUrl} />
        )}

        {/* Groom and Bride Name Sentence */}
        <div className="w-full mt-2 relative">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 items-center">
            
            {/* Center Divider */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center h-full">
              <div className="w-px h-full bg-primary/20 absolute" />
              <div className="bg-card p-1 rounded-full z-10 border border-primary/20 shadow-sm">
                <svg className="w-2.5 h-2.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            {/* Groom Name */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground block mb-1 tracking-widest uppercase">
                {isKm ? 'កូនប្រុសនាម' : 'Son'}
              </span>
              <div className="text-[clamp(1.1rem,4.5vw,1.5rem)] font-serif text-primary font-bold leading-tight break-words">
                {groomName}
              </div>
            </div>
            
            {/* Bride Name */}
            <div className="flex flex-col items-center justify-center text-center px-1">
              <span className="text-[10px] sm:text-xs text-muted-foreground block mb-1 tracking-widest uppercase">
                {isKm ? 'កូនស្រីនាម' : 'Daughter'}
              </span>
              <div className="text-[clamp(1.1rem,4.5vw,1.5rem)] font-serif text-primary font-bold leading-tight break-words">
                {brideName}
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
