import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/reveal";

export default function GetInTouch() {
  return (
    <section className="py-24 bg-[#fcb912] relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal className="flex flex-col items-center text-center gap-8 max-w-2xl mx-auto">
          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Get In Touch
            </h2>
            <p className="text-tweaks-blue text-base sm:text-lg leading-relaxed">
              To see why so many changemakers choose to work with us.
            </p>
          </div>

          {/* CTA Button */}
          <div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 bg-tweaks-red text-white font-bold text-sm sm:text-base px-8 py-4 hover:bg-tweaks-blue transition-colors duration-200 group"
            >
              <span>Get In Touch</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
