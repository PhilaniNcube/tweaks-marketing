import React from "react";
import Image from "next/image";
import Reveal from "@/components/reveal";

const values = [
  {
    name: "Rusununguko",
    sub: "Freedom",
    description:
      "We are a collective, reimagining life, freeing ourselves to operate at our optimised versions and hoping you will join us.",
    image: "/images/rusununguko.png",
  },
  {
    name: "Ruzivo",
    sub: "Knowledge",
    description:
      "We value knowledge gained through professional and personal experiences and education – through perceiving, discovering, and learning.",
    image: "/images/ruzivo.png",
  },
  {
    name: "Ububele",
    sub: "Empathy",
    description:
      "We empower! Keeping a deep awareness of the real-life challenges that the marginalised face is essential and informs solution mapping.",
    image: "/images/ububele.png",
  },
  {
    name: "Ubuchule",
    sub: "Creativity",
    description:
      "Ubuchule Is the creative source of our innovation and inspiration. It challenges us to find solutions collaboratively.",
    image: "/images/ubuchule.png",
  },
  {
    name: "Inkululeko",
    sub: "Change",
    description:
      "Change is inevitable, and so, we are always prepared to respond, adapt, scale and move in a different direction. Quickly!",
    image: "/images/inkululeko.png",
  },
  {
    name: "Ubuntu",
    sub: "Community",
    description:
      "We are! through others. We strongly believe in a universal bond of sharing that connects all of us.",
    image: "/images/ubuntu.png",
  },
];

export default function Values() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-4">
          <Reveal
            as="h2"
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Our Values
          </Reveal>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-none" />
          <p className="text-slate-600 dark:text-zinc-400 font-light text-base leading-relaxed">
            The principles that guide every decision we make and every
            relationship we build.
          </p>
        </div>

        {/* Values Grid — 2 cols on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {values.map((value, index) => (
            <Reveal
              key={value.name}
              delay={index * 70}
              className="group flex flex-col dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Image — portrait container, full image always visible */}
              <div className="relative w-3/4 flex justify-center items-center mx-auto aspect-[3/4] bg-white dark:bg-zinc-950">
                <Image
                  src={value.image}
                  alt={value.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain"
                />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-center gap-2">
                  <h3 className="font-bold text-lg sm:text-xl text-center w-full text-tweaks-blue dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {value.sub}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 text-center dark:text-zinc-400 font-light leading-relaxed line-clamp-3">
                  {value.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
