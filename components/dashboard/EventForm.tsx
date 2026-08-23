"use client"

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import MediaUpload from './MediaUpload';
import GalleryUpload from './GalleryUpload';

export default function EventForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const t = useTranslations('Event');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    slug: initialData?.slug || '',
    brideNameKm: initialData?.brideNameKm || '',
    brideNameEn: initialData?.brideNameEn || '',
    groomNameKm: initialData?.groomNameKm || '',
    groomNameEn: initialData?.groomNameEn || '',
    eventDate: initialData?.eventDate || '',
    eventTime: initialData?.eventTime || '17:00',
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
    heroVideoType: initialData?.heroVideoType || 'mp4',
    heroVideoPosterUrl: initialData?.heroVideoPosterUrl || '',
    showHeroVideo: initialData?.showHeroVideo || false,
    openingImageUrl: initialData?.openingImageUrl || '',
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
    showTraditionalInvitationSection: initialData?.showTraditionalInvitationSection !== undefined ? initialData.showTraditionalInvitationSection : true,
    
    // QR Code & Gift Settings
    showMapQrCode: initialData?.showMapQrCode !== undefined ? initialData.showMapQrCode : true,
    showGiftQrCode: initialData?.showGiftQrCode !== undefined ? initialData.showGiftQrCode : false,
    giftQrImageUrl: initialData?.giftQrImageUrl || '',
    giftQrKhImageUrl: initialData?.giftQrKhImageUrl || '',
    giftQrUsdImageUrl: initialData?.giftQrUsdImageUrl || '',
    giftQrTitleKm: initialData?.giftQrTitleKm || 'ចងដៃតាម QR Code',
    giftQrTitleEn: initialData?.giftQrTitleEn || 'Wedding Gift QR Code',
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

    showApologyLetter: initialData?.showApologyLetter !== undefined ? initialData.showApologyLetter : true,
    apologyTitleKm: initialData?.apologyTitleKm || '',
    apologyTitleEn: initialData?.apologyTitleEn || '',
    apologyTextKm: initialData?.apologyTextKm || '',
    apologyTextEn: initialData?.apologyTextEn || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const url = initialData ? `/api/events/${initialData.id}` : '/api/events';
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Internal server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-destructive font-medium">{error}</div>}
      
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug</label>
            <Input name="slug" required value={formData.slug} onChange={handleChange} placeholder="e.g. sok-bora" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Date</label>
            <Input type="date" name="eventDate" required value={formData.eventDate ? new Date(formData.eventDate).toISOString().split('T')[0] : ''} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Time</label>
            <Input type="time" name="eventTime" required value={formData.eventTime} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('coverImage')}</label>
            <MediaUpload
              type="image"
              value={formData.coverImage}
              onChange={(path) => setFormData(prev => ({ ...prev, coverImage: path }))}
            />
            <Input name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="Or enter external cover URL..." className="mt-2 text-xs" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('galleryImages')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <GalleryUpload
            value={formData.galleryImages}
            onChange={(paths) => setFormData(prev => ({ ...prev, galleryImages: paths }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bride Name (Khmer)</label>
            <Input name="brideNameKm" required value={formData.brideNameKm} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bride Name (English)</label>
            <Input name="brideNameEn" required value={formData.brideNameEn} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Groom Name (Khmer)</label>
            <Input name="groomNameKm" required value={formData.groomNameKm} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Groom Name (English)</label>
            <Input name="groomNameEn" required value={formData.groomNameEn} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      {/* Traditional Invitation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('traditionalInvitationDetails')}</CardTitle>
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
              {t('showTraditionalInvitationSection')}
            </label>
          </div>

          {formData.showTraditionalInvitationSection && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('weddingBlessingCeremony')} (Khmer)</label>
                <Input name="blessingTitleKm" value={formData.blessingTitleKm} onChange={handleChange} placeholder="សិរីសួស្ដីជ័យមង្គលអាពាហ៍ពិពាហ៍" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('weddingBlessingCeremony')} (English)</label>
                <Input name="blessingTitleEn" value={formData.blessingTitleEn} onChange={handleChange} placeholder="Wedding Blessing Ceremony" />
              </div>

              <div className="col-span-1 md:col-span-2 pt-4 border-t">
                <h4 className="text-sm font-bold text-muted-foreground uppercase">{t('groomsFamily')}</h4>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('father')} (Khmer)</label>
                <Input name="groomFatherNameKm" value={formData.groomFatherNameKm} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('father')} (English)</label>
                <Input name="groomFatherNameEn" value={formData.groomFatherNameEn} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('mother')} (Khmer)</label>
                <Input name="groomMotherNameKm" value={formData.groomMotherNameKm} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('mother')} (English)</label>
                <Input name="groomMotherNameEn" value={formData.groomMotherNameEn} onChange={handleChange} />
              </div>

              <div className="col-span-1 md:col-span-2 pt-4 border-t">
                <h4 className="text-sm font-bold text-muted-foreground uppercase">{t('bridesFamily')}</h4>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('father')} (Khmer)</label>
                <Input name="brideFatherNameKm" value={formData.brideFatherNameKm} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('father')} (English)</label>
                <Input name="brideFatherNameEn" value={formData.brideFatherNameEn} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('mother')} (Khmer)</label>
                <Input name="brideMotherNameKm" value={formData.brideMotherNameKm} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('mother')} (English)</label>
                <Input name="brideMotherNameEn" value={formData.brideMotherNameEn} onChange={handleChange} />
              </div>

              <div className="col-span-1 md:col-span-2 pt-4 border-t">
                <h4 className="text-sm font-bold text-muted-foreground uppercase">{t('formalInvitationWording')}</h4>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('formalInvitationWording')} (Khmer)</label>
                <textarea 
                  name="formalInvitationTextKm" 
                  value={formData.formalInvitationTextKm} 
                  onChange={handleChange}
                  placeholder="យើងខ្ញុំមានសេចក្ដីសោមនស្សរីករាយ..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('formalInvitationWording')} (English)</label>
                <textarea 
                  name="formalInvitationTextEn" 
                  value={formData.formalInvitationTextEn} 
                  onChange={handleChange}
                  placeholder="We are delighted to respectfully invite you..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2 md:col-span-2 pt-4 border-t">
                <label className="text-sm font-medium">{t('couplePhoto')}</label>
                <MediaUpload
                  type="image"
                  value={formData.couplePhotoUrl || ''}
                  onChange={(path) => setFormData(prev => ({ ...prev, couplePhotoUrl: path }))}
                />
                <Input name="couplePhotoUrl" value={formData.couplePhotoUrl || ''} onChange={handleChange} placeholder="Or enter external photo URL..." className="mt-2 text-xs" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thank You and Apology Letters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('thankYouAndApologyLetters')}</CardTitle>
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
                {t('showThankYouLetter')}
              </label>
            </div>

            {formData.showThankYouLetter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterTitle')} (Khmer)</label>
                  <Input name="thankYouTitleKm" value={formData.thankYouTitleKm} onChange={handleChange} placeholder="លិខិតថ្លែងអំណរគុណ" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterTitle')} (English)</label>
                  <Input name="thankYouTitleEn" value={formData.thankYouTitleEn} onChange={handleChange} placeholder="Thank You Letter" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterText')} (Khmer)</label>
                  <textarea
                    name="thankYouTextKm"
                    value={formData.thankYouTextKm}
                    onChange={handleChange}
                    placeholder="យើងខ្ញុំសូមថ្លែងអំណរគុណយ៉ាងជ្រាលជ្រៅ..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterText')} (English)</label>
                  <textarea
                    name="thankYouTextEn"
                    value={formData.thankYouTextEn}
                    onChange={handleChange}
                    placeholder="We sincerely thank all honored guests..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
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
                {t('showApologyLetter')}
              </label>
            </div>

            {formData.showApologyLetter && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterTitle')} (Khmer)</label>
                  <Input name="apologyTitleKm" value={formData.apologyTitleKm} onChange={handleChange} placeholder="លិខិតសូមអភ័យទោស" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterTitle')} (English)</label>
                  <Input name="apologyTitleEn" value={formData.apologyTitleEn} onChange={handleChange} placeholder="Apology Letter" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterText')} (Khmer)</label>
                  <textarea
                    name="apologyTextKm"
                    value={formData.apologyTextKm}
                    onChange={handleChange}
                    placeholder="ក្នុងឱកាសពិធីមង្គលអាពាហ៍ពិពាហ៍នេះ..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('letterText')} (English)</label>
                  <textarea
                    name="apologyTextEn"
                    value={formData.apologyTextEn}
                    onChange={handleChange}
                    placeholder="If there are any shortcomings..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location Name (Khmer)</label>
            <Input name="locationNameKm" required value={formData.locationNameKm} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Location Name (English)</label>
            <Input name="locationNameEn" required value={formData.locationNameEn} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Location Address (Khmer)</label>
            <Input name="locationAddressKm" required value={formData.locationAddressKm} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Location Address (English)</label>
            <Input name="locationAddressEn" required value={formData.locationAddressEn} onChange={handleChange} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Google Maps URL</label>
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
              {t('showMapQrCode')}
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invitation Message (Khmer)</label>
            <textarea 
              name="invitationMessageKm" 
              required 
              value={formData.invitationMessageKm} 
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Invitation Message (English)</label>
            <textarea 
              name="invitationMessageEn" 
              required 
              value={formData.invitationMessageEn} 
              onChange={handleChange}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('mediaSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <p className="text-sm text-muted-foreground mb-4">{t('addVideoHelp')}</p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="showHeroVideo"
                name="showHeroVideo"
                checked={formData.showHeroVideo}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="showHeroVideo" className="text-sm font-medium">{t('showHeroVideo')}</label>
            </div>
          </div>
          {formData.showHeroVideo && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">{t('heroVideoType')}</label>
                <select
                  name="heroVideoType"
                  value={formData.heroVideoType || 'none'}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="mp4">MP4 Video</option>
                  <option value="youtube">YouTube Embed</option>
                  <option value="none">None</option>
                </select>
              </div>

              {formData.heroVideoType === 'mp4' && (
                <>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">{t('heroVideo')}</label>
                    <MediaUpload
                      type="video"
                      value={formData.heroVideoUrl || ''}
                      onChange={(path) => setFormData(prev => ({ ...prev, heroVideoUrl: path }))}
                    />
                    <Input name="heroVideoUrl" value={formData.heroVideoUrl || ''} onChange={handleChange} placeholder="Or enter external video URL..." className="mt-2 text-xs" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">{t('heroVideoPoster')}</label>
                    <MediaUpload
                      type="image"
                      value={formData.heroVideoPosterUrl || ''}
                      onChange={(path) => setFormData(prev => ({ ...prev, heroVideoPosterUrl: path }))}
                    />
                    <Input name="heroVideoPosterUrl" value={formData.heroVideoPosterUrl || ''} onChange={handleChange} placeholder="Or enter poster URL..." className="mt-2 text-xs" />
                  </div>
                </>
              )}

              {formData.heroVideoType === 'youtube' && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">{t('heroVideoUrl')} (YouTube)</label>
                  <Input name="heroVideoUrl" value={formData.heroVideoUrl || ''} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              )}
            </>
          )}

          <div className="space-y-2 md:col-span-2 mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">{t('addMusicHelp')}</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('backgroundMusic')}</label>
            <MediaUpload
              type="audio"
              value={formData.musicUrl || ''}
              onChange={(path) => setFormData(prev => ({ ...prev, musicUrl: path }))}
            />
            <Input name="musicUrl" value={formData.musicUrl || ''} onChange={handleChange} placeholder="Or enter music URL..." className="mt-2 text-xs" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">{t('musicTitle')}</label>
            <Input name="musicTitle" value={formData.musicTitle || ''} onChange={handleChange} placeholder="Song Title" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('openingScreenSettings')}</CardTitle>
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
              <label htmlFor="showOpeningScreen" className="text-sm font-medium">{t('showOpeningScreen')}</label>
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
              <label htmlFor="showCurtainIntro" className="text-sm font-medium">{t('showCurtainIntro')}</label>
            </div>
          </div>
          {formData.showOpeningScreen && (
            <>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">{t('openingImage')}</label>
                <MediaUpload
                  type="image"
                  value={formData.openingImageUrl || ''}
                  onChange={(path) => setFormData(prev => ({ ...prev, openingImageUrl: path }))}
                />
                <Input name="openingImageUrl" value={formData.openingImageUrl} onChange={handleChange} placeholder="Or enter external opening image URL..." className="mt-2 text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('openingTitle')} (Khmer)</label>
                <Input name="openingTitleKm" value={formData.openingTitleKm} onChange={handleChange} placeholder="e.g. សូមគោរពអញ្ជើញ" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('openingTitle')} (English)</label>
                <Input name="openingTitleEn" value={formData.openingTitleEn} onChange={handleChange} placeholder="e.g. You are warmly invited" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('openingMessage')} (Khmer)</label>
                <Input name="openingMessageKm" value={formData.openingMessageKm} onChange={handleChange} placeholder="e.g. ចូលរួមជាអធិបតីភាពក្នុងពិធីមង្គលការ" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('openingMessage')} (English)</label>
                <Input name="openingMessageEn" value={formData.openingMessageEn} onChange={handleChange} placeholder="e.g. To celebrate the wedding of our children" />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('curtainIntroSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Curtain type selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('curtainIntroType')}</label>
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
                <span className="text-sm">{t('curtainIntroCss')}</span>
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
                <span className="text-sm">{t('curtainIntroVideo')}</span>
              </label>
            </div>
          </div>

          {/* Video upload — only shown when type === video */}
          {formData.curtainIntroType === 'video' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('curtainIntroVideoLabel')}</label>
              <MediaUpload
                type="video"
                value={formData.curtainIntroVideoUrl}
                onChange={(path) => setFormData(prev => ({ ...prev, curtainIntroVideoUrl: path }))}
              />
              <Input
                name="curtainIntroVideoUrl"
                value={formData.curtainIntroVideoUrl}
                onChange={handleChange}
                placeholder="Or enter external video URL..."
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
              {t('allowSkipCurtainIntro')}
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('giftQrSettings')}</CardTitle>
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
              {t('showGiftQrCode')}
            </label>
          </div>

          {formData.showGiftQrCode && (
            <div className="space-y-6">
              {/* Titles and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gift Title (Khmer)</label>
                  <Input name="giftQrTitleKm" value={formData.giftQrTitleKm} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gift Title (English)</label>
                  <Input name="giftQrTitleEn" value={formData.giftQrTitleEn} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('giftNote')} (Khmer)</label>
                  <textarea 
                    name="giftQrNoteKm" 
                    value={formData.giftQrNoteKm} 
                    onChange={handleChange}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('giftNote')} (English)</label>
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
                  <h4 className="text-sm font-bold uppercase">{t('khmerRiel')}</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('uploadKhrQrCode')}</label>
                    <MediaUpload
                      type="image"
                      value={formData.giftQrKhImageUrl || formData.giftQrImageUrl || ''}
                      onChange={(path) => setFormData(prev => ({ ...prev, giftQrKhImageUrl: path, giftQrImageUrl: path }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('bankName')}</label>
                    <Input name="giftKhBankName" value={formData.giftKhBankName || formData.giftBankName || ''} onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, giftKhBankName: val, ...(!prev.giftBankName ? { giftBankName: val } : {}) }));
                    }} placeholder="ABA, ACLEDA, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('khrAccount')} Name</label>
                    <Input name="giftKhAccountName" value={formData.giftKhAccountName || formData.giftAccountName || ''} onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, giftKhAccountName: val, ...(!prev.giftAccountName ? { giftAccountName: val } : {}) }));
                    }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('khrAccount')} Number</label>
                    <Input name="giftKhAccountNumber" value={formData.giftKhAccountNumber || formData.giftAccountNumber || ''} onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, giftKhAccountNumber: val, ...(!prev.giftAccountNumber ? { giftAccountNumber: val } : {}) }));
                    }} />
                  </div>
                </div>

                {/* USD Section */}
                <div className="space-y-4 p-4 border rounded-xl bg-card">
                  <h4 className="text-sm font-bold uppercase">{t('usDollar')}</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('uploadUsdQrCode')}</label>
                    <MediaUpload
                      type="image"
                      value={formData.giftQrUsdImageUrl || ''}
                      onChange={(path) => setFormData(prev => ({ ...prev, giftQrUsdImageUrl: path }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('bankName')}</label>
                    <Input name="giftUsdBankName" value={formData.giftUsdBankName} onChange={handleChange} placeholder="ABA, ACLEDA, etc." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('usdAccount')} Name</label>
                    <Input name="giftUsdAccountName" value={formData.giftUsdAccountName} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('usdAccount')} Number</label>
                    <Input name="giftUsdAccountNumber" value={formData.giftUsdAccountNumber} onChange={handleChange} />
                  </div>
                </div>

              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Event'}</Button>
      </div>
    </form>
  );
}
