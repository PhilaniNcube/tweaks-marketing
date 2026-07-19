import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-indigo-50/50 via-white to-white dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-900 py-20 sm:py-28">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-75 h-75 bg-teal-200/20 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-tweaks-blue dark:text-white leading-tight">
              Professional Academic Editing That Helps You Submit with
              Confidence
            </h1>

            <p className="text-lg text-slate-600 dark:text-zinc-300 font-light leading-relaxed max-w-2xl">
              We help students and researchers refine their dissertations,
              theses, journal articles, and research papers with expert academic
              editing, clear language, and accurate formatting, ready for
              submission, publication, or peer review.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-tweaks-blue hover:bg-tweaks-red text-white font-medium cursor-pointer px-8 py-6 rounded-none"
              >
                <Link href="/contact">
                  Get A Quote
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="bg-tweaks-red hover:bg-tweaks-blue text-white font-medium cursor-pointer px-8 py-6 rounded-none"
              >
                <Link href="#academicshop">
                  Explore Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/3 rounded-none overflow-hidden shadow-2xl border border-slate-200/50 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
              <Image
                src="/images/hero-academic-editing.jpg"
                alt="Professional Academic Editing Services"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/10 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
