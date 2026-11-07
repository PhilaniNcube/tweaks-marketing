"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Sparkles,
  HelpCircle,
  ChevronRight,
  Lock,
  Mail,
  Award,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How do I calculate the page count?",
    answer: "A standard academic A4 page is calculated based on approximately 300 words. You can divide your total word count by 300 to find the corresponding page quantity for your order."
  },
  {
    question: "Do you offer formatting and referencing style corrections?",
    answer: "Yes, academic editing includes correcting referencing format inconsistencies. However, if your document requires formatting from scratch according to a specific institutional template, you can add our Formatting service."
  },
  {
    question: "Is my academic work safe and confidential?",
    answer: "Absolutely. We sign non-disclosure agreements with all our editors. Your research findings, data, and draft drafts remain 100% confidential and are never shared or published."
  },
  {
    question: "What is your stance on Academic Integrity?",
    answer: "We offer ethical proofreading and editing services that improve your written English clarity and structure. We never write essays, complete research, or do the work for you. We help you refine your own voice."
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
    name: "Abstract Editing",
    price: "R 1,000.00",
    description: "A standalone service to polish and structure your research article or thesis abstract.",
    href: "/abstract-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/academic-editing-services-selection.jpg"
  },
  {
    name: "Formatting",
    price: "R 1,500.00",
    description: "Format headings, margins, dynamic TOC, lists, and layout to fit your institutional guide.",
    href: "/formatting",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/comprehensive-academic-editing.jpg"
  }
];

import { sendGTMEvent } from '@next/third-parties/google';

export default function AcademicEditing() {
  const [pages, setPages] = useState<number>(10);
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">("standard");
  const [activeTab, setActiveTab] = useState<"overview" | "integrity" | "delivery">("overview");

  React.useEffect(() => {
    sendGTMEvent({ event: 'service_viewed', service: 'academic-editing' });
  }, []);

  const basePricePerPage = 45.00;
  const expressAddon = 15.00;
  const rate = deliverySpeed === "express" ? basePricePerPage + expressAddon : basePricePerPage;
  const totalCost = pages * rate;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-left flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-tweaks-blue transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-400 dark:text-zinc-600">Services</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-900 dark:text-white">Academic Editing</span>
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
                  src="https://conceptafrika.com/wp-content/uploads/2021/08/academic-editing.jpg"
                  alt="Academic Editing Service - Tweaks Academic"
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

            {/* Right Column: Product Info & Dynamic Calculator */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-tweaks-blue uppercase tracking-wider">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>Deep Editing Service</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Academic Editing
                </h1>
                <div className="text-2xl sm:text-3xl font-black text-tweaks-blue mt-2">
                  R 45.00 <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">/ A4 page</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
                <p className="text-base text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
                  A deep editing style for postgraduate theses, dissertations, proposals, and research articles. We refine the content, logical flow, formatting conventions, and language presentation so that your research papers shine.
                </p>
              </div>

              {/* What We Correct list */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  What our editors do:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Correct spelling, punctuation & typos",
                    "Fine-tune grammar & academic tone",
                    "Delete redundant or irrelevant points",
                    "Re-order points for logical flow",
                    "Fix terminology inconsistencies",
                    "Provide comments & critique feedback"
                  ].map((item) => (
                    <li key={item} className="flex gap-2 items-start text-sm text-slate-600 dark:text-zinc-400 font-light">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Cost Estimator & Order Form */}
              <div className="border border-slate-200 dark:border-zinc-800 p-6 bg-slate-50/50 dark:bg-zinc-900/30 rounded-none space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    Estimated Cost & Quantity Planner
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                    Adjust the document page count and delivery speed below to estimate editing costs.
                  </p>
                </div>

                {/* Page Count input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label htmlFor="pages-count">Standard A4 Pages:</label>
                    <span className="text-tweaks-blue font-bold">{pages} pages (approx. {pages * 300} words)</span>
                  </div>
                  <input
                    id="pages-count-range"
                    type="range"
                    min="1"
                    max="400"
                    value={pages}
                    onChange={(e) => setPages(parseInt(e.target.value) || 1)}
                    className="w-full h-1 bg-slate-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-tweaks-blue"
                  />
                  <input
                    id="pages-count"
                    type="number"
                    min="1"
                    max="1000"
                    value={pages}
                    onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 px-3 py-2 text-sm outline-none rounded-none focus-visible:border-tweaks-blue"
                  />
                </div>

                {/* Delivery Option */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Delivery Speed Option:</div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed("standard")}
                      className={`flex flex-col p-3 border text-left rounded-none transition-all cursor-pointer ${
                        deliverySpeed === "standard"
                          ? "border-tweaks-blue bg-indigo-50/10 text-tweaks-blue font-semibold"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider font-bold">Standard Delivery</span>
                      <span className="text-xs font-light mt-1">3 - 5 Days Included</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliverySpeed("express")}
                      className={`flex flex-col p-3 border text-left rounded-none transition-all cursor-pointer ${
                        deliverySpeed === "express"
                          ? "border-tweaks-blue bg-indigo-50/10 text-tweaks-blue font-semibold"
                          : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50"
                      }`}
                    >
                      <span className="text-xs uppercase tracking-wider font-bold">Express Delivery</span>
                      <span className="text-xs font-light mt-1">24 - 48 Hours (+R15 / page)</span>
                    </button>
                  </div>
                </div>

                {/* Order Quantity Warning Directive */}
                <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-xs text-amber-800 dark:text-amber-300 rounded-none text-left">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <p className="font-light leading-relaxed">
                    <strong>Order Quantity Directive:</strong> Please increase the number of items bought to correspond to the number of pages in your document. If you purchase fewer items than the number of pages in your document, your document will only be edited to correspond to the number of items you purchased.
                  </p>
                </div>

                {/* Subtotal cost */}
                <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Estimated Subtotal:</span>
                  <span className="text-2xl font-black text-tweaks-blue">
                    R {totalCost.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Order action */}
                <Button asChild size="lg" className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white font-bold cursor-pointer rounded-none py-6 shadow-md transition-colors">
                  <Link href={`/contact?service=academic-editing&pages=${pages}&speed=${deliverySpeed}`}>
                    Request Quote & Submit Manuscript
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
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Description & Details
            </button>
            <button
              onClick={() => setActiveTab("integrity")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "integrity"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Academic Integrity
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "delivery"
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Academic Editing Details</h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Academic writing requires precision, clarity, and rigorous adherence to style guidelines. Our editorial registry consists of professional language editors specialized in editing dissertations, theses, term papers, and essays. 
                </p>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  We correct spellings, typos, and grammatical errors, but our service goes beyond basic proofreading: we rewrite awkward sentences, align your bibliography citations to standard guides (APA, Harvard, Chicago, Vancouver, MLA), and check that your arguments proceed logically.
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
                  We maintain a firm commitment to university ethics policies. Our role is strictly limited to language proofreading, copy editing, and structural formatting adjustments. 
                </p>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  We **do not write papers**, create draft essays from scratch, or complete homework assignments for students. We help you polish the presentation of your own work so that your arguments are communicated effectively.
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
                  2. A **clean version** with all changes accepted, ready for immediate printing or submission.
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
              <span>Academic FAQ</span>
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
