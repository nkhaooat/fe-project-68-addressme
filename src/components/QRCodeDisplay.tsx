'use client';

import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  token: string;
  size?: number;
}

export default function QRCodeDisplay({ token, size = 200 }: QRCodeDisplayProps) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const qrUrl = `${baseUrl}/qr/${token}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG value={qrUrl} size={size} level="M" />
      </div>
      <p className="text-dungeon-secondary text-xs text-center break-all max-w-[250px]">
        {qrUrl}
      </p>
    </div>
  );
}
