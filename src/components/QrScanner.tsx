"use client";

import React, { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface QrScannerProps {
  onScan: (decodedText: string) => void;
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    scannerRef.current = html5QrCode;

    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Start scanning with back camera (environment facing)
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        onScan(decodedText);
      },
      (errorMessage) => {
        // Ignored during search
      }
    ).catch((err) => {
      console.error("Unable to start scanning", err);
      // Fallback to any available camera if environment fails
      html5QrCode.start({ facingMode: "user" }, config, (text) => onScan(text), () => {});
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Cleanup failed", err));
      }
    };
  }, [onScan]);

  return (
    <div className="w-full overflow-hidden rounded-[3rem] border-4 border-primary/20 bg-black shadow-2xl relative">
      <div id="qr-reader" className="w-full aspect-square" />
      <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
         <div className="w-full h-full border-2 border-primary/50 animate-pulse" />
      </div>
    </div>
  );
}
