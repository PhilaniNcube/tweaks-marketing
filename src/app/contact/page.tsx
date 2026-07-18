"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Send, CheckCircle2, Paperclip, AlertCircle, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function ContactForm() {
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "",
    pages: "",
    speed: "",
    message: "",
  });

  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Initialize from searchParams
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      service: searchParams.get("service") || "",
      pages: searchParams.get("pages") || searchParams.get("minutes") || searchParams.get("documents") || searchParams.get("articles") || "",
      speed: searchParams.get("speed") || "",
    }));
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Please fill in your name and email.");
      return;
    }
    // Simulate API request
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="py-12 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Message Received!</h3>
          <p className="text-slate-500 dark:text-zinc-400 font-light text-sm max-w-md mx-auto leading-relaxed">
            Thank you, <span className="font-semibold text-slate-700 dark:text-zinc-300">{form.name}</span>. We have received your inquiry. A member of our editorial team will reply to you at <span className="font-semibold text-slate-700 dark:text-zinc-300">{form.email}</span> shortly.
          </p>
        </div>
        <Button onClick={() => setSubmitted(false)} variant="outline" className="cursor-pointer rounded-none border-slate-300 hover:border-tweaks-blue hover:text-tweaks-blue transition-colors">
          Submit Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Your Name *</Label>
          <Input
            id="name"
            type="text"
            required
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Email Address *</Label>
          <Input
            id="email"
            type="email"
            required
            placeholder="jane.doe@university.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Service Required</Label>
          <select
            id="service"
            className="flex h-10 w-full rounded-none border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-tweaks-blue transition-colors"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
          >
            <option value="">Select a service...</option>
            <option value="academic-editing">Academic Editing</option>
            <option value="journal-article-proposal-editing">Journal Article Editing</option>
            <option value="transcription">Transcription Services</option>
            <option value="reference-checking">Reference Checking</option>
            <option value="formatting">Document Formatting</option>
            <option value="reference-list-editing">Reference List Editing</option>
            <option value="abstract-editing">Abstract Editing</option>
          </select>
        </div>



        <div className="space-y-2">
          <Label htmlFor="speed" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Delivery Speed</Label>
          <select
            id="speed"
            className="flex h-10 w-full rounded-none border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-tweaks-blue transition-colors"
            value={form.speed}
            onChange={(e) => setForm({ ...form, speed: e.target.value })}
          >
            <option value="">Select delivery...</option>
            <option value="standard">Standard</option>
            <option value="express">Express</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pages" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Quantity (Pages/Minutes/Words)</Label>
        <Input
          id="pages"
          type="text"
          placeholder="e.g. 50 pages or 15000 words"
          value={form.pages}
          onChange={(e) => setForm({ ...form, pages: e.target.value })}
          className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Message / Details</Label>
        <Textarea
          id="message"
          rows={5}
          placeholder="Please provide any instructions, formatting guide requirements, or specific requests..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Upload Draft (optional)</Label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-dashed border-slate-300 dark:border-zinc-700 rounded-none cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-tweaks-blue transition-all text-sm font-semibold"
          >
            <Paperclip className="h-4 w-4 text-slate-400" />
            <span>Select Document</span>
          </Label>
          <input
            id="file-upload"
            type="file"
            accept=".docx,.doc,.pdf,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setFileName(e.target.files[0].name);
              }
            }}
          />
          <span className="text-xs text-slate-500 truncate max-w-xs">
            {fileName || "No file selected (Supports .doc, .docx, .pdf)"}
          </span>
        </div>
      </div>

      <Button type="submit" className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white cursor-pointer mt-4 py-6 font-bold rounded-none shadow-md transition-colors tracking-wide">
        <Send className="mr-2 h-4 w-4" />
        Submit Inquiry
      </Button>
    </form>
  );
}

export default function Contact() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">

      {/* Contact Header */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
            We are always happy to hear from you. Whether you have a relatively straight-forward project, or if you have a few questions you'd like to ask before you decide on the direction you would like to go, we are always keen to listen and offer advise and guidance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Column: Info Cards */}
            <div className="lg:col-span-4 space-y-8 text-left">
              <div className="space-y-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Get in Touch</h2>
                <p className="text-slate-500 dark:text-zinc-400 font-light text-sm leading-relaxed">
                  We are available by sending us an email directly, or you can reach us via the contact form on this page.
                </p>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-zinc-800 p-5 bg-slate-50/50 dark:bg-zinc-900/30 rounded-none flex gap-4 items-start">
                  <div className="p-2 rounded-none bg-indigo-50 dark:bg-indigo-950/40 text-tweaks-blue shrink-0 border border-indigo-100 dark:border-indigo-900">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Email Us Directly</h4>
                    <a href="mailto:chengetai@conceptafrika.com" className="text-sm font-semibold text-tweaks-blue mt-1 inline-block hover:underline">
                      chengetai@conceptafrika.com
                    </a>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 p-5 bg-slate-50/50 dark:bg-zinc-900/30 rounded-none flex gap-4 items-start">
                  <div className="p-2 rounded-none bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-900">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Working Hours</h4>
                    <p className="text-sm font-light text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Monday to Saturday<br />8:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-400 flex gap-3 text-xs leading-relaxed rounded-none shadow-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-1">Confidentiality Guarantee</h4>
                  <p className="font-light">We sign institutional non-disclosure agreements. Your uploaded manuscripts are never shared or stored longer than 30 days post-project delivery.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-8">
              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-none shadow-sm p-6 sm:p-8">
                <div className="mb-8 space-y-2 text-left border-b border-slate-100 dark:border-zinc-800 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submit an Inquiry</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 font-light">
                    Upload your details below and an editor will get back to you with a formal quote.
                  </p>
                </div>

                <Suspense fallback={
                  <div className="py-12 flex justify-center text-slate-500">
                    <div className="animate-pulse flex items-center gap-2">
                      <div className="h-4 w-4 bg-slate-300 rounded-full"></div>
                      <span className="text-sm font-semibold tracking-wide uppercase">Loading Form...</span>
                    </div>
                  </div>
                }>
                  <ContactForm />
                </Suspense>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
