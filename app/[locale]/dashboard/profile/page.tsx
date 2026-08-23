"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, Upload, Trash2, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

export default function AdminProfilePage() {
  const t = useTranslations('Profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Loading & Feedback State
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      if (res.ok) {
        const data = await res.json();
        setName(data.name || '');
        setEmail(data.email || '');
        setAvatarUrl(data.avatarUrl || null);
      } else {
        const err = await res.json();
        setProfileError(err.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error(err);
      setProfileError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileError('');
    setProfileSuccess('');

    // Client-side Validation (jpg, jpeg, png, webp, max 5MB)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setProfileError('Unsupported file type. Please upload JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('File is too large. Maximum size is 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setAvatarUrl(data.url);
        setProfileSuccess(t('profileSavedSuccessfully'));
      } else {
        setProfileError(data.error || 'Image upload failed');
      }
    } catch (err) {
      console.error(err);
      setProfileError('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setAvatarUrl(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!email.trim()) {
      setProfileError(t('invalidEmail'));
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          avatarUrl,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setName(data.name);
        setEmail(data.email);
        setAvatarUrl(data.avatarUrl);
        setProfileSuccess(t('profileSavedSuccessfully'));
        // Reload layout window to refresh avatar header
        window.location.reload();
      } else {
        setProfileError(data.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error(err);
      setProfileError('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError(t('currentPasswordIncorrect'));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDoNotMatch'));
      return;
    }

    try {
      setSavingPassword(true);
      const res = await fetch('/api/admin/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(t('passwordChangedSuccessfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.error || t('currentPasswordIncorrect'));
      }
    } catch (err) {
      console.error(err);
      setPasswordError('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initialLetter = name ? name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-serif text-primary">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('title')} - Manage your admin account details, avatar, and password
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* Section 1: Profile Details & Avatar */}
        <div className="md:col-span-7 space-y-6">
          <Card className="border border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif text-primary">
                <User className="w-5 h-5" />
                {t('title')}
              </CardTitle>
              <CardDescription>
                Update your avatar image, display name, and login email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-primary/10">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/30 shrink-0 shadow-inner flex items-center justify-center group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary font-serif">{initialLetter}</span>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{t('profileImage')}</h4>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WEBP (Max 5MB)
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                        />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {t('changeImage')}
                        </span>
                      </label>

                      {avatarUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {t('removeImage')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Alerts */}
                {profileSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {t('name')}
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Admin Name"
                      required
                      className="bg-card"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {t('email')}
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      className="bg-card"
                    />
                  </div>
                </div>

                {/* Submit Profile */}
                <Button type="submit" disabled={savingProfile} className="w-full font-bold">
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('saveProfile')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Change Password */}
        <div className="md:col-span-5 space-y-6">
          <Card className="border border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-serif text-primary">
                <ShieldCheck className="w-5 h-5" />
                {t('changePassword')}
              </CardTitle>
              <CardDescription>
                Ensure your account is using a strong password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSavePassword} className="space-y-5">
                {/* Password Alerts */}
                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    {t('currentPassword')}
                  </label>
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    {t('newPassword')}
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-card"
                  />
                  <p className="text-[11px] text-muted-foreground">At least 8 characters long</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    {t('confirmNewPassword')}
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="bg-card"
                  />
                </div>

                <Button type="submit" variant="outline" disabled={savingPassword} className="w-full font-bold">
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('savePassword')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
