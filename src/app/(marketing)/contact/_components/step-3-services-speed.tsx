"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Clock, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  formatZarFromCents,
  type CalculatedQuoteResult,
} from "@/lib/pricing/quote-calculator";
import type { Service } from "@/db/schema";
import type { ContactFormValues } from "./types";

interface Step3ServicesSpeedProps {
  catalog: Service[];
  liveQuote: CalculatedQuoteResult;
}

export function Step3ServicesSpeed({
  catalog,
  liveQuote,
}: Step3ServicesSpeedProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const watchedServices = watch("services") || [];
  const watchedDeliverySpeed = watch("deliverySpeed");

  const handleServiceToggle = (serviceName: string, checked: boolean) => {
    const current = watchedServices || [];
    if (checked) {
      setValue("services", [...current, serviceName], { shouldValidate: true });
    } else {
      setValue(
        "services",
        current.filter((item) => item !== serviceName),
        { shouldValidate: true },
      );
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 3: Select Services &amp; Turnaround Speed
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          All six live services from our rate card. Tick all that apply.
        </p>
      </div>

      <FieldSet data-invalid={!!errors.services}>
        <FieldLegend variant="label">
          Which services do you require?{" "}
          <span className="text-destructive">*</span>
        </FieldLegend>
        <div className="grid grid-cols-1 gap-3">
          {catalog.map((svc) => {
            const isChecked =
              watchedServices.includes(svc.name) ||
              watchedServices.includes(svc.slug);
            const basisLabel =
              svc.pricingBasis === "per_page"
                ? "per page"
                : svc.pricingBasis === "per_reference_page"
                  ? "per reference page"
                  : svc.pricingBasis === "flat_document"
                    ? "flat per document"
                    : svc.pricingBasis === "flat_article"
                      ? "flat per article/proposal"
                      : "flat per abstract";

            return (
              <FieldLabel
                key={svc.id}
                htmlFor={`service-${svc.id}`}
                className={`w-full cursor-pointer border transition-colors ${
                  isChecked
                    ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Field orientation="horizontal" className="items-start">
                  <Checkbox
                    id={`service-${svc.id}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleServiceToggle(svc.name, checked === true)
                    }
                    className="mt-0.5"
                  />
                  <FieldContent>
                    <FieldTitle>{svc.name}</FieldTitle>
                    {svc.description && (
                      <FieldDescription>{svc.description}</FieldDescription>
                    )}
                    <FieldDescription className="text-[11px]">
                      Standard: {svc.standardTurnaroundMinDays}–
                      {svc.standardTurnaroundMaxDays} days | Express:{" "}
                      {svc.expressTurnaroundMinHours ===
                      svc.expressTurnaroundMaxHours
                        ? `${svc.expressTurnaroundMinHours} hours`
                        : `${svc.expressTurnaroundMinHours}–${svc.expressTurnaroundMaxHours} hours`}{" "}
                      (+{formatZarFromCents(svc.expressSurchargeCents, false)}{" "}
                      {basisLabel})
                    </FieldDescription>
                  </FieldContent>
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-extrabold text-tweaks-blue">
                      {formatZarFromCents(svc.standardRateCents)}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      {basisLabel}
                    </span>
                  </div>
                </Field>
              </FieldLabel>
            );
          })}
        </div>
        <FieldError errors={[errors.services]} />
      </FieldSet>

      <FieldSet data-invalid={!!errors.deliverySpeed}>
        <FieldLegend variant="label">
          Delivery Speed <span className="text-destructive">*</span>
        </FieldLegend>
        <RadioGroup
          value={watchedDeliverySpeed}
          onValueChange={(value) =>
            setValue("deliverySpeed", value as "standard" | "express", {
              shouldValidate: true,
            })
          }
          aria-invalid={!!errors.deliverySpeed}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <FieldLabel
            htmlFor="deliverySpeed-standard"
            className={`w-full cursor-pointer border transition-colors ${
              watchedDeliverySpeed === "standard"
                ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                id="deliverySpeed-standard"
                value="standard"
                className="mt-0.5"
              />
              <FieldContent>
                <FieldTitle>
                  <Clock className="h-4 w-4 text-tweaks-blue" />
                  <span>Standard Delivery</span>
                </FieldTitle>
                <FieldDescription>
                  {liveQuote.turnaround.minDays} to{" "}
                  {liveQuote.turnaround.maxDays} days from when we receive your
                  document. Standard rate card applies.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel
            htmlFor="deliverySpeed-express"
            className={`w-full cursor-pointer border transition-colors ${
              watchedDeliverySpeed === "express"
                ? "border-tweaks-red bg-red-50/30 dark:bg-red-950/20"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                id="deliverySpeed-express"
                value="express"
                className="mt-0.5"
              />
              <FieldContent>
                <FieldTitle>
                  <Zap className="h-4 w-4 text-tweaks-red" />
                  <span>Express Priority</span>
                </FieldTitle>
                <FieldDescription>
                  {liveQuote.turnaround.expressMinHours} to{" "}
                  {liveQuote.turnaround.expressMaxHours} hours priority
                  turnaround. Express surcharge applies to selected services.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </RadioGroup>
        <FieldError errors={[errors.deliverySpeed]} />
      </FieldSet>

      <Field data-invalid={!!errors.mainGoal}>
        <FieldLabel htmlFor="mainGoal">
          What is the main goal of the edit? (min 20 characters){" "}
          <span className="text-destructive">*</span>
        </FieldLabel>
        <Textarea
          id="mainGoal"
          rows={3}
          placeholder="e.g. Prepare my PhD thesis for final examination submission, improve academic tone and flow..."
          aria-invalid={!!errors.mainGoal}
          className="resize-none"
          {...register("mainGoal")}
        />
        <FieldError errors={[errors.mainGoal]} />
      </Field>

      <Field data-invalid={!!errors.concerns}>
        <FieldLabel htmlFor="concerns">
          Do you have any particular concerns you&apos;d like us to focus on?
        </FieldLabel>
        <Textarea
          id="concerns"
          rows={2}
          placeholder="e.g. Wordiness, academic tone, citation consistency, repetition"
          aria-invalid={!!errors.concerns}
          className="resize-none"
          {...register("concerns")}
        />
        <FieldError errors={[errors.concerns]} />
      </Field>
    </div>
  );
}
