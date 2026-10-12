"use client"

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Sparkles, AlertCircle, CheckCircle2, Loader2, Check, X } from 'lucide-react';
import MediaUpload from './MediaUpload';
import GalleryUpload from './GalleryUpload';

const isValidMediaUrl = (url: string) => {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:')
  );
};

export default function EventForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [copiedPreviewUrl, setCopiedPreviewUrl] = useState(false);
  const [copiedKhQrUrl, setCopiedKhQrUrl] = useState(false);
  const [copiedUsdQrUrl, setCopiedUsdQrUrl] = useState(false);
  const [copiedThankYouFrameUrl, setCopiedThankYouFrameUrl] = useState(false);
  const [copiedApologyFrameUrl, setCopiedApologyFrameUrl] = useState(false);

  const [previewUrlError, setPreviewUrlError] = useState('');
  const [khQrUrlError, setKhQrUrlError] = useState('');
  const [usdQrUrlError, setUsdQrUrlError] = useState('');
  const [thankYouFrameUrlError, setThankYouFrameUrlError] = useState('');
  const [apologyFrameUrlError, setApologyFrameUrlError] = useState('');

  const handleCopyText = (text: string, type: 'preview' | 'khQr' | 'usdQr' | 'thankYouFrame' | 'apologyFrame') => {
    if (!text) return;
    navigator.clipboard.writeText(text.trim());
    if (type === 'preview') {
      setCopiedPreviewUrl(true);
      setTimeout(() => setCopiedPreviewUrl(false), 2000);
    } else if (type === 'khQr') {
      setCopiedKhQrUrl(true);
      setTimeout(() => setCopiedKhQrUrl(false), 2000);
    } else if (type === 'usdQr') {
      setCopiedUsdQrUrl(true);
      setTimeout(() => setCopiedUsdQrUrl(false), 2000);
    } else if (type === 'thankYouFrame') {
      setCopiedThankYouFrameUrl(true);
      setTimeout(() => setCopiedThankYouFrameUrl(false), 2000);
    } else if (type === 'apologyFrame') {
      setCopiedApologyFrameUrl(true);
      setTimeout(() => setCopiedApologyFrameUrl(false), 2000);
    }
  };
  
  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    eventType: initialData?.eventType || 'wedding',
    eventTitle: initialData?.eventTitle || '',
    eventSubtitle: initialData?.eventSubtitle || '',
    hostName: initialData?.hostName || '',
    celebrantName: initialData?.celebrantName || '',
    brideNameKm: initialData?.brideNameKm || '',
    brideNameEn: initialData?.brideNameEn || '',
    groomNameKm: initialData?.groomNameKm || '',
    groomNameEn: initialData?.groomNameEn || '',
    eventDate: initialData?.eventDate ? new Date(initialData.eventDate).toISOString().split('T')[0] : '',
    eventTime: initialData?.eventTime || '',
    locationNameKm: initialData?.locationNameKm || '',
    locationNameEn: initialData?.locationNameEn || '',
    locationAddressKm: initialData?.locationAddressKm || '',
    locationAddressEn: initialData?.locationAddressEn || '',
    googleMapUrl: initialData?.googleMapUrl || '',
    coverImage: initialData?.coverImage || '',
    invitationMessageKm: initialData?.invitationMessageKm || '',
    invitationMessageEn: initialData?.invitationMessageEn || '',
    theme: initialData?.theme || 'Classic Khmer Wedding',
    musicUrl: initialData?.musicUrl || '',
    musicTitle: initialData?.musicTitle || '',
    heroVideoUrl: initialData?.heroVideoUrl || '',
    heroVideoType: initialData?.heroVideoType || 'file',
    heroVideoPosterUrl: initialData?.heroVideoPosterUrl || '',
    showHeroVideo: initialData?.showHeroVideo !== undefined ? initialData.showHeroVideo : false,
    transitionVideoUrl: initialData?.transitionVideoUrl || '',
    showTransitionVideo: initialData?.showTransitionVideo !== undefined ? initialData.showTransitionVideo : true,
    openingImageUrl: initialData?.openingImageUrl || '',
    openingCoupleNamesImageUrl: initialData?.openingCoupleNamesImageUrl || '',
    openingGuestImageUrl: initialData?.openingGuestImageUrl || '',
    openingTitleKm: initialData?.openingTitleKm || '',
    openingTitleEn: initialData?.openingTitleEn || '',
    openingMessageKm: initialData?.openingMessageKm || '',
    openingMessageEn: initialData?.openingMessageEn || '',
    showOpeningScreen: initialData?.showOpeningScreen !== undefined ? initialData.showOpeningScreen : true,
    showCurtainIntro: initialData?.showCurtainIntro !== undefined ? initialData.showCurtainIntro : true,
    curtainIntroType: initialData?.curtainIntroType || 'css',
    curtainIntroVideoUrl: initialData?.curtainIntroVideoUrl || '',
    allowSkipCurtainIntro: initialData?.allowSkipCurtainIntro !== undefined ? initialData.allowSkipCurtainIntro : true,
    galleryImages: Array.isArray(initialData?.galleryImages) ? (initialData.galleryImages as string[]) : [],
    galleryVideoUrl: initialData?.galleryVideoUrl || '',
    
    // Traditional Invitation Details
    blessingTitleKm: initialData?.blessingTitleKm || '',
    blessingTitleEn: initialData?.blessingTitleEn || '',
    groomFatherNameKm: initialData?.groomFatherNameKm || '',
    groomFatherNameEn: initialData?.groomFatherNameEn || '',
    groomMotherNameKm: initialData?.groomMotherNameKm || '',
    groomMotherNameEn: initialData?.groomMotherNameEn || '',
    brideFatherNameKm: initialData?.brideFatherNameKm || '',
    brideFatherNameEn: initialData?.brideFatherNameEn || '',
    brideMotherNameKm: initialData?.brideMotherNameKm || '',
    brideMotherNameEn: initialData?.brideMotherNameEn || '',
    formalInvitationTextKm: initialData?.formalInvitationTextKm || '',
    formalInvitationTextEn: initialData?.formalInvitationTextEn || '',
    couplePhotoUrl: initialData?.couplePhotoUrl || '',
    coupleMonogramImageUrl: initialData?.coupleMonogramImageUrl || '',
    showTraditionalInvitationSection: initialData?.showTraditionalInvitationSection !== undefined ? initialData.showTraditionalInvitationSection : true,
    
    // QR Code & Gift Settings
    showMapQrCode: initialData?.showMapQrCode !== undefined ? initialData.showMapQrCode : true,
    showGuestNameInSharePreview: initialData?.showGuestNameInSharePreview !== undefined ? initialData.showGuestNameInSharePreview : true,
    socialPreviewImageUrl: initialData?.socialPreviewImageUrl || '',
    showGiftQrCode: initialData?.showGiftQrCode !== undefined ? initialData.showGiftQrCode : false,
    giftQrImageUrl: initialData?.giftQrImageUrl || '',
    giftQrKhImageUrl: initialData?.giftQrKhImageUrl || '',
    giftQrUsdImageUrl: initialData?.giftQrUsdImageUrl || '',
    giftQrTitleKm: (initialData?.giftQrTitleKm && initialData.giftQrTitleKm !== 'ចងដៃតាម QR Code') ? initialData.giftQrTitleKm : 'KHQR',
    giftQrTitleEn: (initialData?.giftQrTitleEn && initialData.giftQrTitleEn !== 'Wedding Gift QR Code') ? initialData.giftQrTitleEn : 'KHQR',
    giftQrNoteKm: initialData?.giftQrNoteKm || 'សូមអរគុណសម្រាប់ការចូលរួម និងការជូនពរ',
    giftQrNoteEn: initialData?.giftQrNoteEn || 'Thank you for your presence and blessings',
    giftBankName: initialData?.giftBankName || '',
    giftAccountName: initialData?.giftAccountName || '',
    giftAccountNumber: initialData?.giftAccountNumber || '',
    giftKhBankName: initialData?.giftKhBankName || '',
    giftKhAccountName: initialData?.giftKhAccountName || '',
    giftKhAccountNumber: initialData?.giftKhAccountNumber || '',
    giftUsdBankName: initialData?.giftUsdBankName || '',
    giftUsdAccountName: initialData?.giftUsdAccountName || '',
    giftUsdAccountNumber: initialData?.giftUsdAccountNumber || '',

    // Thank You & Apology Letters
    showThankYouLetter: initialData?.showThankYouLetter !== undefined ? initialData.showThankYouLetter : true,
    thankYouTitleKm: initialData?.thankYouTitleKm || '',
    thankYouTitleEn: initialData?.thankYouTitleEn || '',
    thankYouTextKm: initialData?.thankYouTextKm || '',
    thankYouTextEn: initialData?.thankYouTextEn || '',
    thankYouFrameImageUrl: initialData?.thankYouFrameImageUrl || '',

    showApologyLetter: initialData?.showApologyLetter !== undefined ? initialData.showApologyLetter : true,
    apologyTitleKm: initialData?.apologyTitleKm || '',
    apologyTitleEn: initialData?.apologyTitleEn || '',
    apologyTextKm: initialData?.apologyTextKm || '',
    apologyTextEn: initialData?.apologyTextEn || '',
    apologyFrameImageUrl: initialData?.apologyFrameImageUrl || '',
  });

  const handleAutoGenerateSlug = () => {
    let candidate = '';
    if (formData.eventType === 'wedding') {
      const cleanGroom = (formData.groomNameEn || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const cleanBride = (formData.brideNameEn || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (cleanGroom && cleanBride) {
        candidate = `${cleanGroom}-${cleanBride}`;
      } else if (cleanGroom) {
        candidate = cleanGroom;
      } else if (cleanBride) {
        candidate = cleanBride;
      }
    }

    if (!candidate && formData.eventTitle) {
      candidate = formData.eventTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (!candidate && formData.celebrantName) {
      candidate = formData.celebrantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    if (!candidate) {
      candidate = `${formData.eventType || 'event'}-${Date.now().toString(36)}`;
    }
    setFormData(prev => ({ ...prev, slug: candidate }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate media URLs
    if (formData.socialPreviewImageUrl && !isValidMediaUrl(formData.socialPreviewImageUrl)) {
      setError('សូមបញ្ចូល URL រូបភាព Preview ឱ្យបានត្រឹមត្រូវ');
      return;
    }
    if (formData.giftQrKhImageUrl && !isValidMediaUrl(formData.giftQrKhImageUrl)) {
      setError('សូមបញ្ចូល URL KHQR ប្រាក់រៀល ឱ្យបានត្រឹមត្រូវ');
      return;
    }
    if (formData.giftQrUsdImageUrl && !isValidMediaUrl(formData.giftQrUsdImageUrl)) {
      setError('សូមបញ្ចូល URL KHQR ប្រាក់ដុល្លារ ឱ្យបានត្រឹមត្រូវ');
      return;
    }
    if (formData.thankYouFrameImageUrl && !isValidMediaUrl(formData.thankYouFrameImageUrl)) {
      setError('សូមបញ្ចូល URL ស៊ុមលិខិតថ្លែងអំណរគុណ ឱ្យបានត្រឹមត្រូវ');
      return;
    }
    if (formData.apologyFrameImageUrl && !isValidMediaUrl(formData.apologyFrameImageUrl)) {
      setError('សូមបញ្ចូល URL ស៊ុមលិខិតសូមអភ័យទោស ឱ្យបានត្រឹមត្រូវ');
      return;
    }

    setLoading(true);

    const url = initialData ? `/api/events/${initialData.id}` : '/api/events';
    const method = initialData ? 'PUT' : 'POST';

    try {
      let slugCandidate = formData.slug ? formData.slug.trim() : '';
      if (!slugCandidate && !initialData) {
        if (formData.eventType === 'wedding') {
          const cleanGroom = (formData.groomNameEn || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const cleanBride = (formData.brideNameEn || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          slugCandidate = (cleanGroom && cleanBride) ? `${cleanGroom}-${cleanBride}` : (cleanGroom || cleanBride || `wedding-${Date.now().toString(36)}`);
        } else if (formData.eventTitle) {
          slugCandidate = formData.eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        } else if (formData.celebrantName) {
          slugCandidate = formData.celebrantName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        } else {
          slugCandidate = `${formData.eventType || 'event'}-${Date.now().toString(36)}`;
        }
      }

      const payload = {
        ...formData,
        slug: slugCandidate,
        socialPreviewImageUrl: formData.socialPreviewImageUrl ? formData.socialPreviewImageUrl.trim() : null,
        giftQrKhImageUrl: formData.giftQrKhImageUrl ? formData.giftQrKhImageUrl.trim() : null,
        giftQrUsdImageUrl: formData.giftQrUsdImageUrl ? formData.giftQrUsdImageUrl.trim() : null,
        giftQrImageUrl: (formData.giftQrKhImageUrl || formData.giftQrImageUrl) ? (formData.giftQrKhImageUrl || formData.giftQrImageUrl).trim() : null,
        thankYouFrameImageUrl: typeof formData.thankYouFrameImageUrl === 'string' && formData.thankYouFrameImageUrl.trim() ? formData.thankYouFrameImageUrl.trim() : null,
        apologyFrameImageUrl: typeof formData.apologyFrameImageUrl === 'string' && formData.apologyFrameImageUrl.trim() ? formData.apologyFrameImageUrl.trim() : null,
        galleryVideoUrl: formData.galleryVideoUrl ? formData.galleryVideoUrl.trim() : null,
        openingCoupleNamesImageUrl: formData.openingCoupleNamesImageUrl ? formData.openingCoupleNamesImageUrl.trim() : null,
        openingGuestImageUrl: formData.openingGuestImageUrl ? formData.openingGuestImageUrl.trim() : null,
        coupleMonogramImageUrl: formData.coupleMonogramImageUrl ? formData.coupleMonogramImageUrl.trim() : null,
        transitionVideoUrl: formData.transitionVideoUrl ? formData.transitionVideoUrl.trim() : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      let responseData: any = null;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch {
        responseData = responseText;
      }

      if (!response.ok) {
        console.error("Save event failed:", {
          status: response.status,
          statusText: response.statusText,
          responseText,
          responseData,
          payload,
        });

        const errorMsg =
          responseData?.error ||
          responseData?.message ||
          (typeof responseData === 'string' && responseData.trim() && responseData.trim() !== '{}' ? responseData.trim() : null) ||
          (responseText && responseText.trim() && responseText.trim() !== '{}' ? responseText.trim() : null) ||
          `Save event failed with status ${response.status}`;

        throw new Error(errorMsg);
      }

      setSuccess('បានរក្សាទុកកម្មវិធីដោយជោគជ័យ!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 600);
    } catch (err: any) {
      console.error('Save event error:', err);
      setError(err?.message || 'មានបញ្ហាបណ្តាញពេលរក្សាទុកកម្មវិធី');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-destructive font-medium">{error}</div>}
      
      {/* General Event Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ព័ត៌មានទូទៅនៃកម្មវិធី</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold">ប្រភេទកម្មវិធី</label>
            <select
              name="eventType"
              value={formData.eventType || 'wedding'}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="wedding">មង្គលការ</option>
              <option value="ceremony">បុណ្យ</option>
              <option value="birthday">ខួបកំណើត</option>
              <option value="party">កម្មវិធីជប់លៀង</option>
              <option value="other">ផ្សេងៗ</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">តំណភ្ជាប់ URL (Slug)</label>
              <button
                type="button"
                onClick={handleAutoGenerateSlug}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium cursor-pointer"
                title="បង្កើត Slug ស្វ័យប្រវត្តិ"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>បង្កើតស្វ័យប្រវត្តិ</span>
              </button>
            </div>
            <Input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="ឧ. sok-bora (ឬទុកទទេដើម្បីបង្កើតស្វ័យប្រវត្តិ)"
            />
            <p className="text-[11px] text-muted-foreground">
              តំណភ្ជាប់ទំព័រធៀបនឹងមានទម្រង់៖ /invite/<strong>{formData.slug || 'slug-ស្វ័យប្រវត្តិ'}</strong>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ចំណងជើងកម្មវិធី</label>
            <Input 
              name="eventTitle" 
              value={formData.eventTitle || ''} 
              onChange={handleChange} 
              placeholder={
                formData.eventType === 'wedding' 
                  ? 'ឧ. សិរីសួស្តីជ័យមង្គលអាពាហ៍ពិពាហ៍' 
                  : formData.eventType === 'birthday'
                  ? 'ឧ. ពិធីខួបកំណើត'
                  : formData.eventType === 'ceremony'
                  ? 'ឧ. ពិធីបុណ្យបំបួសកុលបុត្រ'
                  : formData.eventType === 'party'
                  ? 'ឧ. កម្មវិធីជប់លៀងឆ្លងឆ្នាំ'
                  : 'ឧ. កម្មវិធីពិសេស'
              } 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ចំណងជើងរង</label>
            <Input 
              name="eventSubtitle" 
              value={formData.eventSubtitle || ''} 
              onChange={handleChange} 
              placeholder="ឧ. សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយសទាំងអស់..." 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ឈ្មោះម្ចាស់កម្មវិធី / អ្នករៀបចំ</label>
            <Input 
              name="hostName" 
              value={formData.hostName || ''} 
              onChange={handleChange} 
              placeholder="ឧ. ហេង សេងលៀង និង ល័ក្ខ ចលនា" 
            />
          </div>

          {formData.eventType === 'birthday' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">ឈ្មោះម្ចាស់ខួប</label>
              <Input 
                name="celebrantName" 
                value={formData.celebrantName || ''} 
                onChange={handleChange} 
                placeholder="ឧ. សេងលៀង" 
              />
            </div>
          )}

          {formData.eventType !== 'wedding' && formData.eventType !== 'birthday' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">ឈ្មោះបុគ្គលសំខាន់ / ម្ចាស់កម្មវិធី</label>
              <Input 
                name="celebrantName" 
                value={formData.celebrantName || ''} 
                onChange={handleChange} 
                placeholder="ឧ. ឈ្មោះបុគ្គលសំខាន់ (ប្រសិនបើមាន)" 
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">កាលបរិច្ឆេទកម្មវិធី</label>
            <Input type="date" name="eventDate" required value={formData.eventDate ? new Date(formData.eventDate).toISOString().split('T')[0] : ''} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ពេលវេលាកម្មវិធី</label>
            <Input type="time" name="eventTime" required value={formData.eventTime} onChange={handleChange} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">រូបភាពក្រប</label>
            <MediaUpload
              type="image"
              value={formData.coverImage}
              onChange={(path) => setFormData(prev => ({ ...prev, coverImage: path }))}
            />
            <Input name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="ឬបញ្ចូល URL រូបភាពក្របពីខាងក្រៅ..." className="mt-2 text-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">វិចិត្រសាលរូបភាព</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Gallery Video Upload */}
          <div className="space-y-2 pb-6 border-b">
            <label className="text-sm font-medium">វីដេអូវិចិត្រសាល</label>
            <p className="text-xs text-muted-foreground">
              បង្ហោះវីដេអូផ្ដេកសម្រាប់បង្ហាញនៅខាងលើរូបភាពក្នុងផ្នែកវិចិត្រសាល។
            </p>
            <MediaUpload
              type="video"
              value={formData.galleryVideoUrl}
              onChange={(path) => setFormData(prev => ({ ...prev, galleryVideoUrl: path }))}
              uploadButtonText="បង្ហោះវីដេអូវិចិត្រសាល"
              viewButtonText="មើលវីដេអូ"
              removeButtonText="លុបវីដេអូ"
            />
            <Input
              name="galleryVideoUrl"
              value={formData.galleryVideoUrl}
              onChange={handleChange}
              placeholder="ឬបញ្ចូល URL វីដេអូវិចិត្រសាលពីខាងក្រៅ..."
              className="mt-2 text-xs"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">វិចិត្រសាលរូបភាព</label>
            <GalleryUpload
              value={formData.galleryImages}
              onChange={(paths) => setFormData(prev => ({ ...prev, galleryImages: paths }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Couple Info Card - ONLY for wedding */}
      {formData.eventType === 'wedding' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ព័ត៌មានកូនកម្លោះ និង កូនក្រមុំ</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ឈ្មោះកូនក្រមុំ (ខ្មែរ)</label>
              <Input name="brideNameKm" required value={formData.brideNameKm} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ឈ្មោះកូនក្រមុំ (អង់គ្លេស)</label>
              <Input name="brideNameEn" required value={formData.brideNameEn} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ឈ្មោះកូនកម្លោះ (ខ្មែរ)</label>
              <Input name="groomNameKm" required value={formData.groomNameKm} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ឈ្មោះកូនកម្លោះ (អង់គ្លេស)</label>
              <Input name="groomNameEn" required value={formData.groomNameEn} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traditional Invitation Details - ONLY for wedding */}
      {formData.eventType === 'wedding' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ព័ត៌មានលម្អិតពិធីមង្គលការប្រពៃណី</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showTraditionalInvitationSection"
                name="showTraditionalInvitationSection"
                checked={formData.showTraditionalInvitationSection}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showTraditionalInvitationSection" className="text-sm font-medium">
                បង្ហាញផ្នែកព័ត៌មានលម្អិតពិធីមង្គលការប្រពៃណី
              </label>
            </div>

            {formData.showTraditionalInvitationSection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ពិធីសិរីសួស្តីជ័យមង្គល (ខ្មែរ)</label>
                  <Input name="blessingTitleKm" value={formData.blessingTitleKm} onChange={handleChange} placeholder="សិរីសួស្ដីជ័យមង្គលអាពាហ៍ពិពាហ៍" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ពិធីសិរីសួស្តីជ័យមង្គល (អង់គ្លេស)</label>
                  <Input name="blessingTitleEn" value={formData.blessingTitleEn} onChange={handleChange} placeholder="Wedding Blessing Ceremony" />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase">មាតាបិតាខាងកូនកម្លោះ</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ឪពុក (ខ្មែរ)</label>
                  <Input name="groomFatherNameKm" value={formData.groomFatherNameKm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ឪពុក (អង់គ្លេស)</label>
                  <Input name="groomFatherNameEn" value={formData.groomFatherNameEn} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ម្តាយ (ខ្មែរ)</label>
                  <Input name="groomMotherNameKm" value={formData.groomMotherNameKm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ម្តាយ (អង់គ្លេស)</label>
                  <Input name="groomMotherNameEn" value={formData.groomMotherNameEn} onChange={handleChange} />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase">មាតាបិតាខាងកូនក្រមុំ</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ឪពុក (ខ្មែរ)</label>
                  <Input name="brideFatherNameKm" value={formData.brideFatherNameKm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ឪពុក (អង់គ្លេស)</label>
                  <Input name="brideFatherNameEn" value={formData.brideFatherNameEn} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ម្តាយ (ខ្មែរ)</label>
                  <Input name="brideMotherNameKm" value={formData.brideMotherNameKm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ម្តាយ (អង់គ្លេស)</label>
                  <Input name="brideMotherNameEn" value={formData.brideMotherNameEn} onChange={handleChange} />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase">អត្ថបទគោរពអញ្ជើញផ្លូវការ</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">អត្ថបទគោរពអញ្ជើញផ្លូវការ (ខ្មែរ)</label>
                  <textarea 
                    name="formalInvitationTextKm" 
                    value={formData.formalInvitationTextKm} 
                    onChange={handleChange}
                    placeholder="ឯកឧត្តម លោកឧកញ៉ា លោកជំទាវ លោក លោកស្រី..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">អត្ថបទគោរពអញ្ជើញផ្លូវការ (អង់គ្លេស)</label>
                  <textarea 
                    name="formalInvitationTextEn" 
                    value={formData.formalInvitationTextEn} 
                    onChange={handleChange}
                    placeholder="We are delighted to respectfully invite you..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2 md:col-span-2 pt-4 border-t">
                  <label className="text-sm font-medium">រូបថតគូស្នេហ៍</label>
                  <MediaUpload
                    type="image"
                    value={formData.couplePhotoUrl || ''}
                    onChange={(path) => setFormData(prev => ({ ...prev, couplePhotoUrl: path }))}
                  />
                  <Input name="couplePhotoUrl" value={formData.couplePhotoUrl || ''} onChange={handleChange} placeholder="ឬបញ្ចូល URL រូបថតពីខាងក្រៅ..." className="mt-2 text-xs" />
                </div>

                {/* Couple Monogram Logo Upload Section */}
                <div className="space-y-3 md:col-span-2 pt-4 border-t">
                  <div>
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      ឡូហ្គោឈ្មោះកូនកម្លោះកូនក្រមុំ
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      បង្ហោះរូបភាពឡូហ្គោឈ្មោះ (PNG/SVG transparent) សម្រាប់បង្ហាញលើធៀប
                    </p>
                  </div>

                  <MediaUpload
                    type="image"
                    value={formData.coupleMonogramImageUrl || ''}
                    onChange={(path) => setFormData(prev => ({ ...prev, coupleMonogramImageUrl: path }))}
                  />

                  <div className="flex items-center gap-2 mt-2">
                    <Input 
                      name="coupleMonogramImageUrl" 
                      value={formData.coupleMonogramImageUrl || ''} 
                      onChange={handleChange} 
                      placeholder="https://... (PNG/SVG URL)" 
                      className="text-xs" 
                    />
                    {formData.coupleMonogramImageUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(formData.coupleMonogramImageUrl, '_blank')}
                        className="shrink-0 text-xs gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        បើករូបភាព
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Thank You and Apology Letters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">លិខិតថ្លែងអំណរគុណ និងសូមអភ័យទោស</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          {/* Thank You Letter */}
          <div className="space-y-4 p-4 border rounded-xl bg-card">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showThankYouLetter"
                name="showThankYouLetter"
                checked={formData.showThankYouLetter}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showThankYouLetter" className="text-sm font-bold">
                បង្ហាញលិខិតថ្លែងអំណរគុណ
              </label>
            </div>

            {formData.showThankYouLetter && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ចំណងជើងលិខិត (ខ្មែរ)</label>
                    <Input name="thankYouTitleKm" value={formData.thankYouTitleKm} onChange={handleChange} placeholder="លិខិតថ្លែងអំណរគុណ" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ចំណងជើងលិខិត (អង់គ្លេស)</label>
                    <Input name="thankYouTitleEn" value={formData.thankYouTitleEn} onChange={handleChange} placeholder="Thank You Letter" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ខ្លឹមសារលិខិត (ខ្មែរ)</label>
                    <textarea
                      name="thankYouTextKm"
                      value={formData.thankYouTextKm}
                      onChange={handleChange}
                      placeholder="យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅ..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ខ្លឹមសារលិខិត (អង់គ្លេស)</label>
                    <textarea
                      name="thankYouTextEn"
                      value={formData.thankYouTextEn}
                      onChange={handleChange}
                      placeholder="We sincerely thank all honored guests..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>

                {/* Custom Thank You Frame Media Field */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">ស៊ុមលិខិតថ្លែងអំណរគុណ</label>
                    <p className="text-xs text-muted-foreground">
                      សូម upload រូបស៊ុមផ្ទាល់ខ្លួនសម្រាប់លិខិតថ្លែងអំណរគុណ។ សូមប្រើរូប PNG/WebP ដែលមាន background transparent ប្រសិនបើអាចធ្វើបាន។
                    </p>
                  </div>

                  <MediaUpload
                    type="image"
                    value={formData.thankYouFrameImageUrl}
                    onChange={(url) => {
                      setFormData((prev) => ({ ...prev, thankYouFrameImageUrl: url }));
                      if (url && !isValidMediaUrl(url)) {
                        setThankYouFrameUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                      } else {
                        setThankYouFrameUrlError('');
                      }
                    }}
                    label="បង្ហោះរូបភាពស៊ុម"
                    uploadButtonText="Upload រូបស៊ុម (PNG, WEBP, SVG, JPG)"
                  />

                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-medium text-muted-foreground">URL ស៊ុមលិខិតថ្លែងអំណរគុណ</label>
                    <div className="flex items-center gap-2">
                      <Input
                        name="thankYouFrameImageUrl"
                        value={formData.thankYouFrameImageUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const trimmed = val.trim();
                          if (trimmed && !isValidMediaUrl(trimmed)) {
                            setThankYouFrameUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                          } else {
                            setThankYouFrameUrlError('');
                          }
                          setFormData((prev) => ({ ...prev, thankYouFrameImageUrl: val }));
                        }}
                        placeholder="https://media.leangna.online/images/frames/thank-you-frame.png"
                        className="font-mono text-xs flex-1"
                      />
                      {formData.thankYouFrameImageUrl ? (
                        <>
                          <a
                            href={formData.thankYouFrameImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 shrink-0 gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            មើល
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyText(formData.thankYouFrameImageUrl, 'thankYouFrame')}
                            className="shrink-0 text-xs gap-1 h-9 px-3"
                          >
                            {copiedThankYouFrameUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedThankYouFrameUrl ? 'បានចម្លង' : 'ចម្លង URL'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, thankYouFrameImageUrl: '' }));
                              setThankYouFrameUrlError('');
                            }}
                            className="shrink-0 text-xs text-destructive hover:bg-destructive/10 h-9 px-2.5 gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            ដកចេញ
                          </Button>
                        </>
                      ) : null}
                    </div>
                    {thankYouFrameUrlError && (
                      <p className="text-xs text-destructive font-medium">{thankYouFrameUrlError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Apology Letter */}
          <div className="space-y-4 p-4 border rounded-xl bg-card">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showApologyLetter"
                name="showApologyLetter"
                checked={formData.showApologyLetter}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showApologyLetter" className="text-sm font-bold">
                បង្ហាញលិខិតសូមអភ័យទោស
              </label>
            </div>

            {formData.showApologyLetter && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ចំណងជើងលិខិត (ខ្មែរ)</label>
                    <Input name="apologyTitleKm" value={formData.apologyTitleKm} onChange={handleChange} placeholder="លិខិតសូមអភ័យទោស" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ចំណងជើងលិខិត (អង់គ្លេស)</label>
                    <Input name="apologyTitleEn" value={formData.apologyTitleEn} onChange={handleChange} placeholder="Apology Letter" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ខ្លឹមសារលិខិត (ខ្មែរ)</label>
                    <textarea
                      name="apologyTextKm"
                      value={formData.apologyTextKm}
                      onChange={handleChange}
                      placeholder="ក្នុងឱកាសពិធីមង្គលអាពាហ៍ពិពាហ៍នេះ..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ខ្លឹមសារលិខិត (អង់គ្លេស)</label>
                    <textarea
                      name="apologyTextEn"
                      value={formData.apologyTextEn}
                      onChange={handleChange}
                      placeholder="If there are any shortcomings..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>

                {/* Custom Apology Frame Media Field */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-foreground">ស៊ុមលិខិតសូមអភ័យទោស</label>
                    <p className="text-xs text-muted-foreground">
                      សូម upload រូបស៊ុមផ្ទាល់ខ្លួនសម្រាប់លិខិតសូមអភ័យទោស។ សូមប្រើរូប PNG/WebP ដែលមាន background transparent ប្រសិនបើអាចធ្វើបាន។
                    </p>
                  </div>

                  <MediaUpload
                    type="image"
                    value={formData.apologyFrameImageUrl}
                    onChange={(url) => {
                      setFormData((prev) => ({ ...prev, apologyFrameImageUrl: url }));
                      if (url && !isValidMediaUrl(url)) {
                        setApologyFrameUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                      } else {
                        setApologyFrameUrlError('');
                      }
                    }}
                    label="បង្ហោះរូបភាពស៊ុម"
                    uploadButtonText="Upload រូបស៊ុម (PNG, WEBP, SVG, JPG)"
                  />

                  <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-medium text-muted-foreground">URL ស៊ុមលិខិតសូមអភ័យទោស</label>
                    <div className="flex items-center gap-2">
                      <Input
                        name="apologyFrameImageUrl"
                        value={formData.apologyFrameImageUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const trimmed = val.trim();
                          if (trimmed && !isValidMediaUrl(trimmed)) {
                            setApologyFrameUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                          } else {
                            setApologyFrameUrlError('');
                          }
                          setFormData((prev) => ({ ...prev, apologyFrameImageUrl: val }));
                        }}
                        placeholder="https://media.leangna.online/images/frames/apology-frame.png"
                        className="font-mono text-xs flex-1"
                      />
                      {formData.apologyFrameImageUrl ? (
                        <>
                          <a
                            href={formData.apologyFrameImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 shrink-0 gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            មើល
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyText(formData.apologyFrameImageUrl, 'apologyFrame')}
                            className="shrink-0 text-xs gap-1 h-9 px-3"
                          >
                            {copiedApologyFrameUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedApologyFrameUrl ? 'បានចម្លង' : 'ចម្លង URL'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData((prev) => ({ ...prev, apologyFrameImageUrl: '' }));
                              setApologyFrameUrlError('');
                            }}
                            className="shrink-0 text-xs text-destructive hover:bg-destructive/10 h-9 px-2.5 gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            ដកចេញ
                          </Button>
                        </>
                      ) : null}
                    </div>
                    {apologyFrameUrlError && (
                      <p className="text-xs text-destructive font-medium">{apologyFrameUrlError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ឈ្មោះទីតាំង (ខ្មែរ)</label>
            <Input name="locationNameKm" required value={formData.locationNameKm} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ឈ្មោះទីតាំង (អង់គ្លេស)</label>
            <Input name="locationNameEn" required value={formData.locationNameEn} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">អាសយដ្ឋានទីតាំង (ខ្មែរ)</label>
            <Input name="locationAddressKm" required value={formData.locationAddressKm} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">អាសយដ្ឋានទីតាំង (អង់គ្លេស)</label>
            <Input name="locationAddressEn" required value={formData.locationAddressEn} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">តំណភ្ជាប់ Google Maps</label>
            <Input name="googleMapUrl" value={formData.googleMapUrl} onChange={handleChange} placeholder="https://goo.gl/maps/..." />
          </div>
          <div className="space-y-2 md:col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="showMapQrCode"
              name="showMapQrCode"
              checked={formData.showMapQrCode}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showMapQrCode" className="text-sm font-medium">
              បង្ហាញ QR Code ទីតាំងលើផែនទី
            </label>
          </div>
          <div className="space-y-2 md:col-span-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="showGuestNameInSharePreview"
              name="showGuestNameInSharePreview"
              checked={formData.showGuestNameInSharePreview}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showGuestNameInSharePreview" className="text-sm font-medium">
              បង្ហាញឈ្មោះភ្ញៀវក្នុងផ្ទាំង Preview ពេលចែករំលែកតំណ
            </label>
          </div>
          <div className="space-y-3 md:col-span-2 pt-3 border-t">
            <label className="text-sm font-semibold block">រូបភាព Preview ពេលចែករំលែកតំណ</label>
            <p className="text-xs text-muted-foreground">រូបភាពនេះនឹងបង្ហាញពេលផ្ញើតំណអញ្ជើញលើ Telegram / Messenger / Facebook</p>
            <p className="text-xs text-amber-600 font-medium">ទំហំដែលណែនាំ: 1200 x 630 px</p>
            <p className="text-xs text-emerald-600 font-medium">អាចបង្ហោះរូប ឬដាក់ public HTTPS URL ពី Hostinger media subdomain/CDN។</p>
            
            <MediaUpload
              type="image"
              value={formData.socialPreviewImageUrl}
              onChange={(url) => {
                setFormData((prev) => ({ ...prev, socialPreviewImageUrl: url }));
                if (url && !isValidMediaUrl(url)) {
                  setPreviewUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                } else {
                  setPreviewUrlError('');
                }
              }}
              label="បង្ហោះរូបភាព Preview"
              autoOptimizeSocialPreview={true}
            />

            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-medium text-muted-foreground">URL រូបភាព Preview</label>
              <div className="flex items-center gap-2">
                <Input
                  name="socialPreviewImageUrl"
                  value={formData.socialPreviewImageUrl || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const trimmed = val.trim();
                    if (trimmed && !isValidMediaUrl(trimmed)) {
                      setPreviewUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                    } else {
                      setPreviewUrlError('');
                    }
                    setFormData((prev) => ({ ...prev, socialPreviewImageUrl: val }));
                  }}
                  placeholder="https://media.leangna.online/images/preview/social-preview.webp"
                  className="font-mono text-xs flex-1"
                />
                {formData.socialPreviewImageUrl ? (
                  <>
                    <a
                      href={formData.socialPreviewImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 shrink-0 gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      មើល
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyText(formData.socialPreviewImageUrl, 'preview')}
                      className="shrink-0 text-xs gap-1 h-9 px-3"
                    >
                      {copiedPreviewUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedPreviewUrl ? 'បានចម្លង' : 'ចម្លង URL'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, socialPreviewImageUrl: '' }));
                        setPreviewUrlError('');
                      }}
                      className="shrink-0 text-xs text-destructive hover:bg-destructive/10 h-9 px-2.5 gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      ដកចេញ
                    </Button>
                  </>
                ) : null}
              </div>
              {previewUrlError && (
                <p className="text-xs text-destructive font-medium">{previewUrlError}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">សារអញ្ជើញ (ខ្មែរ)</label>
            <textarea 
              name="invitationMessageKm" 
              value={formData.invitationMessageKm} 
              onChange={handleChange}
              placeholder="សូមគោរពអញ្ជើញភ្ញៀវកិត្តិយសទាំងអស់..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">សារអញ្ជើញ (អង់គ្លេស)</label>
            <textarea 
              name="invitationMessageEn" 
              value={formData.invitationMessageEn} 
              onChange={handleChange}
              placeholder="We are honored to invite you..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ការកំណត់មេឌៀ (វីដេអូ / តន្ត្រី)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm text-muted-foreground mb-4">បន្ថែមវីដេអូសម្រាប់បង្ហាញលើទំព័រដើម</p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="showHeroVideo"
                name="showHeroVideo"
                checked={formData.showHeroVideo}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showHeroVideo" className="text-sm font-medium">បង្ហាញវីដេអូដើម (Hero Video)</label>
            </div>
          </div>
          {formData.showHeroVideo && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">ប្រភេទវីដេអូ</label>
                <select
                  name="heroVideoType"
                  value={formData.heroVideoType || 'none'}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="youtube">YouTube Embed</option>
                  <option value="none">គ្មាន</option>
                </select>
              </div>

              {formData.heroVideoType === 'mp4' && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">វីដេអូ Hero</label>
                    <MediaUpload
                      type="video"
                      value={formData.heroVideoUrl || ''}
                      onChange={(path) => setFormData(prev => ({ ...prev, heroVideoUrl: path }))}
                    />
                    <Input name="heroVideoUrl" value={formData.heroVideoUrl || ''} onChange={handleChange} placeholder="ឬបញ្ចូល URL វីដេអូពីខាងក្រៅ..." className="mt-2 text-xs" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">រូបភាព Poster វីដេអូ Hero</label>
                    <MediaUpload
                      type="image"
                      value={formData.heroVideoPosterUrl || ''}
                      onChange={(path) => setFormData(prev => ({ ...prev, heroVideoPosterUrl: path }))}
                    />
                    <Input name="heroVideoPosterUrl" value={formData.heroVideoPosterUrl || ''} onChange={handleChange} placeholder="ឬបញ្ចូល URL រូបភាព Poster ពីខាងក្រៅ..." className="mt-2 text-xs" />
                  </div>
                </>
              )}

              {formData.heroVideoType === 'youtube' && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">តំណ YouTube</label>
                  <Input name="heroVideoUrl" value={formData.heroVideoUrl || ''} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              )}
            </>
          )}

          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">បន្ថែមតន្ត្រីកំដរពិធីមង្គលការ</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">តន្ត្រីកំដរ (Background Music)</label>
            <MediaUpload
              type="audio"
              value={formData.musicUrl || ''}
              onChange={(path) => setFormData(prev => ({ ...prev, musicUrl: path }))}
            />
            <Input name="musicUrl" value={formData.musicUrl || ''} onChange={handleChange} placeholder="ឬបញ្ចូល URL បទចម្រៀងពីខាងក្រៅ..." className="mt-2 text-xs" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">ចំណងជើងបទចម្រៀង</label>
            <Input name="musicTitle" value={formData.musicTitle || ''} onChange={handleChange} placeholder="ចំណងជើងបទចម្រៀង" />
          </div>
        </CardContent>
      </Card>

      {/* Content Transition Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">វីដេអូផ្លាស់ប្តូរទំព័រ (Transition Video)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-xs sm:text-sm text-muted-foreground">វីដេអូសម្រាប់លេងចន្លោះពេលបើកធៀប</p>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showTransitionVideo"
              name="showTransitionVideo"
              checked={formData.showTransitionVideo}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showTransitionVideo" className="text-sm font-medium">បង្ហាញវីដេអូ Transition</label>
          </div>

          {formData.showTransitionVideo && (
            <div className="space-y-3 pt-2">
              <MediaUpload
                type="video"
                value={formData.transitionVideoUrl || ''}
                onChange={(path) => setFormData(prev => ({ ...prev, transitionVideoUrl: path }))}
              />
              <Input 
                name="transitionVideoUrl" 
                value={formData.transitionVideoUrl || ''} 
                onChange={handleChange} 
                placeholder="ឬបញ្ចូល URL វីដេអូផ្លាស់ប្តូរទំព័រពីខាងក្រៅ (MP4/WebM)..." 
                className="text-xs" 
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ការកំណត់ទំព័របើកធៀប (Opening Screen)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="showOpeningScreen"
                name="showOpeningScreen"
                checked={formData.showOpeningScreen}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showOpeningScreen" className="text-sm font-medium">បង្ហាញទំព័របើកធៀប</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCurtainIntro"
                name="showCurtainIntro"
                checked={formData.showCurtainIntro}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showCurtainIntro" className="text-sm font-medium">បង្ហាញវាំងននបើកធៀប (Curtain Intro)</label>
            </div>
          </div>
          {formData.showOpeningScreen && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">រូបភាពបើកធៀប</label>
                <MediaUpload
                  type="image"
                  value={formData.openingImageUrl || ''}
                  onChange={(path) => setFormData(prev => ({ ...prev, openingImageUrl: path }))}
                />
                <Input name="openingImageUrl" value={formData.openingImageUrl} onChange={handleChange} placeholder="ឬបញ្ចូល URL រូបភាពបើកធៀបពីខាងក្រៅ..." className="mt-2 text-xs" />
              </div>
              <div className="space-y-2 md:col-span-2 pt-2 border-t">
                <label className="text-sm font-semibold">រូបឈ្មោះកូនកម្លោះកូនក្រមុំ សម្រាប់ទំព័របើកធៀប</label>
                <p className="text-xs text-muted-foreground">
                  បង្ហោះរូបភាពឈ្មោះកូនកម្លោះ និងកូនក្រមុំ ដែលបានរចនាជាក្បាច់ សម្រាប់បង្ហាញនៅទំព័រមានប៊ូតុង “បើកធៀប”។
                </p>
                <MediaUpload
                  type="image"
                  value={formData.openingCoupleNamesImageUrl || ''}
                  onChange={(path) => setFormData(prev => ({ ...prev, openingCoupleNamesImageUrl: path }))}
                  uploadButtonText="បង្ហោះរូបឈ្មោះ"
                  viewButtonText="មើលរូបភាព"
                  removeButtonText="លុបរូបភាព"
                />
                <Input 
                  name="openingCoupleNamesImageUrl" 
                  value={formData.openingCoupleNamesImageUrl || ''} 
                  onChange={handleChange} 
                  placeholder="ឬបញ្ចូល URL រូបឈ្មោះពីខាងក្រៅ..." 
                  className="mt-2 text-xs" 
                />
              </div>
              <div className="space-y-2 md:col-span-2 pt-2 border-t">
                <label className="text-sm font-semibold">រូបភាពក្រោមពាក្យ សូមគោរពអញ្ជើញ</label>
                <p className="text-xs text-muted-foreground">
                  បង្ហោះរូបភាពសម្រាប់បង្ហាញក្រោមពាក្យ “សូមគោរពអញ្ជើញ” នៅទំព័រមានប៊ូតុង “បើកធៀប”។ វានឹងជំនួសស៊ុមឈ្មោះភ្ញៀវចាស់។
                </p>
                <MediaUpload
                  type="image"
                  value={formData.openingGuestImageUrl || ''}
                  onChange={(path) => setFormData(prev => ({ ...prev, openingGuestImageUrl: path }))}
                  uploadButtonText="បង្ហោះរូបភាព"
                  viewButtonText="មើលរូបភាព"
                  removeButtonText="លុបរូបភាព"
                />
                <Input 
                  name="openingGuestImageUrl" 
                  value={formData.openingGuestImageUrl || ''} 
                  onChange={handleChange} 
                  placeholder="ឬបញ្ចូល URL រូបភាពភ្ញៀវពីខាងក្រៅ..." 
                  className="mt-2 text-xs" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ចំណងជើងបើកធៀប (ខ្មែរ)</label>
                <Input name="openingTitleKm" value={formData.openingTitleKm} onChange={handleChange} placeholder="ឧ. សូមគោរពអញ្ជើញ" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ចំណងជើងបើកធៀប (អង់គ្លេស)</label>
                <Input name="openingTitleEn" value={formData.openingTitleEn} onChange={handleChange} placeholder="ឧ. You are warmly invited" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">សារបើកធៀប (ខ្មែរ)</label>
                <Input name="openingMessageKm" value={formData.openingMessageKm} onChange={handleChange} placeholder="ឧ. ចូលរួមជាអធិបតីភាពក្នុងពិធីមង្គលការ" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">សារបើកធៀប (អង់គ្លេស)</label>
                <Input name="openingMessageEn" value={formData.openingMessageEn} onChange={handleChange} placeholder="ឧ. To celebrate the wedding of our children" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ការកំណត់វាំងនន (Curtain Intro)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Curtain type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">ប្រភេទវាំងនន</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="curtainIntroType"
                  value="css"
                  checked={formData.curtainIntroType === 'css'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">វាំងននគំនូរជីវចល CSS</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="curtainIntroType"
                  value="video"
                  checked={formData.curtainIntroType === 'video'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm">វីដេអូវាំងនន</span>
              </label>
            </div>
          </div>

          {/* Video upload — only shown when type === video */}
          {formData.curtainIntroType === 'video' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">បង្ហោះវីដេអូវាំងនន</label>
              <MediaUpload
                type="video"
                value={formData.curtainIntroVideoUrl}
                onChange={(path) => setFormData(prev => ({ ...prev, curtainIntroVideoUrl: path }))}
              />
              <Input
                name="curtainIntroVideoUrl"
                value={formData.curtainIntroVideoUrl}
                onChange={handleChange}
                placeholder="ឬបញ្ចូល URL វីដេអូពីខាងក្រៅ..."
                className="mt-2 text-xs"
              />
            </div>
          )}

          {/* Allow skip toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allowSkipCurtainIntro"
              name="allowSkipCurtainIntro"
              checked={formData.allowSkipCurtainIntro}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="allowSkipCurtainIntro" className="text-sm font-medium">
              អនុញ្ញាតឱ្យចុចរំលងវាំងនន (Skip Intro)
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ការកំណត់ KHQR</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="showGiftQrCode"
              name="showGiftQrCode"
              checked={formData.showGiftQrCode}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="showGiftQrCode" className="text-sm font-medium">
              បង្ហាញ KHQR
            </label>
          </div>

          {formData.showGiftQrCode && (
            <div className="space-y-6">
              {/* Titles and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-2">
                  <label className="text-sm font-medium">ចំណងជើង KHQR (ខ្មែរ)</label>
                  <Input name="giftQrTitleKm" value={formData.giftQrTitleKm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ចំណងជើង KHQR (អង់គ្លេស)</label>
                  <Input name="giftQrTitleEn" value={formData.giftQrTitleEn} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">កំណត់ចំណាំ KHQR (ខ្មែរ)</label>
                  <textarea 
                    name="giftQrNoteKm" 
                    value={formData.giftQrNoteKm} 
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">កំណត់ចំណាំ KHQR (អង់គ្លេស)</label>
                  <textarea 
                    name="giftQrNoteEn" 
                    value={formData.giftQrNoteEn} 
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              {/* KHR and USD sections side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* KHR Section */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                  <h4 className="text-sm font-bold uppercase">ប្រាក់រៀល (KHR)</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">បង្ហោះ KHQR ប្រាក់រៀល</label>
                    <MediaUpload
                      type="image"
                      value={formData.giftQrKhImageUrl || formData.giftQrImageUrl || ''}
                      onChange={(path) => {
                        setFormData(prev => ({ ...prev, giftQrKhImageUrl: path, giftQrImageUrl: path }));
                        if (path && !isValidMediaUrl(path)) {
                          setKhQrUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                        } else {
                          setKhQrUrlError('');
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">URL KHQR ប្រាក់រៀល</label>
                    <div className="flex items-center gap-2">
                      <Input
                        name="giftQrKhImageUrl"
                        value={formData.giftQrKhImageUrl || formData.giftQrImageUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const trimmed = val.trim();
                          if (trimmed && !isValidMediaUrl(trimmed)) {
                            setKhQrUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                          } else {
                            setKhQrUrlError('');
                          }
                          setFormData(prev => ({ ...prev, giftQrKhImageUrl: val, giftQrImageUrl: val }));
                        }}
                        placeholder="https://media.leangna.online/images/qr/khqr.webp"
                        className="font-mono text-xs flex-1"
                      />
                      {(formData.giftQrKhImageUrl || formData.giftQrImageUrl) ? (
                        <>
                          <a
                            href={formData.giftQrKhImageUrl || formData.giftQrImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-2.5 shrink-0 gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            មើល
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyText(formData.giftQrKhImageUrl || formData.giftQrImageUrl, 'khQr')}
                            className="shrink-0 text-xs gap-1 h-9 px-2.5"
                          >
                            {copiedKhQrUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKhQrUrl ? 'បានចម្លង' : 'ចម្លង URL'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, giftQrKhImageUrl: '', giftQrImageUrl: '' }));
                              setKhQrUrlError('');
                            }}
                            className="shrink-0 text-xs text-destructive hover:bg-destructive/10 h-9 px-2.5 gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            ដកចេញ
                          </Button>
                        </>
                      ) : null}
                    </div>
                    {khQrUrlError && (
                      <p className="text-xs text-destructive font-medium">{khQrUrlError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ឈ្មោះធនាគារ</label>
                    <Input name="giftKhBankName" value={formData.giftKhBankName || formData.giftBankName || ''} onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, giftKhBankName: val, ...(!prev.giftBankName ? { giftBankName: val } : {}) }));
                    }} placeholder="ABA, ACLEDA, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">គណនីប្រាក់រៀល - ឈ្មោះម្ចាស់គណនី</label>
                    <Input name="giftKhAccountName" value={formData.giftKhAccountName || formData.giftAccountName || ''} onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, giftKhAccountName: val, ...(!prev.giftAccountName ? { giftAccountName: val } : {}) }));
                    }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">គណនីប្រាក់រៀល - លេខគណនី</label>
                    <Input name="giftKhAccountNumber" value={formData.giftKhAccountNumber || formData.giftAccountNumber || ''} onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, giftKhAccountNumber: val, ...(!prev.giftAccountNumber ? { giftAccountNumber: val } : {}) }));
                    }} />
                  </div>
                </div>

                {/* USD Section */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                  <h4 className="text-sm font-bold uppercase">ប្រាក់ដុល្លារ (USD)</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">បង្ហោះ KHQR ប្រាក់ដុល្លារ</label>
                    <MediaUpload
                      type="image"
                      value={formData.giftQrUsdImageUrl || ''}
                      onChange={(path) => {
                        setFormData(prev => ({ ...prev, giftQrUsdImageUrl: path }));
                        if (path && !isValidMediaUrl(path)) {
                          setUsdQrUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                        } else {
                          setUsdQrUrlError('');
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">URL KHQR ប្រាក់ដុល្លារ</label>
                    <div className="flex items-center gap-2">
                      <Input
                        name="giftQrUsdImageUrl"
                        value={formData.giftQrUsdImageUrl || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const trimmed = val.trim();
                          if (trimmed && !isValidMediaUrl(trimmed)) {
                            setUsdQrUrlError('សូមបញ្ចូល URL ត្រឹមត្រូវ');
                          } else {
                            setUsdQrUrlError('');
                          }
                          setFormData(prev => ({ ...prev, giftQrUsdImageUrl: val }));
                        }}
                        placeholder="https://media.leangna.online/images/qr/usdqr.webp"
                        className="font-mono text-xs flex-1"
                      />
                      {formData.giftQrUsdImageUrl ? (
                        <>
                          <a
                            href={formData.giftQrUsdImageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-2.5 shrink-0 gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            មើល
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyText(formData.giftQrUsdImageUrl, 'usdQr')}
                            className="shrink-0 text-xs gap-1 h-9 px-2.5"
                          >
                            {copiedUsdQrUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedUsdQrUrl ? 'បានចម្លង' : 'ចម្លង URL'}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, giftQrUsdImageUrl: '' }));
                              setUsdQrUrlError('');
                            }}
                            className="shrink-0 text-xs text-destructive hover:bg-destructive/10 h-9 px-2.5 gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            ដកចេញ
                          </Button>
                        </>
                      ) : null}
                    </div>
                    {usdQrUrlError && (
                      <p className="text-xs text-destructive font-medium">{usdQrUrlError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">ឈ្មោះធនាគារ</label>
                    <Input name="giftUsdBankName" value={formData.giftUsdBankName} onChange={handleChange} placeholder="ABA, ACLEDA, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">គណនីប្រាក់ដុល្លារ - ឈ្មោះម្ចាស់គណនី</label>
                    <Input name="giftUsdAccountName" value={formData.giftUsdAccountName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">គណនីប្រាក់ដុល្លារ - លេខគណនី</label>
                    <Input name="giftUsdAccountNumber" value={formData.giftUsdAccountNumber} onChange={handleChange} />
                  </div>
                </div>

              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-3 font-medium text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 flex items-center gap-3 font-medium text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="flex justify-end gap-4 items-center">
        <Button variant="outline" type="button" onClick={() => router.back()}>បោះបង់</Button>
        <Button type="submit" disabled={loading} className="min-w-[130px] gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកកម្មវិធី'}
        </Button>
      </div>
    </form>
  );
}
