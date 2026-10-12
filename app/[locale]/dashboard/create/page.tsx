"use client"

import EventForm from '@/components/dashboard/EventForm';

export default function CreateEventPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-serif text-primary">បង្កើតកម្មវិធីថ្មី</h1>
      <EventForm />
    </div>
  );
}
