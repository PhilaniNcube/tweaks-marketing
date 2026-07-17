"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const steps = [
  {
    num: "1",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/one.png",
    title: "Request a Quote",
    description: "Reach out to us to request a quote for your academic editing needs. Please provide your document details, including page count, and indicate which service(s) you require. We will then send you a quote along with an estimated turnaround time (typically five days from acceptance)."
  },
  {
    num: "2",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/two.png",
    title: "Confirm Your Details",
    description: "Review the quote and page count provided. Once you confirm that everything is correct and select the services you want to proceed with, we will finalise your order and reserve your place in the editing schedule."
  },
  {
    num: "3",
    img: "https://conceptafrika.com/wp-content/uploads/2021/09/three.png",
    title: "Email Your Document and Get Matched",
    description: "After confirmation and payment, you will receive instructions on how to email your document and any specific guidelines. An expert editor, matched to your subject area and quality requirements, will then be assigned to your project."
  }
];

export default function StepGuide() {
  return (
    <section id="howitworks" className="py-20 bg-white dark:bg-zinc-900 border-t border-b border-slate-100 dark:border-zinc-800/40 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Get a Quote in 3 Easy Steps
          </motion.h2>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-none" />
        </div>

        {/* Content split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Visual Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-4/3 rounded-none overflow-hidden shadow-xl border border-slate-100 dark:border-zinc-800">
              <Image
                src="https://conceptafrika.com/wp-content/uploads/2021/09/academic-editing-services-selection.jpg"
                alt="Academic Editing Services Selection"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Right Column: 3 Steps List */}
          <div className="lg:col-span-7 space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 p-6 rounded-none bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-800/40 hover:border-indigo-100 dark:hover:border-indigo-950 transition-all duration-300"
              >
                
                {/* Step Number Image */}
                <div className="relative w-12 h-14 shrink-0 bg-transparent flex items-center justify-center">
                  <Image
                    src={step.img}
                    alt={`Step ${step.num}`}
                    width={40}
                    height={47}
                    className="object-contain"
                  />
                </div>

                {/* Step Content */}
                <div className="space-y-1.5 text-left">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 dark:text-zinc-400 font-light text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
