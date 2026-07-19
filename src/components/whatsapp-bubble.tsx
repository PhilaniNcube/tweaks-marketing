"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const DEFAULT_MESSAGE =
  "Hi Tweaks, I'd like to get a quote for editing services.";

export default function WhatsappBubble() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !WHATSAPP_NUMBER) return null;

  const href = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, "")}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <div
      aria-live="polite"
      className="fixed z-50 right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col items-end gap-3"
    >
      {open && (
        <div className="w-[min(20rem,calc(100vw-2rem))] sm:w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-none shadow-xl overflow-hidden">
          <div className="bg-[#25D366] text-white px-4 py-3 flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-bold">Chat with us on WhatsApp</span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="ml-auto text-white/90 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3 text-left">
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
              Have a question about a service, turnaround time, or your quote?
              Send us a message and we&rsquo;ll reply as soon as we can.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="block text-center bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold py-2.5 rounded-none transition-colors cursor-pointer"
            >
              Start WhatsApp Chat
            </a>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 text-center">
              Opens WhatsApp in a new window
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        aria-expanded={open}
        className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        {open ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </button>
    </div>
  );
}
