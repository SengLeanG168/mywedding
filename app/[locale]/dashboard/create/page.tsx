"use client"

import EventForm from '@/components/dashboard/EventForm';

export default function CreateEventPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold font-serif">Create New Event</h1>
      <EventForm />
    </div>
  );
}
