"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AlertCircle, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/reveal";

type DeliverySpeed = "standard" | "express";

interface ServiceDef {
  id: string;
  name: string;
  unit: string;
  defaultQty: number;
  min: number;
  max: number;
  numberMax: number;
  basePrice: number;
  expressAddon: number;
  flat?: boolean;
  wordsPerPage?: number;
}

const services: ServiceDef[] = [
  {
    id: "academic-editing",
    name: "Academic Editing",
    unit: "A4 page",
    defaultQty: 10,
    min: 1,
    max: 400,
    numberMax: 1000,
    basePrice: 45.0,
    expressAddon: 15.0,
    wordsPerPage: 300,
  },
  {
    id: "reference-checking",
    name: "Reference Checking",
    unit: "A4 page",
    defaultQty: 10,
    min: 1,
    max: 400,
    numberMax: 1000,
    basePrice: 7.5,
    expressAddon: 3.0,
    wordsPerPage: 300,
  },
  {
    id: "reference-list-editing",
    name: "Reference List Editing",
    unit: "A4 page",
    defaultQty: 5,
    min: 1,
    max: 200,
    numberMax: 500,
    basePrice: 50.0,
    expressAddon: 25.0,
    wordsPerPage: 300,
  },
  {
    id: "formatting",
    name: "Formatting",
    unit: "document",
    defaultQty: 1,
    min: 1,
    max: 1,
    numberMax: 1,
    basePrice: 1500.0,
    expressAddon: 800.0,
    flat: true,
  },
];

function formatZAR(amount: number): string {
  return amount.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function StepGuide() {
  const [selected, setSelected] = useState<string[]>(["academic-editing"]);
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "academic-editing": 10,
  });
  const [speeds, setSpeeds] = useState<Record<string, DeliverySpeed>>({
    "academic-editing": "standard",
  });
  const [activeTabId, setActiveTabId] = useState<string>("academic-editing");

  const toggleService = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      const svc = services.find((s) => s.id === id);
      if (svc) {
        setQuantities((q) => ({ ...q, [id]: q[id] ?? svc.defaultQty }));
        setSpeeds((sp) => ({ ...sp, [id]: sp[id] ?? "standard" }));
      }
      return [...prev, id];
    });
  };

  const computeCost = (svc: ServiceDef) => {
    const qty = quantities[svc.id] ?? svc.defaultQty;
    const speed = speeds[svc.id] ?? "standard";
    const rate =
      speed === "express" ? svc.basePrice + svc.expressAddon : svc.basePrice;
    const subtotal = svc.flat ? svc.basePrice : qty * rate;
    return { qty, speed, subtotal };
  };

  const selectedServices = services.filter((s) => selected.includes(s.id));
  const grandTotal = selectedServices.reduce(
    (sum, svc) => sum + computeCost(svc).subtotal,
    0,
  );

  const summaryParts = selectedServices.map((svc) => {
    const { qty, speed } = computeCost(svc);
    const unitLabel = svc.flat
      ? svc.unit
      : `${qty} ${svc.unit}${qty > 1 ? "s" : ""}`;
    return `${svc.name}: ${unitLabel} (${speed})`;
  });
  const serviceStr = selectedServices.map((s) => s.id).join(",");
  const summary = encodeURIComponent(summaryParts.join("; "));
  const contactHref = selectedServices.length
    ? `/contact?service=${encodeURIComponent(serviceStr)}&pageCount=${summary}`
    : "/contact";

  const activeService =
    services.find((s) => s.id === activeTabId) ?? services[0];
  const isActiveSelected = selected.includes(activeService.id);
  const activeCost = computeCost(activeService);

  return (
    <section
      id="howitworks"
      className="py-20 bg-white dark:bg-zinc-900 border-t border-b border-slate-100 dark:border-zinc-800/40 scroll-mt-16"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Reveal
            as="h2"
            className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
          >
            Get an Instant Editing Estimate
          </Reveal>
          <div className="w-16 h-1 bg-indigo-600 dark:bg-indigo-400 mx-auto rounded-none" />
          <p className="text-slate-600 dark:text-zinc-400 font-light text-base leading-relaxed">
            Find out what your project is likely to cost in less than a minute.
            Once you&apos;ve completed your estimate you&apos;ll be able to
            request a formal quote for your thesis.
          </p>
        </div>

        {/* Content split: image + calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
          {/* Left Column: Visual Image — sticky on desktop */}
          <Reveal className="lg:sticky lg:top-24 flex flex-col gap-6">
            <div className="relative aspect-4/3 rounded-none overflow-hidden shadow-xl border border-slate-100 dark:border-zinc-800">
              <Image
                src="https://conceptafrika.com/wp-content/uploads/2021/09/academic-editing-services-selection.jpg"
                alt="Academic Editing Services Selection"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Helper hint card under image, matches planner styling */}
            <div className="border border-slate-100 dark:border-zinc-800/80 p-6 bg-slate-50 dark:bg-zinc-900/50 rounded-none text-left space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                <Calculator className="h-3.5 w-3.5 text-tweaks-blue" />
                <span>How the estimate works</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-light leading-relaxed">
                Estimates are calculated from each service&rsquo;s published
                rate and your chosen delivery speed. Final quotes are confirmed
                by our team and may vary based on document complexity and the
                details you provide in the brief.
              </p>
            </div>
          </Reveal>

          {/* Right Column: Interactive Multi-Service Estimator */}
          <Reveal delay={100}>
            <div className="border border-slate-200 dark:border-zinc-800 p-6 bg-slate-50/50 dark:bg-zinc-900/30 rounded-none space-y-6">
              <div className="space-y-2">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">
                  Estimated Cost &amp; Quantity Planner
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                  Pick a service tab, adjust its quantity and delivery speed,
                  then add it to your estimate. Switch tabs to plan more
                  services. All prices are in South African Rand (ZAR).
                </p>
              </div>

              {/* Service tabs */}
              <div
                className="flex sm:grid sm:grid-cols-3 lg:grid-cols-3 gap-2 overflow-x-auto sm:overflow-visible -mx-1 px-1 sm:mx-0 sm:px-0
                scrollbar-none [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
              >
                {services.map((svc) => {
                  const isActive = svc.id === activeService.id;
                  const isIncluded = selected.includes(svc.id);
                  return (
                    <button
                      type="button"
                      key={svc.id}
                      onClick={() => setActiveTabId(svc.id)}
                      className={`snap-start flex items-center justify-between gap-2 px-3 py-2.5 border rounded-none text-left transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "border-tweaks-blue bg-tweaks-blue text-white"
                          : "border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100/60 dark:hover:bg-zinc-950 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {svc.name}
                      </span>
                      <span
                        aria-hidden
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          isIncluded
                            ? "bg-emerald-400 ring-2 ring-emerald-400/30"
                            : isActive
                              ? "bg-white/40"
                              : "bg-slate-300 dark:bg-zinc-700"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Active tab planner */}
              <div className="border rounded-none border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="p-5 space-y-5 text-left">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {activeService.name}
                    </h4>
                    <div className="text-tweaks-blue font-extrabold text-sm">
                      R {formatZAR(activeService.basePrice)}
                      <span className="ml-1 text-xs font-normal text-slate-500 dark:text-zinc-400">
                        / {activeService.unit}
                        {activeService.flat ? " — flat fee" : ""}
                      </span>
                    </div>
                  </div>

                  {!activeService.flat && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <label
                          htmlFor={`${activeService.id}-range`}
                          className="capitalize"
                        >
                          {activeService.unit}s:
                        </label>
                        <span className="text-tweaks-blue font-bold">
                          {activeCost.qty} {activeService.unit}
                          {activeCost.qty > 1 ? "s" : ""}
                          {activeService.wordsPerPage
                            ? ` (approx. ${(activeCost.qty * activeService.wordsPerPage).toLocaleString("en-ZA")} words)`
                            : ""}
                        </span>
                      </div>
                      <input
                        id={`${activeService.id}-range`}
                        type="range"
                        aria-label={`${activeService.name} quantity in ${activeService.unit}s`}
                        min={activeService.min}
                        max={activeService.max}
                        value={activeCost.qty}
                        onChange={(e) =>
                          setQuantities((q) => ({
                            ...q,
                            [activeService.id]: parseInt(e.target.value) || 1,
                          }))
                        }
                        className="w-full h-1 bg-slate-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-tweaks-blue"
                      />
                      <input
                        id={`${activeService.id}-number`}
                        type="number"
                        aria-label={`${activeService.name} quantity in ${activeService.unit}s`}
                        min={activeService.min}
                        max={activeService.numberMax}
                        value={activeCost.qty}
                        onChange={(e) =>
                          setQuantities((q) => ({
                            ...q,
                            [activeService.id]: Math.max(
                              1,
                              parseInt(e.target.value) || 1,
                            ),
                          }))
                        }
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 px-3 py-2 text-sm outline-none rounded-none focus-visible:border-tweaks-blue"
                      />
                    </div>
                  )}

                  {activeService.flat ? (
                    <div className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                      This is a flat-fee service &mdash; no quantity or
                      delivery-speed adjustment required.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs font-semibold">
                        Delivery Speed Option:
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSpeeds((sp) => ({
                              ...sp,
                              [activeService.id]: "standard",
                            }))
                          }
                          className={`flex flex-col p-3 border text-left rounded-none transition-all cursor-pointer ${
                            activeCost.speed === "standard"
                              ? "border-tweaks-blue bg-indigo-50/10 text-tweaks-blue font-semibold"
                              : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50"
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wider font-bold">
                            Standard Delivery
                          </span>
                          <span className="text-xs font-light mt-1">
                            3 - 5 Days Included
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSpeeds((sp) => ({
                              ...sp,
                              [activeService.id]: "express",
                            }))
                          }
                          className={`flex flex-col p-3 border text-left rounded-none transition-all cursor-pointer ${
                            activeCost.speed === "express"
                              ? "border-tweaks-blue bg-indigo-50/10 text-tweaks-blue font-semibold"
                              : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50"
                          }`}
                        >
                          <span className="text-xs uppercase tracking-wider font-bold">
                            Express Delivery
                          </span>
                          <span className="text-xs font-light mt-1">
                            24 - 48 Hours (+R{" "}
                            {formatZAR(activeService.expressAddon)} /{" "}
                            {activeService.unit})
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active service subtotal */}
                  <div className="flex justify-between items-baseline border-t border-slate-100 dark:border-zinc-900/80 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {activeService.name} subtotal:
                    </span>
                    <span className="text-base font-black text-tweaks-blue">
                      R {formatZAR(activeCost.subtotal)}
                    </span>
                  </div>

                  {/* Include toggle */}
                  <button
                    type="button"
                    onClick={() => toggleService(activeService.id)}
                    className={`w-full flex items-center justify-center gap-2 py-3 border rounded-none text-sm font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      isActiveSelected
                        ? "border-tweaks-red/40 bg-tweaks-red/10 text-tweaks-red hover:bg-tweaks-red/15"
                        : "border-tweaks-blue bg-tweaks-blue text-white hover:bg-indigo-700"
                    }`}
                  >
                    {isActiveSelected
                      ? "Remove from estimate"
                      : "Add to estimate"}
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActiveSelected ? "bg-tweaks-red" : "bg-emerald-400"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Included services summary */}
              {selectedServices.length > 0 && (
                <div className="space-y-2 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Included services ({selectedServices.length})
                  </div>
                  <ul className="flex flex-wrap gap-2">
                    {selectedServices.map((svc) => {
                      const { qty, speed } = computeCost(svc);
                      const unitLabel = svc.flat
                        ? svc.unit
                        : `${qty} ${svc.unit}${qty > 1 ? "s" : ""}`;
                      return (
                        <li
                          key={svc.id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-none text-xs font-semibold"
                        >
                          <span
                            aria-hidden
                            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                          />
                          <span className="text-slate-700 dark:text-zinc-300">
                            {svc.name}
                          </span>
                          <span className="text-slate-400 dark:text-zinc-500 font-light">
                            {unitLabel} • {speed}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remove ${svc.name}`}
                            onClick={() => toggleService(svc.id)}
                            className="text-slate-400 hover:text-tweaks-red transition-colors ml-1"
                          >
                            ×
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Order Quantity Directive */}
              <div className="flex gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 text-xs text-amber-800 dark:text-amber-300 rounded-none text-left">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <p className="font-light leading-relaxed">
                  <strong>Order Quantity Directive:</strong> Please increase the
                  quantity of each service to match the size of your document.
                  If you purchase fewer items than the number of pages or
                  documents you submit, only the quantity purchased will be
                  edited.
                </p>
              </div>

              {/* Grand total + CTA */}
              <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Estimated Total:
                </span>
                <span className="text-2xl font-black text-tweaks-blue">
                  R {formatZAR(grandTotal)}
                </span>
              </div>

              <Button
                asChild
                size="lg"
                className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white font-bold cursor-pointer rounded-none py-6 shadow-md transition-colors"
              >
                <Link href={contactHref}>
                  {selectedServices.length
                    ? "Request a Quote"
                    : "Request a Quote"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
