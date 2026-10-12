"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, HeartHandshake } from 'lucide-react';

export default function RootNotFound() {
  return (
    <html lang="km">
      <body className="bg-[#0d0407] text-[#fbf7f0] antialiased">
        <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-[#d4af37]/30">
          <div className="w-full max-w-md mx-auto text-center space-y-6 bg-[#1a070f]/80 backdrop-blur-md p-8 rounded-3xl border border-[#d4af37]/30 shadow-2xl shadow-black/80">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center border border-[#d4af37]/40 shadow-inner">
              <HeartHandshake className="w-8 h-8 text-[#d4af37]" />
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">
                កំហុស ៤០៤ • 404 NOT FOUND
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#fce762]">
                រកមិនឃើញទំព័រធៀបការនេះទេ
              </h1>
              <p className="text-sm text-neutral-300 leading-relaxed pt-2">
                ទំព័រដែលលោកអ្នកកំពុងស្វែងរកមិនមាន ឬតំណភ្ជាប់មិនត្រឹមត្រូវ។
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto bg-[#d4af37] hover:bg-[#b8972e] text-[#1a070f] font-bold px-6 py-2.5 rounded-full shadow-lg gap-2">
                  <Home className="w-4 h-4" />
                  <span>ទៅកាន់ផ្ទាំងគ្រប់គ្រង (Dashboard)</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
