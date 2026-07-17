"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Users } from "lucide-react";

const carePoints = [
  {
    title: "Transparent Edits",
    description: "All edits are tracked for easy review. We improve clarity, structure, and grammar while preserving your voice. You stay in control, with every change clearly marked.",
    icon: CheckCircle2,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
  },
  {
    title: "On Time",
    description: "We know deadlines matter. Most projects return in 3–5 days, depending on length. We schedule efficiently, provide updates, and ensure you have time to review before submission. Deadlines are always met.",
    icon: Clock,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
  },
  {
    title: "Trusted by Academics",
    description: "Your document is handled by a qualified editor. Our experienced team specialises in helping postgraduate students and researchers, especially second-language English speakers, ensuring clarity, accuracy, and the right tone.",
    icon: Users,
    color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
  }
];

export default function ExpertCare() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Title and Image */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
              >
                Your Work Deserves Expert Care
              </motion.h2>
              <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-none" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative aspect-3/2 rounded-none overflow-hidden shadow-xl border border-slate-100 dark:border-zinc-800"
            >
              <Image
                src="https://conceptafrika.com/wp-content/uploads/2025/05/expert-academic-editing-scaled.jpg"
                alt="Expert Academic Editing"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Right Column: Key Blurbs */}
          <div className="lg:col-span-6 space-y-6">
            {carePoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4 p-6 bg-slate-50 dark:bg-zinc-950/40 rounded-none border border-slate-100 dark:border-zinc-800/40 hover:border-indigo-100 dark:hover:border-indigo-950 hover:shadow-md transition-all duration-300"
                >
                  <div className={`p-3 rounded-none shrink-0 h-fit ${point.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {point.title}
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 font-light text-sm leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
