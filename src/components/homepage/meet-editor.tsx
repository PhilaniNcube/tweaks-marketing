import React from "react";
import Image from "next/image";
import Reveal from "@/components/reveal";

export default function MeetEditor() {
  return (
    <section className="py-20 bg-slate-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Editor Image */}
          <div className="lg:col-span-5 space-y-8">
            <Reveal
              variant="fade"
              className="relative aspect-3/4 rounded-none overflow-hidden shadow-xl border border-slate-100 dark:border-zinc-800"
            >
              <Image
                src="https://conceptafrika.com/wp-content/uploads/2021/10/Chengetai-Chikadaya.jpg"
                alt="Chengetai Chikadaya, founder of ZUVA Academic Coaching"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </Reveal>
          </div>

          {/* Right Column: Bio */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-4">
              <Reveal
                as="h2"
                className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
              >
                MEET YOUR EDITOR
              </Reveal>
              <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-none" />
            </div>

            <Reveal
              delay={100}
              className="space-y-4 text-slate-700 dark:text-zinc-300 font-light leading-relaxed"
            >
              <p className="text-lg font-medium text-slate-900 dark:text-white">
                I am Chengetai Chikadaya — Researcher, Academic Editor, Writer,
                and founder of ZUVA Academic Coaching.
              </p>
              <p>
                One of the biggest challenges I have observed over the past 16
                years is that exceptional research is often overlooked because
                it is not communicated as clearly as it could be. Strong ideas
                deserve strong writing, and every researcher deserves the
                opportunity to have their work judged on the quality of their
                thinking, not the clarity of their language.
              </p>
              <p>
                As the founder of Zuva Academic Coaching, I have spent the last
                16 years supporting students, researchers, and academics at
                every stage of their academic journey. During this time, I have
                edited thousands of research papers, dissertations, theses,
                journal articles, and academic manuscripts, helping authors
                strengthen clarity, improve structure, and meet the standards
                expected by universities and academic publishers.
              </p>
              <p>
                My approach goes beyond proofreading. I work collaboratively
                with every client to preserve their voice while enhancing
                clarity, coherence, and academic rigour. Whether you are
                preparing your first dissertation or your latest journal
                article, my goal is to ensure your work is polished,
                professional, and ready for submission.
              </p>
              <p>
                I believe great research has the power to change lives,
                influence policy, and advance knowledge. My mission is to help
                you communicate your ideas with clarity, confidence, and the
                impact they deserve.
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
