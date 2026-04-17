"use client";

import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialisiere den Scanner nur ein Mal
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          onScan(decodedText);
        },
        (error) => {
          // Stilles Ignorieren von Scan-Fehlern (normales Verhalten beim Suchen)
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner cleanup failed", err));
        scannerRef.current = null;
      }
    };
  }, [onScan]);

  return (
    <div className="w-full overflow-hidden rounded-[2rem] border-4 border-primary/20 bg-black shadow-2xl">
      <div id="qr-reader" className="w-full" />
    </div>
  );
}
