"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, X, Save, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { getProgramIconSrc } from '@/lib/program-icon';
import ProgramIcon from '@/components/program/ProgramIcon';
import { uploadClientFile } from '@/lib/client-upload';

export default function ProgramManagement({ eventId, locale }: { eventId: string, locale: string }) {
  const t = useTranslations('Program');
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingDay, setEditingDay] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [isDayFormOpen, setIsDayFormOpen] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  const [dayForm, setDayForm] = useState({ titleKm: '', titleEn: '', date: '', order: 0 });
  const [itemForm, setItemForm] = useState({
    time: '',
    titleKm: '',
    titleEn: '',
    descriptionKm: '',
    descriptionEn: '',
    iconType: '',
    iconImageUrl: '',
    order: 0
  });

  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [itemFormError, setItemFormError] = useState<string | null>(null);
  const [dayFormError, setDayFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemFormRef = useRef<HTMLDivElement>(null);
  const dayFormRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    fetchProgram();
  }, []);

  useEffect(() => {
    if (isItemFormOpen && itemFormRef.current) {
      itemFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isItemFormOpen, selectedDayId, editingItem]);

  useEffect(() => {
    if (isDayFormOpen && dayFormRef.current) {
      dayFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isDayFormOpen, editingDay]);

  const fetchProgram = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/program`);
      const data = await res.json();
      setDays(Array.isArray(data) ? data : []);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program icon save/upload error:", e);
      }
      showToast('error', 'មិនអាចទាញយកទិន្នន័យកម្មវិធីបានទេ');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setItemFormError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|webp|svg)$/i)) {
      const errMsg = 'សូមជ្រើសរើសឯកសាររូបភាពប្រភេទ PNG, JPG, WEBP ឬ SVG';
      setItemFormError(errMsg);
      showToast('error', errMsg);
      return;
    }

    setUploadingIcon(true);
    try {
      const uploadedUrl = await uploadClientFile(file, 'image');
      if (uploadedUrl) {
        setItemForm((prev) => ({ ...prev, iconImageUrl: uploadedUrl }));
        showToast('success', 'បាន Upload រូបតំណាងកម្មវិធីដោយជោគជ័យ');
      } else {
        throw new Error('Upload មិនទទួលបាន URL ត្រឹមត្រូវទេ');
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program icon save/upload error:", {
          message: err instanceof Error ? err.message : String(err),
          error: err,
        });
      }
      const errMsg = err?.message || 'មិនអាចរក្សាទុករូបតំណាងកម្មវិធីបានទេ។ សូមពិនិត្យមើល URL ឬការកំណត់ upload ម្តងទៀត។';
      setItemFormError(errMsg);
      showToast('error', errMsg);
    } finally {
      setUploadingIcon(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveDay = async () => {
    setDayFormError(null);
    try {
      const url = editingDay ? `/api/events/${eventId}/program/days/${editingDay.id}` : `/api/events/${eventId}/program/days`;
      const method = editingDay ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dayForm)
      });
      
      if (!res.ok) {
        const text = await res.text();
        let details: any = text;
        try {
          details = JSON.parse(text);
        } catch {}

        if (process.env.NODE_ENV === 'development') {
          console.error("Program saveDay error:", {
            status: res.status,
            statusText: res.statusText,
            responseBody: details,
          });
        }

        const errMsg = typeof details === 'string'
          ? details
          : details?.error || details?.message || 'មិនអាចរក្សាទុកថ្ងៃកម្មវិធីបានទេ';
        throw new Error(errMsg);
      }

      showToast('success', t('programSavedSuccessfully') || 'បានរក្សាទុកថ្ងៃកម្មវិធីដោយជោគជ័យ');
      setIsDayFormOpen(false);
      setEditingDay(null);
      setDayFormError(null);
      fetchProgram();
    } catch (e: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program saveDay error:", {
          message: e instanceof Error ? e.message : String(e),
          error: e,
        });
      }
      const errMsg = e?.message || 'មិនអាចរក្សាទុកថ្ងៃកម្មវិធីបានទេ';
      setDayFormError(errMsg);
      showToast('error', errMsg);
    }
  };

  const deleteDay = async (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបថ្ងៃកម្មវិធីនេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}/program/days/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'បានលុបថ្ងៃកម្មវិធីដោយជោគជ័យ');
        if (selectedDayId === id) {
          setIsItemFormOpen(false);
          setSelectedDayId(null);
        }
        fetchProgram();
      } else {
        showToast('error', 'មិនអាចលុបថ្ងៃកម្មវិធីបានទេ');
      }
    } catch (e: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program deleteDay error:", {
          message: e instanceof Error ? e.message : String(e),
          error: e,
        });
      }
      showToast('error', 'មិនអាចលុបថ្ងៃកម្មវិធីបានទេ');
    }
  };

  const saveItem = async () => {
    if (!selectedDayId) return;
    setItemFormError(null);

    try {
      const url = editingItem 
        ? `/api/events/${eventId}/program/days/${selectedDayId}/items/${editingItem.id}` 
        : `/api/events/${eventId}/program/days/${selectedDayId}/items`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const payload = {
        titleKm: itemForm.titleKm || '',
        titleEn: itemForm.titleEn || '',
        time: itemForm.time || '',
        descriptionKm: itemForm.descriptionKm || '',
        descriptionEn: itemForm.descriptionEn || '',
        order: itemForm.order || 0,
        iconType: itemForm.iconType || '',
        iconImageUrl: itemForm.iconImageUrl?.trim() || null
      };

      if (process.env.NODE_ENV === "development") {
        console.log("Program item save payload:", payload);
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
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
        if (process.env.NODE_ENV === "development") {
          console.error("Program item API failed:", {
            status: response.status,
            statusText: response.statusText,
            responseText,
            responseData,
            payload,
          });
        }

        throw new Error(
          responseData?.error ||
          responseData?.message ||
          responseText ||
          `Program item save failed with status ${response.status}`
        );
      }

      showToast('success', t('programSavedSuccessfully') || 'បានរក្សាទុកកាលវិភាគដោយជោគជ័យ');
      setIsItemFormOpen(false);
      setEditingItem(null);
      setItemFormError(null);
      fetchProgram();
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Program icon save/upload error:", {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : undefined,
          stack: error instanceof Error ? error.stack : undefined,
          raw: error,
        });
      }
      const errMsg = error instanceof Error ? error.message : 'មិនអាចរក្សាទុករូបតំណាងកម្មវិធីបានទេ។ សូមពិនិត្យមើល URL ឬការកំណត់ upload ម្តងទៀត។';
      setItemFormError(errMsg);
      showToast('error', errMsg);
    }
  };

  const deleteItem = async (dayId: string, itemId: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបកាលវិភាគនេះមែនទេ?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}/program/days/${dayId}/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'បានលុបកាលវិភាគដោយជោគជ័យ');
        fetchProgram();
      } else {
        showToast('error', 'មិនអាចលុបកាលវិភាគបានទេ');
      }
    } catch (e: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program deleteItem error:", {
          message: e instanceof Error ? e.message : String(e),
          error: e,
        });
      }
      showToast('error', 'មិនអាចលុបកាលវិភាគបានទេ');
    }
  };

  const moveDay = async (index: number, direction: 'up' | 'down') => {
    const newDays = [...days];
    if (direction === 'up' && index > 0) {
      [newDays[index], newDays[index - 1]] = [newDays[index - 1], newDays[index]];
    } else if (direction === 'down' && index < newDays.length - 1) {
      [newDays[index], newDays[index + 1]] = [newDays[index + 1], newDays[index]];
    } else return;
    
    newDays.forEach((d, i) => d.order = i);
    setDays(newDays);
    try {
      await fetch(`/api/events/${eventId}/program/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: newDays.map(d => ({ id: d.id, order: d.order })) })
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program moveDay error:", e);
      }
    }
  };

  const moveItem = async (dayIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const newDays = [...days];
    const items = [...newDays[dayIndex].items];
    if (direction === 'up' && itemIndex > 0) {
      [items[itemIndex], items[itemIndex - 1]] = [items[itemIndex - 1], items[itemIndex]];
    } else if (direction === 'down' && itemIndex < items.length - 1) {
      [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
    } else return;
    
    items.forEach((it, i) => it.order = i);
    newDays[dayIndex].items = items;
    setDays(newDays);
    try {
      await fetch(`/api/events/${eventId}/program/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(it => ({ id: it.id, order: it.order })) })
      });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Program moveItem error:", e);
      }
    }
  };

  if (loading) return <div className="py-8 text-center text-muted-foreground">កំពុងផ្ទុក...</div>;

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl text-sm font-medium transition-all duration-300 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toastMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('manageProgram') || 'គ្រប់គ្រងកម្មវិធីពិធីការ'}</h2>
        <Button onClick={() => {
          setEditingDay(null);
          setDayFormError(null);
          setDayForm({ titleKm: '', titleEn: '', date: '', order: days.length });
          setIsDayFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addProgramDay') || 'បន្ថែមថ្ងៃកម្មវិធី'}
        </Button>
      </div>

      {isDayFormOpen && (
        <Card ref={dayFormRef} className="border-primary shadow-md">
          <CardHeader><CardTitle>{editingDay ? (t('editProgramDay') || 'កែសម្រួលថ្ងៃកម្មវិធី') : (t('addProgramDay') || 'បន្ថែមថ្ងៃកម្មវិធី')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {dayFormError && (
              <div className="p-2.5 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{dayFormError}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('dayTitleKm') || 'ចំណងជើងថ្ងៃ (ខ្មែរ)'}</label>
                <Input value={dayForm.titleKm} onChange={e => setDayForm({...dayForm, titleKm: e.target.value})} placeholder="ឧ. ថ្ងៃទីមួយ (ពិធីសែនព្រេន)" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('dayTitleEn') || 'ចំណងជើងថ្ងៃ (អង់គ្លេស)'}</label>
                <Input value={dayForm.titleEn} onChange={e => setDayForm({...dayForm, titleEn: e.target.value})} placeholder="ឧ. Day 1 (Traditional Ceremony)" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('date') || 'កាលបរិច្ឆេទ'}</label>
                <Input type="date" value={dayForm.date} onChange={e => setDayForm({...dayForm, date: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveDay}>{t('save') || 'រក្សាទុក'}</Button>
              <Button variant="outline" onClick={() => setIsDayFormOpen(false)}>{t('cancel') || 'បោះបង់'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {days.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
          {t('noProgramYet') || 'មិនទាន់មានកម្មវិធីនៅឡើយទេ'}
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day, dIndex) => (
            <Card key={day.id} className="overflow-hidden border shadow-sm">
              <div className="bg-muted p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    {day.titleKm || day.titleEn}
                    <span className="text-xs ml-2 font-normal text-muted-foreground">
                      ({day.items?.length || 0} កម្មវិធី)
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => moveDay(dIndex, 'up')} disabled={dIndex === 0}><ArrowUp className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveDay(dIndex, 'down')} disabled={dIndex === days.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingDay(day);
                    setDayFormError(null);
                    setDayForm({
                      titleKm: day.titleKm, titleEn: day.titleEn,
                      date: new Date(day.date).toISOString().split('T')[0],
                      order: day.order
                    });
                    setIsDayFormOpen(true);
                  }}><Edit2 className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => deleteDay(day.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="divide-y">
                  {day.items?.map((item: any, iIndex: number) => {
                    const iconSrc = getProgramIconSrc(item.titleKm || item.titleEn, item.iconType, item.iconImageUrl);
                    return (
                      <div key={item.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 p-1 flex items-center justify-center shrink-0 shadow-xs">
                              <ProgramIcon
                                title={item.titleKm || item.titleEn}
                                iconType={item.iconType}
                                iconImageUrl={item.iconImageUrl}
                                className="w-full h-full"
                                forceGold={false}
                              />
                            </div>
                            <span className="font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded text-sm shrink-0">{item.time}</span>
                            <span className="font-medium">{item.titleKm || item.titleEn}</span>
                          </div>
                          {(item.descriptionKm || item.descriptionEn) && (
                            <p className="text-sm text-muted-foreground mt-1 ml-10">
                              {item.descriptionKm || item.descriptionEn}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" onClick={() => moveItem(dIndex, iIndex, 'up')} disabled={iIndex === 0}><ArrowUp className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => moveItem(dIndex, iIndex, 'down')} disabled={iIndex === day.items.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                            setSelectedDayId(day.id);
                            setEditingItem(item);
                            setItemFormError(null);
                            setItemForm({
                              time: item.time || '',
                              titleKm: item.titleKm || '',
                              titleEn: item.titleEn || '',
                              descriptionKm: item.descriptionKm || '',
                              descriptionEn: item.descriptionEn || '',
                              iconType: item.iconType || '',
                              iconImageUrl: item.iconImageUrl || '',
                              order: item.order
                            });
                            setIsItemFormOpen(true);
                          }}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => deleteItem(day.id, item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Item Form per Day Card */}
                {isItemFormOpen && selectedDayId === day.id && (
                  <div ref={itemFormRef} className="p-4 bg-muted/40 border-t border-b border-primary/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-primary">
                        {editingItem ? (t('editProgramItem') || 'កែសម្រួលកាលវិភាគ') : (t('addProgramItem') || 'បន្ថែមពេលវេលាកម្មវិធី')}
                      </h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsItemFormOpen(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {itemFormError && (
                      <div className="p-2.5 rounded-md bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{itemFormError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('time') || 'ម៉ោង / ពេលវេលា'}</label>
                        <Input type="time" value={itemForm.time} onChange={e => { setItemForm({...itemForm, time: e.target.value}); setItemFormError(null); }} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemTitleKm') || 'ឈ្មោះកម្មវិធី (ខ្មែរ)'}</label>
                        <Input value={itemForm.titleKm} onChange={e => { setItemForm({...itemForm, titleKm: e.target.value}); setItemFormError(null); }} placeholder="ឧ. ពិធីសិរីសួស្តី" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemTitleEn') || 'ឈ្មោះកម្មវិធី (អង់គ្លេស)'}</label>
                        <Input value={itemForm.titleEn} onChange={e => { setItemForm({...itemForm, titleEn: e.target.value}); setItemFormError(null); }} placeholder="ឧ. Blessing Ceremony" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemDescKm') || 'ពិពណ៌នា (ខ្មែរ)'} (ស្រេចចិត្ត)</label>
                        <Input value={itemForm.descriptionKm} onChange={e => { setItemForm({...itemForm, descriptionKm: e.target.value}); setItemFormError(null); }} />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold">{t('itemDescEn') || 'ពិពណ៌នា (អង់គ្លេស)'} (ស្រេចចិត្ត)</label>
                        <Input value={itemForm.descriptionEn} onChange={e => { setItemForm({...itemForm, descriptionEn: e.target.value}); setItemFormError(null); }} />
                      </div>

                      {/* Custom Icon Field */}
                      <div className="md:col-span-2 space-y-2 pt-2 border-t border-border/60">
                        <div className="flex flex-col gap-0.5">
                          <label className="text-xs font-semibold text-foreground">រូបតំណាងកម្មវិធី</label>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            អាច upload icon ផ្ទាល់ ឬដាក់ URL icon ពី media subdomain/CDN។ បើមិនដាក់ រូបតំណាងនឹងជ្រើសដោយស្វ័យប្រវត្តិ។
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start bg-background/70 p-3 rounded-lg border border-border/60">
                          {/* Live Icon Preview (Supports both Original and Gold view) */}
                          <div className="sm:col-span-4 flex flex-col items-center justify-center p-2.5 rounded-md bg-muted/40 border border-primary/20 text-center min-h-[100px] gap-2">
                            {itemForm.iconImageUrl ? (
                              <div className="flex items-center justify-center gap-4 w-full">
                                {/* Original uploaded preview */}
                                <div className="flex flex-col items-center">
                                  <div className="w-9 h-9 rounded-full bg-background border border-border p-1.5 flex items-center justify-center shrink-0 shadow-xs mb-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={itemForm.iconImageUrl}
                                      alt="Original"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <span className="text-[9px] text-muted-foreground font-medium">រូបដើម</span>
                                </div>

                                {/* Gold public preview */}
                                <div className="flex flex-col items-center">
                                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 p-1.5 flex items-center justify-center shrink-0 shadow-xs mb-1">
                                    <ProgramIcon
                                      title={itemForm.titleKm || itemForm.titleEn}
                                      iconType={itemForm.iconType}
                                      iconImageUrl={itemForm.iconImageUrl}
                                      className="w-full h-full"
                                      forceGold={true}
                                    />
                                  </div>
                                  <span className="text-[9px] text-primary font-bold">មើលជាពណ៌មាស</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/30 p-1.5 flex items-center justify-center shrink-0 shadow-xs mb-1">
                                  <ProgramIcon
                                    title={itemForm.titleKm || itemForm.titleEn}
                                    iconType={itemForm.iconType}
                                    iconImageUrl={itemForm.iconImageUrl}
                                    className="w-full h-full"
                                    forceGold={true}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">
                                  {itemForm.iconType ? 'តាមប្រភេទ' : 'ស្វ័យប្រវត្តិ'}
                                </span>
                              </div>
                            )}

                            {itemForm.iconImageUrl && (
                              <p className="text-[10px] text-amber-500/90 font-medium leading-tight">
                                ✨ រូបតំណាងដែល upload នឹងបង្ហាញជាពណ៌មាសនៅខាងភ្ញៀវ ដើម្បីស៊ីជាមួយរចនាប័ទ្មកម្មវិធី។
                              </p>
                            )}
                          </div>

                          {/* Upload & Manual URL Controls */}
                          <div className="sm:col-span-8 space-y-2">
                            {/* Upload button & file input */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={uploadingIcon}
                                onClick={() => fileInputRef.current?.click()}
                                className="h-8 text-xs font-normal"
                              >
                                {uploadingIcon ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                    កំពុង Upload...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-3.5 h-3.5 mr-1.5 text-primary" />
                                    Upload Icon (PNG, SVG, WEBP, JPG)
                                  </>
                                )}
                              </Button>

                              {itemForm.iconImageUrl && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setItemForm({ ...itemForm, iconImageUrl: '' });
                                    setItemFormError(null);
                                  }}
                                  className="h-8 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                                  លុបរូបចេញ
                                </Button>
                              )}
                            </div>

                            {/* Manual URL input */}
                            <div className="space-y-1">
                              <Input
                                type="text"
                                value={itemForm.iconImageUrl}
                                onChange={(e) => {
                                  setItemForm({ ...itemForm, iconImageUrl: e.target.value });
                                  setItemFormError(null);
                                }}
                                placeholder="https://media.leangna.online/icons/program/sampeah-pteah.png"
                                className="h-8 text-xs font-mono"
                              />
                            </div>

                            {/* Preset selector */}
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">ឬជ្រើសពីបញ្ជី៖</span>
                              <select
                                value={itemForm.iconType}
                                onChange={(e) => {
                                  setItemForm({ ...itemForm, iconType: e.target.value });
                                  setItemFormError(null);
                                }}
                                className="flex h-7 w-full rounded border border-input bg-background px-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                              >
                                <option value="">ស្វ័យប្រវត្តិ (តាមចំណងជើង)</option>
                                <option value="prostrate-sampeah-pteah">ក្រាបសំពះផ្ទឹម</option>
                                <option value="groom-umbrella-people">មនុស្ស ៣ នាក់ និងឆ័ត្របាំងកូនកម្លោះ</option>
                                <option value="people-3">មនុស្ស ៣ នាក់ស្មើគ្នា</option>
                                <option value="offering">ហែជំនូន / ដង្ហែជំនូន</option>
                                <option value="fruit-basket">កន្ត្រកផ្លែឈើ / រៀបរាប់ផ្លែឈើ</option>
                                <option value="ceremony">សែនក្រុងពាលី / សែន</option>
                                <option value="blessing">ប្រោះព្រំ / សូត្រមន្ត / ប្រសិទ្ធពរ</option>
                                <option value="toast">កែវស្រាជល់គ្នា / ពិសាភោជនាអាហារ</option>
                                <option value="food">ម្ហូបអាហារ (ចាន & សម)</option>
                                <option value="scissors">កាត់សក់មង្គល</option>
                                <option value="rings">ពិធីបំពាក់ចិញ្ចៀន</option>
                                <option value="guests">ទទួលភ្ញៀវ / ស្វាគមន៍</option>
                                <option value="photo">ថតរូបអនុស្សាវរីយ៍</option>
                                <option value="music">តន្ត្រី / រាំលេងកម្សាន្ត</option>
                                <option value="lotus">ផ្សេងៗ (ផ្កាឈូកសិរីមង្គល)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsItemFormOpen(false)}>{t('cancel') || 'បោះបង់'}</Button>
                      <Button size="sm" onClick={saveItem}>
                        <Save className="w-4 h-4 mr-1" />
                        {t('save') || 'រក្សាទុក'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted/20 border-t flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedDayId(day.id);
                    setEditingItem(null);
                    setItemFormError(null);
                    setItemForm({
                      time: '',
                      titleKm: '',
                      titleEn: '',
                      descriptionKm: '',
                      descriptionEn: '',
                      iconType: '',
                      iconImageUrl: '',
                      order: day.items?.length || 0
                    });
                    setIsItemFormOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addProgramItem') || 'បន្ថែមពេលវេលាកម្មវិធី'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



