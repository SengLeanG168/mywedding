"use client";

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode } from 'lucide-react';

interface MapQrCodeProps {
  url: string;
  buttonLabel: string;
  qrLabel: string;
}

export default function MapQrCode({ url, buttonLabel, qrLabel }: MapQrCodeProps) {
  const [show, setShow] = useState(false);

  if (!url) return null;

  return (
    <div className="flex flex-col items-start mt-3">
      <button 
        onClick={() => setShow(!show)}
        className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
      >
        <QrCode className="h-4 w-4" /> {buttonLabel}
      </button>

      {show && (
        <div className="flex flex-col items-center justify-center mt-4 p-4 bg-white/50 rounded-2xl border border-primary/20 w-full">
          <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
            <QRCodeSVG 
              value={url} 
              size={120}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
            />
          </div>
          <p className="text-sm font-medium text-primary text-center">
            {qrLabel}
          </p>
        </div>
      )}
    </div>
  );
}
