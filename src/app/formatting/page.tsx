"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Layout,
  Check,
  ArrowRight,
  Lock,
  HelpCircle,
  ChevronRight,
  Award,
  AlertCircle,
  Sliders,
  AlignLeft,
  Grid,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Do you write content or formulas during formatting?",
    answer:
      "No. Document Formatting is strictly visual. We adjust font families, sizes, margins, alignments, headings, and margins. We do not write, edit, or adjust your actual text during formatting. If you need textual changes, select our Academic Editing service.",
  },
  {
    question: "Which file formats do you accept for formatting?",
    answer:
      "We primarily accept Microsoft Word (.docx) files. For specific technical formats like LaTeX, please contact us beforehand to verify editor availability.",
  },
  {
    question: "Do you build table of contents and list of figures?",
    answer:
      "Yes. We generate automated Tables of Contents, Lists of Tables, and Lists of Figures in MS Word so they remain fully interactive and easy to update.",
  },
];

const relatedServices = [
  {
    name: "Reference Checking",
    price: "R 7.50 / page",
    description:
      "Cross-verify in-text citations against your bibliography and validate source details.",
    href: "/reference-checking",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/reference-checking-300x300.jpg",
  },
  {
    name: "Journal Article Editing",
    price: "R 2,200.00",
    description:
      "Comprehensive editing tailored to meet international journal publication standards.",
    href: "/journal-article-proposal-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/08/journal-article-editing-300x300.jpg",
  },
  {
    name: "Transcription",
    price: "R 12.00 / minute",
    description:
      "Accurate verbatim transcripts of qualitative research interview recordings.",
    href: "/transcription",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/transcription-300x300.jpg",
  },
  {
    name: "Reference List Editing",
    price: "R 50.00 / page",
    description:
      "Edit your reference list ensuring correct format for journals, books, reports and more.",
    href: "/reference-list-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/reference-list-editing-300x300.jpg",
  },
];

export default function Formatting() {
  const [documents, setDocuments] = useState<number>(1);
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">(
    "standard"
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "support" | "delivery"
  >("overview");

  const baseFee = 1500.0;
  const expressAddon = 800.0;
  const fee =
    deliverySpeed === "express" ? baseFee + expressAddon : baseFee;
  const totalCost = documents * fee;

  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      {/* Breadcrumb Navigation */}
      <div className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 py-3">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-left flex items-center gap-2 text-slate-500 dark:text-zinc-400">
          <Link href="/" className="hover:text-tweaks-blue transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-400 dark:text-zinc-600">Services</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-900 dark:text-white">
            Formatting
          </span>
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
                  src="https://conceptafrika.com/wp-content/uploads/2021/09/formatting-2.jpg"
                  alt="Formatting Service - Tweaks Academic"
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
                  Our academic editors are aligned with international guidelines
                  and members of prominent professional editing networks.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="https://editors.org.za"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-tweaks-blue transition-colors rounded-none"
                  >
                    <Award className="h-3.5 w-3.5 text-tweaks-blue" />
                    <span>Professional Editors&apos; Guild</span>
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

            {/* Right Column: Product Info & Order Planner */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 text-xs font-bold text-tweaks-blue uppercase tracking-wider">
                  <Layout className="h-3.5 w-3.5" />
                  <span>Document Styling</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Formatting
                </h1>
                <div className="text-2xl sm:text-3xl font-black text-tweaks-blue mt-2">
                  R 1,500.00{" "}
                  <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">
                    flat fee per document
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-none">
                  <Check className="h-3.5 w-3.5" />
                  <span>Flat fee regardless of total word count</span>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-6">
                <p className="text-base text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
                  We perfect the way your document is laid out on the page—the
                  way it looks and is visually organised. Our formatting
                  ensures that your document is consistent, correct (in terms of
                  meeting any stated requirements), and easy to read.
                </p>
              </div>

              {/* What We Format list */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  What our editors do:
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Font selection, size, and weight (bold/italics)",
                    "Spacing, margins, and alignment",
                    "Columns, indentation, and lists",
                    "Heading hierarchies (APA, MLA, Harvard, IEEE)",
                    "Tables, figures, and caption alignment",
                    "Dynamic Table of Contents & List of Figures",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 items-start text-sm text-slate-600 dark:text-zinc-400 font-light"
                    >
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Order Planner */}
              <div className="border border-slate-200 dark:border-zinc-800 p-6 bg-slate-50/50 dark:bg-zinc-900/30 rounded-none space-y-6">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                    Document Quantity & Delivery Planner
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                    Adjust the number of documents and delivery speed below to
                    estimate formatting costs. The flat fee applies to each
                    document regardless of word count.
                  </p>
                </div>

                {/* Document Count input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <label htmlFor="documents-count">
                      Number of Documents:
                    </label>
                    <span className="text-tweaks-blue font-bold">
                      {documents}{" "}
                      {documents === 1 ? "document" : "documents"}
                    </span>
                  </div>
                  <input
                    id="documents-count-range"
                    type="range"
                    min="1"
                    max="20"
                    value={documents}
                    onChange={(e) =>
                      setDocuments(parseInt(e.target.value) || 1)
                    }
                    className="w-full h-1 bg-slate-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-tweaks-blue"
                  />
                  <input
                    id="documents-count"
                    type="number"
                    min="1"
                    max="100"
                    value={documents}
                    onChange={(e) =>
                      setDocuments(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 px-3 py-2 text-sm outline-none rounded-none focus-visible:border-tweaks-blue"
                  />
                </div>

                {/* Delivery Option */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold">
                    Delivery Speed Option:
                  </div>
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
                      <span className="text-xs uppercase tracking-wider font-bold">
                        Standard Delivery
                      </span>
                      <span className="text-xs font-light mt-1">
                        5 - 7 Days Included
                      </span>
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
                      <span className="text-xs uppercase tracking-wider font-bold">
                        Express Delivery
                      </span>
                      <span className="text-xs font-light mt-1">
                        48 - 72 Hours (+R800 / document)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Order note */}
                <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-xs text-amber-800 dark:text-amber-300 rounded-none text-left">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <p className="font-light leading-relaxed">
                    <strong>Flat-Fee Note:</strong> The R1,500.00 fee is charged
                    per document regardless of word count. Increase the quantity
                    to match the number of documents you are submitting for
                    formatting.
                  </p>
                </div>

                {/* Subtotal cost */}
                <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 flex justify-between items-baseline">
                  <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Estimated Subtotal:
                  </span>
                  <span className="text-2xl font-black text-tweaks-blue">
                    R{" "}
                    {totalCost.toLocaleString("en-ZA", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Order action */}
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white font-bold cursor-pointer rounded-none py-6 shadow-md transition-colors"
                >
                  <Link
                    href={`/contact?service=formatting&documents=${documents}&speed=${deliverySpeed}`}
                  >
                    Format My Document Now
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
              onClick={() => setActiveTab("support")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "support"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Supported Style Guides
            </button>
            <button
              onClick={() => setActiveTab("delivery")}
              className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "delivery"
                  ? "border-tweaks-blue text-tweaks-blue"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Layout Alignment
            </button>
          </div>

          <div className="py-8 text-left">
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Formatting Service Details
                </h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  We perfect the way your document is laid out on the page—the
                  way it looks and is visually organised. We address things like
                  font selection, font size and presentation (like bold or
                  italics), spacing, margins, alignment, columns, indentation,
                  and lists.
                </p>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Basically, the mechanics of how the words appear on the page.
                  Our formatting ensures that your document is consistent,
                  correct (in terms of meeting any stated requirements), and easy
                  to read. Formatting is billed at a flat fee of R1,500.00 per
                  document.
                </p>
              </motion.div>
            )}

            {activeTab === "support" && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Compliant Styling Guidelines
                </h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  We align your academic documents to all major international
                  publisher templates. Supported style guides include:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "APA (7th Edition)",
                    "Chicago Manual of Style (17th)",
                    "Harvard Style",
                    "IEEE Format",
                    "MLA (9th Edition)",
                    "Custom University Specifications",
                  ].map((style) => (
                    <li
                      key={style}
                      className="flex gap-2 items-start text-sm font-light text-slate-600 dark:text-zinc-400"
                    >
                      <Check className="h-4 w-4 text-tweaks-blue shrink-0 mt-0.5" />
                      <span>{style}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Send us your university template or handbook and we will
                  construct margins, title pages, and spacing to fit perfectly.
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
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Detailed Layout Alignment
                </h3>
                <p className="text-sm font-light text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Academic reviewers judge document quality based on
                  professional layout compliance. Our editors ensure that every
                  visual component is balanced, clean, and perfectly aligned
                  with publisher specifications.
                </p>
                <ul className="space-y-3">
                  {[
                    {
                      icon: Sliders,
                      title: "Margins & Line Spacing",
                      desc: "Configure 1-inch margins, line spacing (double/1.5), and paragraph indents.",
                    },
                    {
                      icon: AlignLeft,
                      title: "Heading Hierarchies",
                      desc: "Verify that Level 1, Level 2, and lower headings strictly conform to style guides.",
                    },
                    {
                      icon: Grid,
                      title: "Tables, Figures & Charts",
                      desc: "Format captions, labels, alignments, and source notes underneath graphical assets.",
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <li
                      key={title}
                      className="flex gap-3 items-start text-sm font-light text-slate-600 dark:text-zinc-400"
                    >
                      <Icon className="h-4 w-4 text-tweaks-blue shrink-0 mt-1" />
                      <span>
                        <strong className="font-bold text-slate-900 dark:text-white">
                          {title}.
                        </strong>{" "}
                        {desc}
                      </span>
                    </li>
                  ))}
                </ul>
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Secure Checkout & Validation
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-light max-w-xl mx-auto">
              Our payments are securely processed through the YOCO payment
              gateway. Once you confirm your quotation, your order details are
              validated directly via email.
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
              <span>Formatting FAQ</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Service Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 p-6 rounded-none text-left"
              >
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
              Discover other professional academic editing and transcription
              packages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedServices.map((service) => (
              <div
                key={service.name}
                className="flex flex-col bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all group text-left"
              >
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
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="w-full justify-between rounded-none text-xs hover:bg-tweaks-blue hover:text-white hover:border-tweaks-blue transition-all cursor-pointer"
                  >
                    <Link
                      href={service.href}
                      className="inline-flex w-full items-center justify-between"
                    >
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