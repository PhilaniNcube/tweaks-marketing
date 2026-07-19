"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RefineSection() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-light tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            You&apos;ve Done the Hard Work. Now Let Us Refine It.
          </motion.h2>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-full" />
        </div>

        {/* 3-Column Content (Left: Image, Middle: Argument, Right: Refinement) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Column 1: Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative aspect-4/3 md:aspect-auto rounded-2xl overflow-hidden shadow-lg border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 flex"
          >
            <Image
              src="https://conceptafrika.com/wp-content/uploads/2021/09/comprehensive-academic-editing.jpg"
              alt="Comprehensive Academic Editing"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Column 2: Hard Work Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-start p-6 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-100 dark:border-zinc-800/50"
          >
            <p className="text-slate-700 dark:text-zinc-300 font-light leading-relaxed text-base">
              You&apos;ve done the hard work: gathering your research,
              developing your argument, and putting your ideas into writing. Now
              let us help you submit your work with confidence.
            </p>
          </motion.div>

          {/* Column 3: The Tweaks Solution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col justify-between p-6 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/10"
          >
            <p className="text-slate-700 dark:text-zinc-300 font-light leading-relaxed text-base">
              That&apos;s where we come in. Tweaks offers professional academic
              editing and proofreading services to help you polish your research
              with confidence. Whether you&apos;re preparing a thesis, dissertation,
              research paper, or academic report, our expert academic editors
              ensure your writing is clear, well-structured, and ready for
              submission, with tracked changes and reliable on-time delivery.
            </p>
            <div className="pt-6">
              <Button
                asChild
                className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white font-semibold cursor-pointer shadow-sm rounded-xl py-5"
              >
                <Link href="#howitworks">Give Tweaks a Try</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
