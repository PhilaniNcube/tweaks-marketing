"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonialsData = [
  {
    quote: "Working with Tweaks is great, their editors are on the ball, on the money all the time and that is what I need from an editor.",
    author: "Mvuzo Ponono",
    position: "Lecturer",
    company: "University of the Free State",
    image: "https://conceptafrika.com/wp-content/uploads/2021/09/Muvzo-Ponono.jpg"
  },
  {
    quote: "The best thing after being proofread by Tweaks is the input that they offer.",
    author: "Xolisa Ngubelenga",
    position: "Masters in Creative Writing",
    company: "Rhodes University",
    image: "https://conceptafrika.com/wp-content/uploads/2021/09/Xolisa-Ngubelenga2.jpg"
  },
  {
    quote: "Tweaks assisted me with editing my research. I would highly recommend their services for a second language English speaker.",
    author: "Ina Ertner",
    position: "Honours Student",
    company: "",
    image: "https://conceptafrika.com/wp-content/uploads/2021/09/Ina-Ertner.jpg"
  },
  {
    quote: "I engaged Tweaks for editing services for my Master's treatise. The service was affordable and delivered within the agreed timeline. Moreover, the editing process was meticulous. I was a satisfied client and I believe this editing process helped improve the mark and grade I got for my treatise. I recommend their services to students that need a quality document output that is professional.",
    author: "Dr. Albert Kagande",
    position: "Lecturer",
    company: "Nelson Mandela University",
    image: "https://conceptafrika.com/wp-content/uploads/2021/09/Albert-Kagande2.jpg"
  },
  {
    quote: "Tweaks edited my PhD thesis. After working so many hours on it, it helped to have someone else look at it with fresh eyes. Someone I could also talk to about my concerns with language. The overall experience was great!",
    author: "Dr. Kinga Mnich",
    position: "Impact Coach",
    company: "",
    image: "https://conceptafrika.com/wp-content/uploads/2021/09/Dr-Kinga-Mnich2.jpg"
  },
  {
    quote: "Thank you so much for all the help, I really appreciate it.",
    author: "Daniel Kankenga",
    position: "Masters Student",
    company: "University of Witwatersrand",
    image: "https://conceptafrika.com/wp-content/uploads/2021/09/Daniel-Kakenga2.jpg"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-slate-50 dark:bg-zinc-950/60 scroll-mt-16">
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
            Testimonials
          </motion.h2>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-none" />
          <p className="text-slate-600 dark:text-zinc-400 font-light text-base">
            What students, lecturers, and researchers say about their experience with Tweaks.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {testimonialsData.map((item, index) => (
            <motion.div
              key={item.author}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="flex flex-col justify-between p-8 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-none shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group"
            >
              {/* Quote Icon Overlay */}
              <div className="absolute top-6 right-6 text-slate-100 dark:text-zinc-800/50 pointer-events-none transition-colors group-hover:text-indigo-50 dark:group-hover:text-indigo-950/20">
                <Quote className="w-8 h-8" />
              </div>

              {/* Text quote */}
              <p className="text-slate-600 dark:text-zinc-300 italic font-light text-sm leading-relaxed mb-8 text-left relative z-10">
                "{item.quote}"
              </p>

              {/* Author metadata */}
              <div className="flex items-center gap-4 border-t border-slate-100 dark:border-zinc-800/80 pt-6 mt-auto">
                <div className="relative w-12 h-12 rounded-none overflow-hidden shrink-0 border border-slate-200/50 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950">
                  <Image
                    src={item.image}
                    alt={item.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 dark:text-white text-base">
                    {item.author}
                  </div>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {item.position}
                  </div>
                  {item.company && (
                    <div className="text-[10px] text-slate-400 font-medium">
                      {item.company}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
