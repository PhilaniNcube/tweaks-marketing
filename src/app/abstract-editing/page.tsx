"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FileText,
  Check,
  ArrowRight,
  HelpCircle,
  ChevronRight,
  Lock,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

const relatedServices = [
  {
    name: "Transcription Services",
    price: "R 12.00 / page",
    description: "Accurate transcriptions of audio files for qualitative research interview recordings.",
    href: "/transcription",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/academic-editing-services-selection.jpg"
  },
  {
    name: "Journal Article proposal Editing",
    price: "R 2,200.00",
    description: "Comprehensive editing tailored to meet international journal publication standards.",
    href: "/journal-article-proposal-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/professional-academic-editing-services.jpg"
  },
  {
    name: "Academic Editing",
    price: "R 45.00 / page",
    description: "A deep editing style for postgraduate theses, dissertations, and research articles.",
    href: "/academic-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/08/academic-editing.jpg"
  },
  {
    name: "Formatting",
    price: "R 1,500.00",
    description: "Format headings, margins, dynamic TOC, lists, and layout to fit your institutional guide.",
    href: "/formatting",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/comprehensive-academic-editing.jpg"
  }
];

export default function AbstractEditing() {
  const [activeTab, setActiveTab] = useState<"overview" | "integrity" | "delivery">("overview");

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-left flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-tweaks-blue transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-400 dark:text-zinc-600">Services</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-900 dark:text-white">Abstract Editing</span>
        </div>
      </div>

      {/* Main Single Product Layout */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left Column: Product Image */}
            <div className="lg:col-span-6 space-y-6">
              <div className="relative aspect-square w-full border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 overflow-hidden rounded-none shadow-sm">
                <Image
                  src="https://conceptafrika.com/wp-content/uploads/2021/09/academic-editing-services-selection.jpg"
                  alt="Abstract Editing Service - Tweaks Academic"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Accreditations Bar */}
              <div className="border border-slate-100 dark:border-zinc-800/80 p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-none text-left space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Accredited Editorial Framework
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
                  Our academic editors are aligned with international guidelines and members of prominent professional editing networks.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="https://editors.org.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-tweaks-blue transition-colors rounded-none"
                  >
                    <Award className="h-3.5 w-3.5 text-tweaks-blue" />
                    <span>Professional Editors' Guild</span>
                  </a>
                  <a
                    href="https://safrea.co.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-tweaks-blue transition-colors rounded-none"
                  >
                    <Award className="h-3.5 w-3.5 text-tweaks-blue" />
                    <span>SAFREA Member Framework</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Product Info & Order Form */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-tweaks-blue uppercase tracking-wider">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Technical Editing Service</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Abstract Editing
                </h1>
                <div className="text-2xl sm:text-3xl font-black text-tweaks-blue mt-2">
                  R 1,000.00 <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">/ Flat fee</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
                <p className="text-base text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
                  Flat fee regardless of the total word count. A combination of deep editing and technical editing where we ensure that the abstract includes all the elements that are required.
                </p>
                <p className="text-base text-slate-600 dark:text-zinc-300 font-light leading-relaxed mt-4">
                  We ensure a brief but precise statement of the problem or issue, followed by a description of the research method and design, the major findings, and the conclusions reached.
                </p>
              </div>

              {/* What We Correct list */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  What our editors do:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Deep editing for grammar & clarity",
                    "Include a precise statement of the problem",
                    "Describe research methods and design",
                    "Highlight major findings clearly",
                    "Ensure conclusions are well-articulated",
                    "Technical formatting & styling"
                  ].map((item) => (
                    <li key={item} className="flex gap-2 items-start text-sm text-slate-600 dark:text-zinc-400 font-light">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Form */}
              <div className="border border-slate-200 dark:border-zinc-800 p-6 bg-slate-50/50 dark:bg-zinc-900/30 rounded-none space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    Submit Your Abstract
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                    This is a flat fee service. No need to calculate page counts. Simply request a quote and submit your manuscript.
                  </p>
                </div>

                {/* Subtotal cost */}
                <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Cost:</span>
                  <span className="text-2xl font-black text-tweaks-blue">
                    R 1,000.00
                  </span>
                </div>

                {/* Order action */}
                <Button asChild size="lg" className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white font-bold cursor-pointer rounded-none py-6 shadow-md transition-colors">
                  <Link href="/contact?service=abstract-editing">
                    Request Quote & Submit Abstract
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Product Information Tabs */}
      <section className="py-12 bg-slate-50 dark:bg-zinc-900/50 border-t border-b border-slate-100 dark:border-zinc-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">

          {/* Tab buttons */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "overview"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              Description & Details
            </button>
            <button
              onClick={() => setActiveTab("integrity")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "integrity"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              Academic Integrity
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === "delivery"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
            >
              Tracked Changes & Delivery
            </button>
          </div>

          {/* Tab content panels */}
          <div className="py-8 text-left">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Abstract Editing Details</h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Your abstract is the first (and sometimes only) part of your research that journal editors and reviewers will read. It needs to concisely summarize your study while retaining all critical methodological details and findings.
                </p>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Our abstract editing service combines deep language editing with technical refinement. We compress sentence structures, eliminate filler words, and ensure your summary follows the exact structural requirements of your targeted journal (Background, Objectives, Methods, Results, Conclusions).
                </p>
              </motion.div>
            )}

            {activeTab === "integrity" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Strict Compliance with Academic Guidelines</h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  We maintain a firm commitment to university and journal ethics policies. Our role is strictly limited to language proofreading, copy editing, and structural formatting adjustments.
                </p>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  We **do not write abstracts from scratch**, fabricate data, or alter the meaning of your research findings. We help you polish the presentation of your own work so that your arguments are communicated effectively.
                </p>
              </motion.div>
            )}

            {activeTab === "delivery" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">How We Edit & Deliver</h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  All work is completed using Microsoft Word's **Tracked Changes** feature. This ensures you can inspect every correction, revision, and comment made by our editor.
                </p>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  You will receive two documents back:
                  1. A **tracked version** showing every change, correction, and comment made by the editor.
                  2. A **clean version** with all changes accepted, ready for immediate submission.
                </p>
              </motion.div>
            )}
          </div>

        </div>
      </section>

      {/* Trust & Payments Guarantee */}
      <section className="py-16 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-6">
          <div className="w-12 h-12 rounded-none bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-tweaks-blue mx-auto border border-indigo-100 dark:border-indigo-900">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Secure Checkout & Validation</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light max-w-xl mx-auto">
              Our payments are securely processed through the YOCO payment gateway. Once you confirm your quotation, your order details are validated directly via email.
            </p>
          </div>
          <div className="flex justify-center items-center gap-4 flex-wrap text-xs text-slate-400">
            <span>✓ SSL Secure Transaction</span>
            <span>•</span>
            <span>✓ Card Payment via Yoco Gateway</span>
            <span>•</span>
            <span>✓ Email Verification</span>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-16 bg-slate-50 dark:bg-zinc-900 border-t border-b border-slate-100 dark:border-zinc-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-400 rounded-none">
              <HelpCircle className="h-3.5 w-3.5 text-tweaks-blue" />
              <span>Abstract FAQ</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Service Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-none text-left">
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="text-tweaks-blue">Q:</span>
                  {faq.question}
                </h4>
                <p className="text-sm font-light text-slate-500 dark:text-zinc-400 leading-relaxed pt-2.5 pl-6 border-t border-slate-50 dark:border-zinc-900 mt-2.5">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Products Grid */}
      <section className="py-20 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Related Services
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light">
              Discover other professional transcription and academic editing packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedServices.map((service) => (
              <div key={service.name} className="flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all group text-left">

                {/* Visual Frame */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-50 border-b border-slate-100 dark:border-zinc-800/80">
                  <Image
                    src={service.img}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-tweaks-blue transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    <div className="text-tweaks-blue font-extrabold text-xs">
                      {service.price}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-light leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                  <Button asChild size="sm" variant="outline" className="w-full justify-between rounded-none text-xs hover:bg-tweaks-blue hover:text-white hover:border-tweaks-blue transition-all cursor-pointer">
                    <Link href={service.href} className="inline-flex w-full items-center justify-between">
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
