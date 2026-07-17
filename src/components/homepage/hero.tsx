"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 py-20 sm:py-28">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">


            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-tweaks-blue dark:text-white leading-tight"
            >
              Expert Academic Editing for Confident Submissions

            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-zinc-300 font-light leading-relaxed max-w-2xl"
            >
              We help students and researchers polish their writing with clear, accurate language and proper formatting — ready for submission, publishing, or review.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Button asChild size="lg" className="bg-tweaks-red hover:bg-tweaks-blue text-white font-medium cursor-pointer px-8 py-6 rounded-none">
                <Link href="#academicshop">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-4/3 rounded-none overflow-hidden shadow-2xl border border-slate-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
              <Image
                src="https://conceptafrika.com/wp-content/uploads/2021/09/professional-academic-editing-services.jpg"
                alt="Professional Academic Editing Services"
                fill
                priority
                className="object-cover hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
            </div>
            {/* Subtle floating overlay accent */}

          </motion.div>

        </div>
      </div>
    </section>
  );
}
