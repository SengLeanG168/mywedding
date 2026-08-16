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
      <div className="absolute inset-0 bg-card rounded-2xl sm:rounded-3xl shadow-2xl border border-primary/20 max-w-4xl mx-auto -z-10" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none rounded-2xl sm:rounded-3xl max-w-4xl mx-auto -z-10" />
      
      {/* Container */}
      <div className="max-w-3xl mx-auto relative z-10 w-full pt-6 sm:pt-8 pb-10 sm:pb-12 px-2 sm:px-8 flex flex-col items-center">
        
        {/* Blessing Title */}
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-serif text-primary mb-6 sm:mb-8 font-bold leading-tight px-2">
          {blessingTitle}
        </h2>

        {/* Ornament */}
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10 w-full max-w-[200px] sm:max-w-xs">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent to-primary" />
          <div className="w-2 h-2 sm:w-3 sm:h-3 rotate-45 bg-primary shrink-0" />
          <div className="h-[2px] w-full bg-gradient-to-l from-transparent to-primary" />
        </div>

        {/* Parents Section */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-10 sm:mb-12">
          {/* Groom Parents */}
          <div className="flex flex-col items-center">
            <h3 className="text-base sm:text-lg font-bold text-muted-foreground uppercase tracking-widest mb-3 sm:mb-4">
              {isKm ? 'ខាងកូនប្រុស' : "Groom's Family"}
            </h3>
            <div className="space-y-1 sm:space-y-2 font-serif text-lg sm:text-xl px-2">
              {groomFather && <div>{groomFather}</div>}
              {groomMother && <div>{groomMother}</div>}
            </div>
          </div>
          
          {/* Bride Parents */}
          <div className="flex flex-col items-center">
            <h3 className="text-base sm:text-lg font-bold text-muted-foreground uppercase tracking-widest mb-3 sm:mb-4">
              {isKm ? 'ខាងកូនស្រី' : "Bride's Family"}
            </h3>
            <div className="space-y-1 sm:space-y-2 font-serif text-lg sm:text-xl px-2">
              {brideFather && <div>{brideFather}</div>}
              {brideMother && <div>{brideMother}</div>}
            </div>
          </div>
        </div>

        {/* Formal Invitation Text */}
        <div className="max-w-2xl mx-auto mb-10 sm:mb-12 px-4">
          <p className="text-base sm:text-lg md:text-xl text-foreground/80 leading-relaxed font-serif">
            {formalInvitationText}
          </p>
        </div>

        {/* Couple Photo */}
        {photoUrl && (
          <HeartPhotoFrame src={photoUrl} />
        )}

        {/* Groom and Bride Name Sentence */}
        <div className="space-y-6 w-full text-center mt-2">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="text-xl sm:text-2xl md:text-3xl font-serif text-primary">
              <span className="text-xs sm:text-sm md:text-base text-muted-foreground block mb-1 tracking-widest uppercase">
                {isKm ? 'កូនប្រុសនាម' : 'Son:'}
              </span>
              <span className="font-bold">{groomName}</span>
            </div>
            
            <div className="hidden md:block w-px h-16 bg-primary/30" />
            <div className="block md:hidden h-px w-16 bg-primary/30" />
            
            <div className="text-xl sm:text-2xl md:text-3xl font-serif text-primary mt-2 md:mt-0">
              <span className="text-xs sm:text-sm md:text-base text-muted-foreground block mb-1 tracking-widest uppercase">
                {isKm ? 'កូនស្រីនាម' : 'Daughter:'}
              </span>
              <span className="font-bold">{brideName}</span>
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}
