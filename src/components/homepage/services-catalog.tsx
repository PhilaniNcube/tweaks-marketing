"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    name: "Academic Editing",
    price: "R45.00",
    href: "/academic-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/08/academic-editing-300x300.jpg",
    description: "Deep structural, stylistic, and grammatical polishing for theses and dissertations."
  },
  {
    name: "Journal Article Editing",
    price: "R2,200.00",
    href: "/journal-article-proposal-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/08/journal-article-editing-300x300.jpg",
    description: "Prepare your paper for international, peer-reviewed journal submission."
  },
  // {
  //   name: "Transcription",
  //   price: "R12.00",
  //   href: "/transcription",
  //   img: "https://conceptafrika.com/wp-content/uploads/2021/09/transcription-300x300.jpg",
  //   description: "Accurate conversion of research interviews and focus group audio to text."
  // },
  {
    name: "Reference Checking",
    price: "R7.50",
    href: "/reference-checking",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/reference-checking-300x300.jpg",
    description: "Verify in-text citations against your reference list for consistency."
  },
  {
    name: "Formatting",
    price: "R1,500.00",
    href: "/formatting",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/formatting-2-300x300.jpg",
    description: "Align margins, fonts, and headings to APA, Harvard, or university guidelines."
  },
  {
    name: "Reference List Editing",
    price: "R50.00",
    href: "/reference-list-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/reference-list-editing-300x300.jpg",
    description: "Clean up and standardize your reference list entries to a chosen style guide."
  },
  {
    name: "Abstract Editing",
    price: "R1,000.00",
    href: "/abstract-editing",
    img: "https://conceptafrika.com/wp-content/uploads/2022/12/abstract-editing-300x300.jpg",
    description: "Refining abstract summaries to ensure impact and conciseness for readers."
  }
];

export default function ServicesCatalog() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleScroll = () => {
    if (!hasScrolled && scrollRef.current && scrollRef.current.scrollLeft > 10) {
      setHasScrolled(true);
    }
  };

  return (
    <section id="academicshop" className="py-20 bg-slate-50 dark:bg-zinc-950/60 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Academic Editing Services
          </motion.h2>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-none" />
          <p className="text-slate-600 dark:text-zinc-400 font-light text-base leading-relaxed">
            Browse the list below to learn more about each of our academic editing services. Each description outlines what’s included, who it’s for, and how it can support your academic goals.
          </p>
        </div>

        {/* Mobile swipe hint — hidden once user scrolls or on sm+ */}
        <div
          className={`sm:hidden flex items-center justify-center gap-2 mb-6 transition-all duration-500 ${
            hasScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium tracking-wide">
            Swipe to explore
          </span>
          <motion.div
            className="flex items-center text-indigo-500"
            animate={{ x: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          >
            <ChevronRight className="w-4 h-4 -mr-2" />
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Product Cards — horizontal scroll carousel on mobile, grid on sm+ */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="
          sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-8
          flex overflow-x-auto gap-5 snap-x snap-mandatory scroll-smooth
          pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:pb-0
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        ">

          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 20 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              viewport={isMobile ? undefined : { once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: isMobile ? 0 : index * 0.05 }}
              className="flex flex-none w-[75vw] sm:w-auto snap-start"
            >
              <div className="flex flex-col w-full bg-white dark:bg-zinc-900 rounded-none border border-slate-100 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">

                {/* Product Thumbnail */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800/80">
                  <Image
                    src={product.img}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-none bg-white/90 shadow-md flex items-center justify-center text-slate-900 transform scale-90 group-hover:scale-100 transition-transform">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col justify-between flex-1 text-left space-y-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="text-indigo-600 dark:text-indigo-400 font-extrabold text-base">
                      {product.price}
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-zinc-400 font-light text-xs leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  <div className="pt-2">
                    <Button asChild variant="outline" className="w-full justify-between font-semibold border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer rounded-none">
                      <a href={product.href} className="inline-flex w-full items-center justify-between">
                        <span>Learn More</span>
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
