"use client"

import { useTranslations } from 'next-intl';

interface TraditionalInvitationSectionProps {
  event: any;
  locale: string;
}

function toKhmerDigits(num: number | string): string {
  const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
  return String(num).replace(/\d/g, (d) => khmerDigits[parseInt(d, 10)]);
}

const KHMER_WEEKDAYS = [
  'ថ្ងៃអាទិត្យ',  // 0: Sunday
  'ថ្ងៃច័ន្ទ',     // 1: Monday
  'ថ្ងៃអង្គារ',    // 2: Tuesday
  'ថ្ងៃពុធ',      // 3: Wednesday
  'ថ្ងៃព្រហស្បតិ៍',  // 4: Thursday
  'ថ្ងៃសុក្រ',     // 5: Friday
  'ថ្ងៃសៅរ៍',     // 6: Saturday
];

const EN_WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const KHMER_MONTHS = [
  'ខែមករា',    // 0: Jan
  'ខែកុម្ភៈ',    // 1: Feb
  'ខែមីនា',    // 2: Mar
  'ខែមេសា',    // 3: Apr
  'ខែឧសភា',    // 4: May
  'ខែមិថុនា',   // 5: Jun
  'ខែកក្កដា',   // 6: Jul
  'ខែសីហា',    // 7: Aug
  'ខែកញ្ញា',    // 8: Sep
  'ខែតុលា',    // 9: Oct
  'ខែវិច្ឆិកា',   // 10: Nov
  'ខែធ្នូ',     // 11: Dec
];

const EN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseEventDate(dateInput: any) {
  if (!dateInput) return null;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.substring(0, 10).split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return {
      year,
      month,
      day,
      dayOfWeek: d.getDay(),
    };
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    dayOfWeek: d.getDay(),
  };
}

function formatKhmerTime(timeStr?: string | null, isKm = true): string {
  if (!timeStr) return isKm ? '៥:០០ នាទីល្ងាច' : '5:00 PM';
  const [hourStr, minuteStr = '00'] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return timeStr;

  const min = parseInt(minuteStr, 10) || 0;
  const minFormatted = String(min).padStart(2, '0');

  let khmerPeriod = 'ព្រឹក';
  if (hour >= 11 && hour < 12) khmerPeriod = 'ថ្ងៃត្រង់';
  else if (hour >= 12 && hour < 17) khmerPeriod = 'រសៀល';
  else if (hour >= 17 && hour < 20) khmerPeriod = 'ល្ងាច';
  else if (hour >= 20 || hour < 5) khmerPeriod = 'យប់';

  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  if (isKm) {
    const hKhmer = toKhmerDigits(hour12);
    const mKhmer = toKhmerDigits(minFormatted);
    return `${hKhmer}:${mKhmer} នាទី${khmerPeriod}`;
  } else {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minFormatted} ${ampm}`;
  }
}

function renderParentName(fullName?: string | null) {
  if (!fullName) return null;
  const trimmed = fullName.trim();

  // Match Khmer & English honorific titles: "លោកស្រី", "លោកឧកញ៉ា", "លោកជំទាវ", "អ្នកស្រី", "អ្នកនាង", "លោក", "Mr.", "Mrs.", "Ms.", "Dr."
  const prefixRegex = /^(លោកស្រី|លោកឧកញ៉ា|លោកជំទាវ|អ្នកស្រី|អ្នកនាង|លោក|Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i;
  const match = trimmed.match(prefixRegex);

  if (match) {
    const title = match[1];
    const nameOnly = trimmed.substring(match[0].length);
    return (
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        <span className="font-sans font-normal text-muted-foreground text-sm sm:text-base">
          {title}
        </span>
        <span className="font-serif font-bold text-primary text-sm sm:text-base">
          {nameOnly}
        </span>
      </div>
    );
  }

  return (
    <div className="font-serif font-bold text-primary text-sm sm:text-base">
      {trimmed}
    </div>
  );
}

export default function TraditionalInvitationSection({ event }: TraditionalInvitationSectionProps) {
  const isKm = true;

  if (event.showTraditionalInvitationSection === false) {
    return null;
  }

  // Fallbacks for texts
  const blessingTitle = event.blessingTitleKm || event.blessingTitleEn || 'សិរីសួស្ដីជ័យមង្គលអាពាហ៍ពិពាហ៍';

  const defaultIntroKm = 'មានកិត្តិយសសូមគោរពអញ្ជើញ';
  const defaultBodyKm = 'ឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី អ្នកនាង កញ្ញា និងប្រិយមិត្តអញ្ជើញចូលរួមជាអធិបតី និងជាភ្ញៀវកិត្តិយសដើម្បីប្រសិទ្ធពរជ័យសិរីមង្គលក្នុងពិធីរៀបអាពាហ៍ពិពាហ៍ កូនប្រុស កូនស្រី របស់យើងខ្ញុំ ។';

  const invitationIntro = defaultIntroKm;

  const rawCustomText = event.formalInvitationTextKm || event.formalInvitationTextEn;

  // If custom text exists and is not the old default, use it; otherwise use the new formal body
  const isOldDefault = rawCustomText && rawCustomText.includes('យើងខ្ញុំមានសេចក្ដីសោមនស្ស');
  const invitationBody = (!rawCustomText || isOldDefault) 
    ? defaultBodyKm
    : rawCustomText;

  // Fallbacks for names
  const brideName = event.brideNameKm || event.brideNameEn || '';
  const groomName = event.groomNameKm || event.groomNameEn || '';

  // Parents
  const groomFather = event.groomFatherNameKm || event.groomFatherNameEn;
  const groomMother = event.groomMotherNameKm || event.groomMotherNameEn;
  const brideFather = event.brideFatherNameKm || event.brideFatherNameEn;
  const brideMother = event.brideMotherNameKm || event.brideMotherNameEn;

  // Couple Monogram Image URL
  const monogramImageUrl = event.coupleMonogramImageUrl;

  // Date and Time Parsing
  const parsedDate = parseEventDate(event.eventDate);
  const weekdayText = parsedDate 
    ? KHMER_WEEKDAYS[parsedDate.dayOfWeek]
    : 'ថ្ងៃសៅរ៍';

  const monthText = parsedDate 
    ? KHMER_MONTHS[parsedDate.month]
    : 'ខែវិច្ឆិកា';

  const dayText = parsedDate 
    ? toKhmerDigits(parsedDate.day)
    : '២០';

  const yearText = parsedDate 
    ? toKhmerDigits(parsedDate.year)
    : '២០២៦';

  const timeText = formatKhmerTime(event.eventTime, true);

  return (
    <section className="w-full relative py-10 sm:py-12 px-4 mb-6 sm:mb-8 overflow-hidden flex flex-col items-center text-center">
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
          <div className="flex flex-col items-center justify-center text-center px-1 space-y-2 sm:space-y-3">
            {renderParentName(groomFather)}
            {renderParentName(groomMother)}
          </div>
          
          {/* Bride Parents */}
          <div className="flex flex-col items-center justify-center text-center px-1 space-y-2 sm:space-y-3">
            {renderParentName(brideFather)}
            {renderParentName(brideMother)}
          </div>
        </div>

        {/* Formal Invitation Text Section */}
        <div className="w-full mb-10 sm:mb-12 px-3 sm:px-4 space-y-3 sm:space-y-3.5 max-w-2xl mx-auto">
          {/* Line 1: Khmer OS Muol Light */}
          <div className="text-sm sm:text-base font-serif text-primary font-bold tracking-normal leading-relaxed text-center">
            {invitationIntro}
          </div>

          {/* Line 2: Normal Plain Khmer Font */}
          <p className="text-[13.5px] sm:text-[15px] text-foreground/85 leading-[1.75] sm:leading-[1.85] font-sans font-normal text-center">
            {invitationBody}
          </p>
        </div>

        {/* Groom, Couple Monogram Logo, and Bride Name */}
        <div className="w-full mt-4 relative z-10">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-1.5 sm:gap-4 items-center justify-items-center w-full">
            
            {/* Groom Section */}
            <div className="flex flex-col items-center justify-center text-center px-1 space-y-1.5 sm:space-y-2 w-full min-w-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase">
                {isKm ? 'កូនប្រុសនាម' : 'Son'}
              </span>
              <div className="text-[clamp(0.85rem,3.2vw,1.2rem)] font-serif text-primary font-bold leading-snug break-words text-center w-full">
                {groomName}
              </div>
            </div>

            {/* Centered Couple Monogram Logo Image (Uploaded Custom PNG/SVG) */}
            <div className="flex items-center justify-center px-1 sm:px-2 shrink-0">
              {monogramImageUrl ? (
                <div className="relative flex items-center justify-center">
                  <img
                    src={monogramImageUrl}
                    alt="Couple Monogram"
                    className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_2px_14px_rgba(212,175,55,0.35)] transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-16 h-16 sm:w-24 sm:h-24 text-primary font-serif text-2xl sm:text-3xl font-bold opacity-75">
                  លន
                </div>
              )}
            </div>
            
            {/* Bride Section */}
            <div className="flex flex-col items-center justify-center text-center px-1 space-y-1.5 sm:space-y-2 w-full min-w-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground tracking-widest uppercase">
                {isKm ? 'កូនស្រីនាម' : 'Daughter'}
              </span>
              <div className="text-[clamp(0.85rem,3.2vw,1.2rem)] font-serif text-primary font-bold leading-snug break-words text-center w-full">
                {brideName}
              </div>
            </div>
            
          </div>
        </div>

        {/* Traditional Khmer Wedding Date/Time 3-Column Block */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto mt-6 sm:mt-8 pt-2 overflow-visible">
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 md:gap-6 items-center justify-items-center w-full overflow-visible">
            
            {/* Left Column: Short 2px Top Line - Weekday - Short 2px Bottom Line */}
            <div className="w-full flex items-center justify-center overflow-visible">
              <div className="w-full max-w-[115px] sm:max-w-[135px] border-t-2 border-b-2 border-primary/50 py-2 sm:py-2.5 text-center overflow-visible">
                <span className="font-serif font-bold text-xs sm:text-[13px] md:text-sm text-primary tracking-normal block leading-[1.85] sm:leading-[2.0] whitespace-nowrap overflow-visible pb-0.5">
                  {weekdayText}
                </span>
              </div>
            </div>

            {/* Center Column: Month, Big Day Number, Year */}
            <div className="flex flex-col items-center justify-center px-1 sm:px-2 text-center shrink-0 min-w-[80px] sm:min-w-[100px] overflow-visible py-1">
              <span className="font-serif font-bold text-[11px] sm:text-xs text-primary/90 tracking-normal block leading-[1.85] sm:leading-[2.0] whitespace-nowrap overflow-visible pb-0.5">
                {monthText}
              </span>
              <span className="font-serif text-3xl sm:text-4xl md:text-[44px] font-bold text-primary leading-[1.25] my-0.5 tracking-tight drop-shadow-[0_1px_3px_rgba(212,175,55,0.25)] block overflow-visible py-0.5">
                {dayText}
              </span>
              <span className="font-serif font-bold text-[11px] sm:text-xs text-primary/90 tracking-normal block leading-[1.85] sm:leading-[2.0] whitespace-nowrap overflow-visible pt-0.5">
                {yearText}
              </span>
            </div>

            {/* Right Column: Short 2px Top Line - Time - Short 2px Bottom Line */}
            <div className="w-full flex items-center justify-center overflow-visible">
              <div className="w-full max-w-[115px] sm:max-w-[135px] border-t-2 border-b-2 border-primary/50 py-2 sm:py-2.5 text-center overflow-visible">
                <span className="font-serif font-bold text-[10px] sm:text-xs md:text-[12.5px] text-primary tracking-normal block leading-[1.85] sm:leading-[2.0] whitespace-nowrap overflow-visible pb-0.5">
                  {timeText}
                </span>
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </section>
  );
}
