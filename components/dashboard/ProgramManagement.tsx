"use client";

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, X, Save } from 'lucide-react';

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
  const [itemForm, setItemForm] = useState({ time: '', titleKm: '', titleEn: '', descriptionKm: '', descriptionEn: '', order: 0 });

  const itemFormRef = useRef<HTMLDivElement>(null);
  const dayFormRef = useRef<HTMLDivElement>(null);

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
      alert('Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const saveDay = async () => {
    try {
      const url = editingDay ? `/api/events/${eventId}/program/days/${editingDay.id}` : `/api/events/${eventId}/program/days`;
      const method = editingDay ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dayForm)
      });
      
      if (res.ok) {
        alert(t('programSavedSuccessfully'));
        setIsDayFormOpen(false);
        setEditingDay(null);
        fetchProgram();
      } else {
        alert('Failed to save day');
      }
    } catch (e) {
      alert('Failed to save day');
    }
  };

  const deleteDay = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}/program/days/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedDayId === id) {
          setIsItemFormOpen(false);
          setSelectedDayId(null);
        }
        fetchProgram();
      }
    } catch (e) {
      alert('Failed to delete day');
    }
  };

  const saveItem = async () => {
    if (!selectedDayId) return;
    try {
      const url = editingItem 
        ? `/api/events/${eventId}/program/days/${selectedDayId}/items/${editingItem.id}` 
        : `/api/events/${eventId}/program/days/${selectedDayId}/items`;
      const method = editingItem ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm)
      });
      
      if (res.ok) {
        alert(t('programSavedSuccessfully'));
        setIsItemFormOpen(false);
        setEditingItem(null);
        fetchProgram();
      } else {
        alert('Failed to save item');
      }
    } catch (e) {
      alert('Failed to save item');
    }
  };

  const deleteItem = async (dayId: string, itemId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}/program/days/${dayId}/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProgram();
      }
    } catch (e) {
      alert('Failed to delete item');
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
    await fetch(`/api/events/${eventId}/program/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: newDays.map(d => ({ id: d.id, order: d.order })) })
    });
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
    await fetch(`/api/events/${eventId}/program/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items.map(it => ({ id: it.id, order: it.order })) })
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('manageProgram')}</h2>
        <Button onClick={() => {
          setEditingDay(null);
          setDayForm({ titleKm: '', titleEn: '', date: '', order: days.length });
          setIsDayFormOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addProgramDay')}
        </Button>
      </div>

      {isDayFormOpen && (
        <Card ref={dayFormRef} className="border-primary shadow-md">
          <CardHeader><CardTitle>{editingDay ? t('editProgramDay') : t('addProgramDay')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('dayTitleKm')}</label>
                <Input value={dayForm.titleKm} onChange={e => setDayForm({...dayForm, titleKm: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('dayTitleEn')}</label>
                <Input value={dayForm.titleEn} onChange={e => setDayForm({...dayForm, titleEn: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('date')}</label>
                <Input type="date" value={dayForm.date} onChange={e => setDayForm({...dayForm, date: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveDay}>{t('save')}</Button>
              <Button variant="outline" onClick={() => setIsDayFormOpen(false)}>{t('cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {days.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
          {t('noProgramYet')}
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day, dIndex) => (
            <Card key={day.id} className="overflow-hidden border shadow-sm">
              <div className="bg-muted p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    {locale === 'km' ? day.titleKm : day.titleEn}
                    <span className="text-xs ml-2 font-normal text-muted-foreground">
                      ({day.items?.length || 0} {locale === 'km' ? 'កម្មវិធី' : 'items'})
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">{new Date(day.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => moveDay(dIndex, 'up')} disabled={dIndex === 0}><ArrowUp className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => moveDay(dIndex, 'down')} disabled={dIndex === days.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => {
                    setEditingDay(day);
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
                  {day.items?.map((item: any, iIndex: number) => (
                    <div key={item.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded text-sm shrink-0">{item.time}</span>
                          <span className="font-medium">{locale === 'km' ? item.titleKm : item.titleEn}</span>
                        </div>
                        {(item.descriptionKm || item.descriptionEn) && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {locale === 'km' ? item.descriptionKm : item.descriptionEn}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => moveItem(dIndex, iIndex, 'up')} disabled={iIndex === 0}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => moveItem(dIndex, iIndex, 'down')} disabled={iIndex === day.items.length - 1}><ArrowDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          setSelectedDayId(day.id);
                          setEditingItem(item);
                          setItemForm({
                            time: item.time, titleKm: item.titleKm, titleEn: item.titleEn,
                            descriptionKm: item.descriptionKm || '', descriptionEn: item.descriptionEn || '', order: item.order
                          });
                          setIsItemFormOpen(true);
                        }}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => deleteItem(day.id, item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Item Form per Day Card */}
                {isItemFormOpen && selectedDayId === day.id && (
                  <div ref={itemFormRef} className="p-4 bg-muted/40 border-t border-b border-primary/30 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm text-primary">
                        {editingItem ? t('editProgramItem') : t('addProgramItem')}
                      </h4>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsItemFormOpen(false)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold">{t('time')}</label>
                        <Input type="time" value={itemForm.time} onChange={e => setItemForm({...itemForm, time: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemTitleKm')}</label>
                        <Input value={itemForm.titleKm} onChange={e => setItemForm({...itemForm, titleKm: e.target.value})} placeholder="ឧ. ពិធីសិរីសួស្តី" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemTitleEn')}</label>
                        <Input value={itemForm.titleEn} onChange={e => setItemForm({...itemForm, titleEn: e.target.value})} placeholder="e.g. Blessing Ceremony" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemDescKm')} (Optional)</label>
                        <Input value={itemForm.descriptionKm} onChange={e => setItemForm({...itemForm, descriptionKm: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold">{t('itemDescEn')} (Optional)</label>
                        <Input value={itemForm.descriptionEn} onChange={e => setItemForm({...itemForm, descriptionEn: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={() => setIsItemFormOpen(false)}>{t('cancel')}</Button>
                      <Button size="sm" onClick={saveItem}>
                        <Save className="w-4 h-4 mr-1" />
                        {t('save')}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-muted/20 border-t flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => {
                    setSelectedDayId(day.id);
                    setEditingItem(null);
                    setItemForm({ time: '', titleKm: '', titleEn: '', descriptionKm: '', descriptionEn: '', order: day.items?.length || 0 });
                    setIsItemFormOpen(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addProgramItem')}
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

