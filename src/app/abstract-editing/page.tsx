"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowRight, Zap, Target, Minimize2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const features = [
  {
    icon: Minimize2,
    title: "Strict Word Count Auditing",
    desc: "Struggling to fit your abstract into a 150 or 250-word journal ceiling? We compress sentence structures, eliminating filler words while retaining 100% of your findings."
  },
  {
    icon: Target,
    title: "Keyword & SEO Optimisation",
    desc: "We help identify and embed high-frequency search keywords so your paper ranks highly on academic indexes like Scopus, Web of Science, and Google Scholar."
  },
  {
    icon: Zap,
    title: "Structure Alignment",
    desc: "We align your summary with structural formats (Background, Objectives, Methods, Results, Conclusions) standard in medical and technical publications."
  }
];

const faqs = [
  {
    question: "How long does abstract editing take?",
    answer: "Given the short length (typically 100-300 words), we offer rapid turnaround times. We can deliver edited abstracts in as little as 3 to 12 hours."
  },
  {
    question: "Do you also edit the title and keywords?",
    answer: "Yes, our abstract editing service includes a full review of your paper's title (for clarity and academic punch) and keyword recommendations at no extra cost."
  },
  {
    question: "Do you offer translation for abstracts?",
    answer: "We primarily offer native English editing. If you have drafted an abstract in another language and used translation tools, we will edit the translation to sound perfectly natural and scholarly."
  }
];

export default function AbstractEditing() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Service Hero */}
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-indigo-950),_transparent_50%)] opacity-40"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
              <FileText className="h-4 w-4" />
              <span>Summary Optimization</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              Abstract & Executive Summary Editing
            </h1>
            <p className="text-lg text-slate-300 font-light leading-relaxed">
              Capture reader attention. We edit and compress abstracts to fit journal word ceilings, optimize search keywords, and ensure your study's objectives and findings shine with absolute clarity.
            </p>
            <div className="pt-2">
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-lg shadow-indigo-600/30">
                <Link href="/contact" className="inline-flex items-center gap-2">
                  Edit My Abstract
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Perfect Summary Architecture
            </h2>
            <p className="text-slate-600 dark:text-zinc-400 font-light text-sm">
              We ensure your abstract follows the exact structural requirements of your targeted journal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="p-6 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 space-y-4 hover:shadow-md transition-all duration-300">
                  <div className="p-3 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="text-sm font-light text-slate-500 dark:text-zinc-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Anatomy of a Great Abstract */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-950 border-t border-b border-slate-100 dark:border-zinc-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                The Four Cornerstones of a High-Impact Abstract
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 font-light leading-relaxed font-sans">
                A successful journal abstract must encapsulate your study efficiently. We balance and refine the four key elements required to convince reviewers and readers:
              </p>
              <div className="space-y-3 pt-2">
                {[
                  "Context & Background: Why does this study matter?",
                  "Methodology: How was the research conducted?",
                  "Key Findings: What did the experiments or analyses reveal?",
                  "Scholarly Impact: What is the main conclusion and future value?"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-400 font-light">
                    <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 bg-indigo-950 text-white rounded-3xl relative overflow-hidden space-y-6 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--color-indigo-900),_transparent_60%)] opacity-40"></div>
              <h3 className="text-2xl font-bold">12-Hour Express Editing</h3>
              <p className="text-slate-300 font-light leading-relaxed text-sm">
                Need your abstract reviewed immediately before a submission deadline? Upload your draft and receive your fully optimized abstract within half a day.
              </p>
              <Button asChild className="bg-white hover:bg-slate-100 text-slate-900 font-semibold cursor-pointer">
                <Link href="/contact">Upload Abstract for Editing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white dark:bg-zinc-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Abstract Editing FAQs
            </h2>
          </div>

          <Accordion className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-b border-slate-200 dark:border-zinc-800 py-2">
                <AccordionTrigger className="text-left font-bold text-slate-900 dark:text-white hover:no-underline hover:text-indigo-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm font-light text-slate-500 dark:text-zinc-400 leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
