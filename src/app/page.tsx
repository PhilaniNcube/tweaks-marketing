"use client";

import React from "react";
import Hero from "@/components/homepage/hero";
import RefineSection from "@/components/homepage/refine-section";
import QuoteCallout from "@/components/homepage/quote-callout";
import ExpertCare from "@/components/homepage/expert-care";
import WhatWeEdit from "@/components/homepage/what-we-edit";
import LogosBar from "@/components/homepage/logos-bar";
import Testimonials from "@/components/homepage/testimonials";
import StepGuide from "@/components/homepage/step-guide";
import ServicesCatalog from "@/components/homepage/services-catalog";
import FAQSection from "@/components/homepage/faq-section";
import Values from "@/components/homepage/values";
import GetInTouch from "@/components/homepage/get-in-touch";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Hero />
      <RefineSection />
      <QuoteCallout />
      <ExpertCare />
      <WhatWeEdit />
      <LogosBar />
      <Testimonials />
      <ServicesCatalog />
      <StepGuide />
      <FAQSection />
      <Values />
      <GetInTouch />
    </div>
  );
}
