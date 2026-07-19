import React from "react";
import Image from "next/image";
import Reveal from "@/components/reveal";

const logos = [
  {
    src: "https://conceptafrika.com/wp-content/uploads/2025/05/11.png",
    alt: "Supporting Institution Logo 1",
  },
  {
    src: "https://conceptafrika.com/wp-content/uploads/2025/05/15.png",
    alt: "Supporting Institution Logo 2",
  },
  {
    src: "https://conceptafrika.com/wp-content/uploads/2025/05/13.png",
    alt: "Supporting Institution Logo 3",
  },
  {
    src: "https://conceptafrika.com/wp-content/uploads/2025/05/14.png",
    alt: "Supporting Institution Logo 4",
  },
];

export default function LogosBar() {
  return (
    <section className="py-12 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          {/* Label */}
          <div className="text-center md:text-left shrink-0">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              TRUSTED BY STUDENTS FROM
              <br />
              LEADING UNIVERSITIES
            </h4>
          </div>

          {/* Logos List */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 md:gap-12 items-center flex-1 justify-items-center max-w-4xl">
            {logos.map((logo, index) => (
              <Reveal
                key={logo.src}
                delay={index * 50}
                className="relative w-24 h-24 sm:w-28 sm:h-28 hover:scale-105 transition-all duration-300 filter grayscale opacity-70 hover:opacity-100 hover:grayscale-0 dark:invert dark:opacity-50 dark:hover:opacity-80"
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-contain"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
