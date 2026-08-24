const KHMER_WEEKDAYS = [
  'ថ្ងៃអាទិត្យ', // Sunday
  'ថ្ងៃចន្ទ',    // Monday
  'ថ្ងៃអង្គារ',   // Tuesday
  'ថ្ងៃពុធ',     // Wednesday
  'ថ្ងៃព្រហស្បតិ៍', // Thursday
  'ថ្ងៃសុក្រ',    // Friday
  'ថ្ងៃសៅរ៍'     // Saturday
];

const KHMER_MONTHS = [
  'មករា',   // January
  'កុម្ភៈ',   // February
  'មីនា',   // March
  'មេសា',   // April
  'ឧសភា',   // May
  'មិថុនា',  // June
  'កក្កដា',  // July
  'សីហា',   // August
  'កញ្ញា',   // September
  'តុលា',   // October
  'វិច្ឆិកា',  // November
  'ធ្នូ'     // December
];

const KHMER_NUMERALS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

export function toKhmerNumerals(num: number | string): string {
  return String(num).replace(/[0-9]/g, (digit) => KHMER_NUMERALS[parseInt(digit, 10)]);
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

export function formatLocalizedDate(dateInput: string | Date | number, locale: string): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  if (locale === 'km') {
    const weekday = KHMER_WEEKDAYS[date.getDay()];
    const dayNum = toKhmerNumerals(date.getDate());
    const month = KHMER_MONTHS[date.getMonth()];
    const yearNum = toKhmerNumerals(date.getFullYear());
    // Example: ថ្ងៃសុក្រ ទី២០ ខែវិច្ឆិកា ឆ្នាំ២០២៦
    return `${weekday} ទី${dayNum} ខែ${month} ឆ្នាំ${yearNum}`;
  } else {
    // English: Friday, November 20th, 2026
    const day = date.getDate();
    const ordinal = getOrdinalSuffix(day);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${weekday}, ${month} ${day}${ordinal}, ${year}`;
  }
}

export function formatKhmerDateTime(dateInput: string | Date | number): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  // Format in Asia/Phnom_Penh timezone
  const phnomPenhDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }));
  const dayNum = toKhmerNumerals(phnomPenhDate.getDate());
  const month = KHMER_MONTHS[phnomPenhDate.getMonth()];
  const yearNum = toKhmerNumerals(phnomPenhDate.getFullYear());

  const hours = phnomPenhDate.getHours();
  const minutes = phnomPenhDate.getMinutes();
  const minutesStr = toKhmerNumerals(String(minutes).padStart(2, '0'));

  let period = 'ព្រឹក';
  if (hours >= 12 && hours < 17) {
    period = 'រសៀល';
  } else if (hours >= 17 && hours < 20) {
    period = 'ល្ងាច';
  } else if (hours >= 20 || hours < 5) {
    period = 'យប់';
  }

  const hour12 = hours % 12 || 12;
  const hoursStr = toKhmerNumerals(String(hour12).padStart(2, '0'));

  return `ថ្ងៃទី${dayNum} ខែ${month} ឆ្នាំ${yearNum} ម៉ោង ${hoursStr}:${minutesStr} ${period}`;
}
