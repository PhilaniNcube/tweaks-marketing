"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Mail, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const checkmarks = [
  "Grammar & Spelling",
  "Structure & Flow",
  "Clarity & Tone",
  "Formatting & Style",
  "Reference Accuracy",
  "Expert Feedback"
];

const shortServicesList = [
  { name: "Academic Editing", href: "/academic-editing" },
  { name: "Journal Article Editing", href: "/journal-article-proposal-editing" },
  { name: "Reference Checking", href: "/reference-checking" },
  { name: "Reference List Editing", href: "/reference-list-editing" },
  { name: "Formatting", href: "/formatting" },
  // { name: "Transcription Services", href: "/transcription" }
];

export default function WhatWeEdit() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background graphic elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Column: What We Edit Checklist */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                What We Edit:
              </motion.h2>
              <div className="w-16 h-1 bg-indigo-400 rounded-none" />
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {checkmarks.map((item, index) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center gap-3 text-slate-100 text-lg font-medium"
                >
                  <div className="w-6 h-6 rounded-none bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Right Column: Our Services Short List */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Our Services
              </h2>
              <div className="w-16 h-1 bg-indigo-400 rounded-none" />
            </div>

            <div className="space-y-3">
              {shortServicesList.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Link
                    href={service.href}
                    className="group flex justify-between items-center p-4 rounded-none border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700 transition-all duration-300"
                  >
                    <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {service.name}
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-2"
            >
              <Button asChild size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-md rounded-none py-6">
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Request Quote
                </Link>
              </Button>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
