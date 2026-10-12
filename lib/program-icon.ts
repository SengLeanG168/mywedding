/**
 * Traditional Khmer Wedding Ceremony Program Icons
 * Returns the path to the gold line-art SVG icon matching the ceremony title or manual icon type.
 */
export function getProgramIconSrc(
  title?: string | null,
  iconType?: string | null,
  iconImageUrl?: string | null
): string {
  // 1. Custom uploaded or URL icon has highest priority
  if (iconImageUrl && iconImageUrl.trim()) {
    return iconImageUrl.trim();
  }

  // 2. Manual icon choice if specified
  if (iconType) {
    switch (iconType) {
      case 'prostrate-sampeah-pteah':
      case 'lying-sampeah-pteah':
      case 'sampeah-pteah':
      case 'sampeah':
      case 'pteah':
      case 'phka-sla':
        return '/icons/program/prostrate-sampeah-pteah.svg';
      case 'groom-umbrella-people':
      case 'groom-umbrella':
      case 'umbrella-people':
        return '/icons/program/groom-umbrella-people.svg';
      case 'toast':
      case 'cheers':
      case 'banquet':
        return '/icons/program/toast.svg';
      case 'people-3':
      case 'people':
      case 'gathering':
      case 'relatives':
        return '/icons/program/people-3.svg';
      case 'fruit-basket':
      case 'fruit':
      case 'fruits':
      case 'basket':
        return '/icons/program/fruit-basket.svg';
      case 'food':
      case 'dinner':
        return '/icons/program/food.svg';
      case 'rings':
      case 'ring':
      case 'knot':
        return '/icons/program/rings.svg';
      case 'offering':
      case 'procession':
        return '/icons/program/offering.svg';
      case 'ceremony':
      case 'shrine':
        return '/icons/program/ceremony.svg';
      case 'blessing':
      case 'monk':
        return '/icons/program/blessing.svg';
      case 'scissors':
      case 'haircut':
        return '/icons/program/scissors.svg';
      case 'guests':
      case 'reception':
        return '/icons/program/guests.svg';
      case 'photo':
        return '/icons/program/photo.svg';
      case 'music':
      case 'dance':
        return '/icons/program/music.svg';
      case 'lotus':
      case 'other':
        return '/icons/program/lotus.svg';
      default:
        break;
    }
  }

  const text = (title || '').trim();

  // 2. High priority rule for groom procession with umbrella & companions (ពិធីហែជំនូន (កំណត់) ចូលរោងជ័យ អញ្ជើញភ្ញៀវកិត្តិយសពិសាអាហារពេលព្រឹក)
  if (/ពិធីហែជំនូន|ហែជំនូន|ចូលរោងជ័យ|កំណត់|ពិសាអាហារពេលព្រឹក|អាហារពេលព្រឹក/i.test(text)) {
    return '/icons/program/groom-umbrella-people.svg';
  }

  // 3. High priority rule for dinner / banquet toast (អញ្ជើញភ្ញៀវកិត្តិយសពិសាភោជនាអាហារ / ជប់លៀង)
  if (/ពិសាភោជនាអាហារ|ពិសាអាហារ|ភោជនាអាហារ|លៀងភ្ញៀវ|ជប់លៀង|អាហារពេលល្ងាច|dinner|banquet|toast|cheers/i.test(text)) {
    return '/icons/program/toast.svg';
  }

  // 4. High priority rule for prostrating Sampeah Pteah ceremony (ក្រាបសំពះផ្ទឹម / សំពះផ្ទឹម / សំពះផ្កាស្លាបី)
  if (/ក្រាបសំពះផ្ទឹម|ដេកសំពះផ្ទឹម|សំពះផ្ទឹម|ពិធីសំពះផ្ទឹម|សំពះផ្កាស្លាបី|ផ្កាស្លាបី/i.test(text)) {
    return '/icons/program/prostrate-sampeah-pteah.svg';
  }

  // 5. High priority rule for wedding ring ceremony (ពិធីបំពាក់ចិញ្ចៀន)
  if (/បំពាក់ចិញ្ចៀន|ចិញ្ចៀន|rings?|ring/i.test(text)) {
    return '/icons/program/rings.svg';
  }

  // 5. High priority rule for fruit basket ceremony (ពិធីនិយាយជើងការនិងរៀបរាប់ផ្លែឈើ)
  if (/ពិធីនិយាយជើងការ|និយាយជើងការ|រៀបរាប់ផ្លែឈើ|ផ្លែឈើ|កន្ត្រកផ្លែឈើ|កន្ត្រក|ជើងការ/i.test(text)) {
    return '/icons/program/fruit-basket.svg';
  }

  // 6. High priority rule for gathering / relatives / procession prep (ជួបជុំញាតិមិត្តនិងភ្ញៀវកិត្តិយសរៀបចំហែជំនូន)
  if (/ជួបជុំញាតិមិត្ត|រៀបចំហែជំនូន|ញាតិមិត្ត|ជួបជុំ/i.test(text)) {
    return '/icons/program/people-3.svg';
  }

  // 7. General food rule
  if (/អាហារ|បរិភោគ|ទទួលទាន|food/i.test(text)) {
    return '/icons/program/food.svg';
  }

  // 5. Keyword detection based on traditional Khmer ceremonies
  if (/ហែជំនូន|ដង្ហែ|ជំនូន|ហែ|ចេញដំណើរ|ជូនដំណើរ|ក្បួន/i.test(text)) return '/icons/program/offering.svg';
  if (/សែនក្រុងពាលី|សែន/i.test(text)) return '/icons/program/ceremony.svg';
  if (/ប្រោះព្រំ|សូត្រមន្ត|ប្រសិទ្ធពរ|ព្រះសង្ឃ|សិរីសួស្តី/i.test(text)) return '/icons/program/blessing.svg';
  if (/កាត់សក់/i.test(text)) return '/icons/program/scissors.svg';
  if (/ទទួលភ្ញៀវ|ស្វាគមន៍|ចុះឈ្មោះ/i.test(text)) return '/icons/program/guests.svg';
  if (/ថតរូប|រូបអនុស្សាវរីយ៍|អនុស្សាវរីយ៍|ថត/i.test(text)) return '/icons/program/photo.svg';
  if (/រាំ|តន្ត្រី|កម្សាន្ត|ចម្រៀង|ភ្លេង/i.test(text)) return '/icons/program/music.svg';

  return '/icons/program/lotus.svg';
}

// Backward compatibility alias
export const getProgramItemIcon = getProgramIconSrc;
