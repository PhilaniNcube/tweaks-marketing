"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeImage({ value, size = 160, className = "" }: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // High resolution for print
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={`bg-slate-100 animate-pulse flex items-center justify-center rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code Verification"
      width={size}
      height={size}
      className={className}
    />
  );
}
