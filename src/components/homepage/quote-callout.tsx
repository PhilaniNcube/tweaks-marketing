import React from "react";
import { Quote } from "lucide-react";
import Reveal from "@/components/reveal";

export default function QuoteCallout() {
  return (
    <section className="py-16 bg-slate-50 dark:bg-zinc-950 border-t border-b border-slate-100 dark:border-zinc-800/40 relative overflow-hidden">
      <div className="absolute -top-10 -left-10 text-indigo-100 dark:text-indigo-950/20 pointer-events-none opacity-50">
        <Quote className="w-40 h-40 transform rotate-180" />
      </div>
      <div className="absolute -bottom-10 -right-10 text-indigo-100 dark:text-indigo-950/20 pointer-events-none opacity-50">
        <Quote className="w-40 h-40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Reveal
            variant="fade"
            className="p-8 sm:p-12 bg-white dark:bg-zinc-900 border-l-4 border-tweaks-blue dark:border-indigo-500 rounded-none shadow-xl relative"
          >
            <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic text-left">
              Whether English is your first language or not, even exceptional
              research can lose impact if it isn&apos;t communicated clearly.
              Professional academic editing ensures your ideas are presented
              with the clarity, precision, and academic tone they deserve.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
