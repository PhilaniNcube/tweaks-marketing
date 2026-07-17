"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, ShieldAlert, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    service: "academic",
    words: "",
    urgency: "standard",
    message: "",
  });
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      alert("Please fill in your name and email.");
      return;
    }
    // Simulate API request
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Contact Header */}
      <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-indigo-950),_transparent_50%)] opacity-40"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Contact Our Editorial Team</h1>
          <p className="text-lg text-slate-300 font-light leading-relaxed">
            Have questions about formatting guidelines or need an express edit? Get a direct response in under 60 minutes.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-slate-50 dark:bg-zinc-950 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Info Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Get in Touch</h2>
                <p className="text-slate-500 dark:text-zinc-400 font-light text-sm">
                  Our customer service team and chief editors are active Monday to Saturday, 8:00 AM - 8:00 PM EST.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card className="border border-slate-200/50 dark:border-zinc-800/50">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shrink-0">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Email Us Directly</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-light mt-1">For submissions and pricing: </p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">support@tweakacademic.com</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/50 dark:border-zinc-800/50">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Call Support</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-light mt-1">General inquiries and institutional bookings: </p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">+1 (555) 321-4820</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200/50 dark:border-zinc-800/50">
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Guaranteed Response</h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 font-light mt-1">Average response window during working hours: </p>
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">Under 45 Minutes</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 flex gap-3 text-xs leading-relaxed">
                <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Confidentiality & Privacy Guarantee</h4>
                  <p className="font-light mt-0.5">We sign institutional non-disclosure agreements. Your uploaded manuscripts and files are never stored longer than 30 days post-project delivery.</p>
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <Card className="shadow-xl border border-slate-200/60 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-xl">Submit an Inquiry</CardTitle>
                  <CardDescription>Upload your details below to get a firm cost proposal</CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Your Name</Label>
                          <Input 
                            id="name" 
                            type="text" 
                            required 
                            placeholder="Dr. Jane Doe" 
                            value={form.name} 
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            required 
                            placeholder="jane.doe@university.edu" 
                            value={form.email} 
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="service" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Selected Service</Label>
                          <select 
                            id="service" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.service} 
                            onChange={(e) => setForm({ ...form, service: e.target.value })}
                          >
                            <option value="academic">Academic Editing</option>
                            <option value="journal">Journal Proposal Editing</option>
                            <option value="transcription">Transcription Services</option>
                            <option value="references">Reference Checking</option>
                            <option value="formatting">Document Formatting</option>
                            <option value="ref-list">Reference List Editing</option>
                            <option value="abstract">Abstract Editing</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="words" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Word Count (est.)</Label>
                          <Input 
                            id="words" 
                            type="number" 
                            placeholder="e.g. 5000" 
                            value={form.words} 
                            onChange={(e) => setForm({ ...form, words: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="urgency" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Turnaround Needs</Label>
                          <select 
                            id="urgency" 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={form.urgency} 
                            onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                          >
                            <option value="standard">Standard (7-10 Days)</option>
                            <option value="express">Express (3-5 Days)</option>
                            <option value="urgent">Urgent (24-48 Hours)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Project Description & Style Guides</Label>
                        <Textarea 
                          id="message" 
                          rows={4} 
                          placeholder="Please provide any instructions, formatting guide (e.g. APA 7, IEEE), or specific editing requests..." 
                          value={form.message} 
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                        />
                      </div>

                      {/* Mock File Upload */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Upload Draft Manuscript (optional)</Label>
                        <div className="flex items-center gap-4">
                          <Label 
                            htmlFor="file-upload" 
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-slate-300 dark:border-zinc-700 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm font-semibold transition-all"
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
                          <span className="text-xs text-slate-400 truncate max-w-[200px]">
                            {fileName || "No file selected (Supports .doc, .docx, .pdf)"}
                          </span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer mt-4 py-6 font-semibold">
                        <Send className="mr-2 h-4 w-4" />
                        Send Editorial Request
                      </Button>
                    </form>
                  ) : (
                    <div className="py-12 text-center space-y-6">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Request Submitted Successfully!</h3>
                        <p className="text-slate-500 dark:text-zinc-400 font-light text-sm max-w-md mx-auto">
                          Thank you, <span className="font-semibold text-slate-700 dark:text-zinc-300">{form.name}</span>. We have received your manuscript/details. An editor will email you at <span className="font-semibold text-slate-700 dark:text-zinc-300">{form.email}</span> with a finalized quote and timeline analysis shortly.
                        </p>
                      </div>
                      <Button onClick={() => setSubmitted(false)} variant="outline" className="cursor-pointer">
                        Submit Another Inquiry
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
