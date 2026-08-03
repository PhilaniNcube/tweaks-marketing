"use client";

import React from "react";
import Image from "next/image";
import { Globe, MousePointerClick } from "lucide-react";
import { QRCodeImage } from "./qr-code";

export interface CertificateData {
  id: string;
  researchTitle: string;
  researcherName: string;
  university: string;
  completionDate: string;
  verificationUrl?: string;
}

interface CertificateDocumentProps {
  data: CertificateData;
  showPrintButton?: boolean;
}

export function CertificateDocument({
  data,
  showPrintButton = false,
}: CertificateDocumentProps) {
  const verificationUrl =
    data.verificationUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/certificate/verify/${data.id}`
      : `https://tweaks.co.za/certificate/verify/${data.id}`);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {showPrintButton && (
        <div className="mb-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print / Save PDF
          </button>
        </div>
      )}

      {/* Certificate Frame - Designed for A4 Ratio (210mm x 297mm) */}
      <div
        id="certificate-print-area"
        className="relative bg-white text-slate-900 w-full max-w-[800px] aspect-[1/1.4142] p-8 md:p-14 shadow-2xl border border-slate-200 flex flex-col justify-between print:shadow-none print:border-none print:w-full print:max-w-none print:p-10 font-sans print:m-0"
        style={{
          colorScheme: "light",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Top Header / Branding */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Tweaks Logo */}
          <div className="relative w-24 h-20 mb-1">
            <Image
              src="/images/tweaks_logo.png"
              alt="Tweaks Academic Editing Logo"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h1 className="text-xl md:text-2xl font-bold tracking-[0.25em] text-slate-900 font-serif uppercase mt-1">
            ACADEMIC EDITING CERTIFICATE
          </h1>

          <p className="text-sm md:text-base text-slate-700 max-w-xl mx-auto mt-4 leading-relaxed">
            This is to certify that the following research work has been
            professionally edited for academic clarity, coherence, and language
            accuracy.
          </p>

          <div className="w-full border-b border-slate-400 my-6 md:my-8" />
        </div>

        {/* Certificate Body Fields */}
        <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 my-auto px-4">
          {/* Research Title */}
          <div className="space-y-2 w-full max-w-2xl">
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Research Title:
            </h2>
            <p className="text-base md:text-lg font-extrabold uppercase text-slate-900 leading-snug tracking-wide">
              {data.researchTitle}
            </p>
          </div>

          {/* Researcher */}
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Researcher:
            </h3>
            <p className="text-base md:text-lg font-medium text-slate-800">
              {data.researcherName}
            </p>
          </div>

          {/* University */}
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              University:
            </h3>
            <p className="text-base md:text-lg font-medium text-slate-800">
              {data.university}
            </p>
          </div>

          {/* Date of Completion */}
          <div className="space-y-1">
            <h3 className="text-sm md:text-base font-bold text-slate-900">
              Date of Completion:
            </h3>
            <p className="text-base md:text-lg font-medium text-slate-800">
              {data.completionDate}
            </p>
          </div>
        </div>

        {/* Footer / QR & Signature */}
        <div className="flex items-end justify-between w-full pt-8 pb-4 border-t border-transparent">
          {/* Left: Scan Me QR Code */}
          <div className="flex flex-col items-start gap-2">
            <div className="relative border-2 border-purple-500 rounded-2xl p-2.5 pt-4 bg-white flex flex-col items-center shadow-sm">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 border border-purple-500 rounded-full text-[10px] font-bold text-purple-700 tracking-wider uppercase whitespace-nowrap shadow-2xs">
                SCAN ME
              </span>
              <QRCodeImage value={verificationUrl} size={110} />
              <MousePointerClick className="w-5 h-5 text-purple-600 absolute -bottom-2 -right-2 transform rotate-12 bg-white rounded-full p-0.5 border border-purple-300" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium pl-1 mt-1">
              <Globe className="w-3.5 h-3.5 text-slate-600" />
              <span>www.tweaks.co.za</span>
            </div>
          </div>

          {/* Right: Signature Block */}
          <div className="flex flex-col items-end text-right space-y-1 pr-2">
            {/* Signature Graphics */}
            <div className="relative w-44 h-14 -mb-3 flex items-center justify-center">
              {/* Handwritten style SVG Signature */}
              <svg
                viewBox="0 0 200 60"
                className="w-full h-full text-slate-800 opacity-90 stroke-current fill-none"
                style={{ strokeWidth: 1.8, strokeLinecap: "round" }}
              >
                <path d="M 20 40 C 30 15, 45 10, 50 35 C 55 50, 70 25, 80 30 C 90 35, 100 45, 110 30 C 120 15, 125 45, 135 25 C 145 15, 160 40, 180 35" />
                <path d="M 35 30 C 50 30, 80 20, 140 25" />
                <path d="M 60 45 C 80 48, 120 42, 150 40" />
              </svg>
            </div>

            <div className="w-64 border-b border-slate-700 mb-2" />

            <p className="text-sm font-semibold text-slate-900">
              Chengetai Chikadaya,
            </p>
            <p className="text-xs text-slate-700">hello@tweaks.co.za</p>
            <p className="text-xs text-slate-700">+27 79 788 30 64</p>
          </div>
        </div>
      </div>
    </div>
  );
}
