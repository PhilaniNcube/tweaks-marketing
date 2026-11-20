"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2, Clock, Zap } from "lucide-react";
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
  SERVICE_GROUPS,
  formatZarFromCents,
  getServiceSubLabel,
  type CalculatedQuoteResult,
} from "@/lib/pricing/quote-calculator";
import type { Service, ServiceGroup } from "@/db/schema";
import type { ContactFormValues } from "./types";

interface Step3ServicesSpeedProps {
  catalog: Service[];
  liveQuote: CalculatedQuoteResult;
}

function getBasisLabel(svc: Service): string {
  if (svc.pricingBasis === "per_page") return "per page";
  if (svc.pricingBasis === "per_reference_page") return "per reference page";
  if (svc.pricingBasis === "flat_article") {
    return svc.serviceGroup === "proposal"
      ? "flat per proposal"
      : "flat per article";
  }
  return "flat per document";
}

function formatExpressWorkingDays(svc: Service, rangeSeparator = "–"): string {
  const minDays = Math.max(1, Math.ceil(svc.expressTurnaroundMinHours / 24));
  const maxDays = Math.max(1, Math.ceil(svc.expressTurnaroundMaxHours / 24));
  if (minDays === maxDays) {
    return `${minDays} ${minDays === 1 ? "working day" : "working days"}`;
  }
  return `${minDays}${rangeSeparator}${maxDays} working days`;
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

  const groupedCatalog = SERVICE_GROUPS.map((group) => ({
    ...group,
    services: catalog.filter((svc) => svc.serviceGroup === group.key),
  })).filter((group) => group.services.length > 0);

  const derivedGroup: ServiceGroup | null =
    catalog.find(
      (svc) =>
        watchedServices.includes(svc.name) || watchedServices.includes(svc.slug),
    )?.serviceGroup ?? null;

  const [selectedGroup, setSelectedGroup] = useState<ServiceGroup | null>(
    derivedGroup,
  );
  const activeGroupKey = selectedGroup ?? derivedGroup;
  const activeGroup =
    groupedCatalog.find((group) => group.key === activeGroupKey) ?? null;

  const handleGroupSelect = (groupKey: ServiceGroup) => {
    setSelectedGroup(groupKey);
    const group = groupedCatalog.find((g) => g.key === groupKey);
    if (!group) return;

    if (groupKey === "thesis" || groupKey === "dissertation") {
      setValue("isUniversityEnrolled", true);
      if (watch("supervisorSignOff") === "not_applicable") {
        setValue("supervisorSignOff", "yes");
      }
      if (watch("institutionId") === "None") {
        setValue("institutionId", "");
      }
      if (watch("degreeLevel") === "N/A") {
        setValue("degreeLevel", "");
      }
      if (watch("degreeProgramme") === "N/A") {
        setValue("degreeProgramme", "");
      }
    }

    if (group.services.length === 1) {
      setValue("services", [group.services[0].name], { shouldValidate: true });
      return;
    }

    const keptInGroup = watchedServices.filter((item) =>
      group.services.some((svc) => svc.name === item || svc.slug === item),
    );
    setValue("services", keptInGroup, {
      shouldValidate: keptInGroup.length > 0,
    });
  };

  const handleServiceToggle = (svc: Service, checked: boolean) => {
    const groupServices = catalog.filter(
      (item) => item.serviceGroup === svc.serviceGroup,
    );
    const currentInGroup = (watchedServices || []).filter((item) =>
      groupServices.some((gs) => gs.name === item || gs.slug === item),
    );

    if (checked) {
      if (
        !currentInGroup.includes(svc.name) &&
        !currentInGroup.includes(svc.slug)
      ) {
        setValue("services", [...currentInGroup, svc.name], {
          shouldValidate: true,
        });
      }
    } else {
      setValue(
        "services",
        currentInGroup.filter(
          (item) => item !== svc.name && item !== svc.slug,
        ),
        { shouldValidate: true },
      );
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 1: Select Services &amp; Turnaround Speed
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          Choose one editing category below, then select the services you need
          within it.
        </p>
      </div>

      <FieldSet data-invalid={!!errors.services}>
        <FieldLegend variant="label">
          Which editing service category do you require?{" "}
          <span className="text-destructive">*</span>
        </FieldLegend>

        <RadioGroup
          value={activeGroupKey ?? ""}
          onValueChange={(value) => handleGroupSelect(value as ServiceGroup)}
          aria-invalid={!!errors.services}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {groupedCatalog.map((group) => {
            const isSelected = activeGroupKey === group.key;
            const singleSvc =
              group.services.length === 1 ? group.services[0] : null;

            return (
              <FieldLabel
                key={group.key}
                htmlFor={`service-group-${group.key}`}
                className={`w-full cursor-pointer border transition-colors ${
                  isSelected
                    ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Field orientation="horizontal" className="items-start">
                  <RadioGroupItem
                    id={`service-group-${group.key}`}
                    value={group.key}
                    className="mt-0.5"
                  />
                  <FieldContent>
                    <FieldTitle>{group.title}</FieldTitle>
                    <FieldDescription>{group.subtitle}</FieldDescription>
                    {singleSvc ? (
                      <FieldDescription className="text-[11px] font-semibold text-tweaks-blue">
                        All in One Service —{" "}
                        {formatZarFromCents(singleSvc.standardRateCents)}{" "}
                        {getBasisLabel(singleSvc)}
                      </FieldDescription>
                    ) : (
                      <FieldDescription className="text-[11px]">
                        Includes {group.services.length} selectable sub-services
                      </FieldDescription>
                    )}
                  </FieldContent>
                </Field>
              </FieldLabel>
            );
          })}
        </RadioGroup>

        {activeGroup && (
          <div className="mt-4 border border-border bg-muted/15 p-4 space-y-3">
            <div className="border-b border-border/70 pb-2">
              <h4 className="text-sm font-extrabold text-foreground">
                {activeGroup.title}
                {activeGroup.services.length > 1
                  ? " — Select Sub-Services"
                  : " — Included Service"}
              </h4>
              <p className="text-xs font-light text-muted-foreground">
                {activeGroup.services.length > 1
                  ? "Tick one or more sub-services for this category."
                  : activeGroup.subtitle}
              </p>
            </div>

            {activeGroup.services.length === 1 ? (
              (() => {
                const svc = activeGroup.services[0];
                const basisLabel = getBasisLabel(svc);
                return (
                  <div className="border border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20 p-3.5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-tweaks-blue shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">
                          {getServiceSubLabel(svc)}
                        </p>
                        {svc.description && (
                          <p className="text-xs text-muted-foreground">
                            {svc.description}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          Standard: {svc.standardTurnaroundMinDays}–
                          {svc.standardTurnaroundMaxDays} working days | Express:{" "}
                          {formatExpressWorkingDays(svc)} (+
                          {formatZarFromCents(svc.expressSurchargeCents, false)}{" "}
                          {basisLabel})
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-extrabold text-tweaks-blue">
                        {formatZarFromCents(svc.standardRateCents)}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {basisLabel}
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {activeGroup.services.map((svc) => {
                  const isChecked =
                    watchedServices.includes(svc.name) ||
                    watchedServices.includes(svc.slug);
                  const basisLabel = getBasisLabel(svc);

                  return (
                    <FieldLabel
                      key={svc.id}
                      htmlFor={`service-${svc.id}`}
                      className={`w-full cursor-pointer border bg-background transition-colors ${
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
                            handleServiceToggle(svc, checked === true)
                          }
                          className="mt-0.5"
                        />
                        <FieldContent>
                          <FieldTitle>{getServiceSubLabel(svc)}</FieldTitle>
                          {svc.description && (
                            <FieldDescription>
                              {svc.description}
                            </FieldDescription>
                          )}
                          <FieldDescription className="text-[11px]">
                            Standard: {svc.standardTurnaroundMinDays}–
                            {svc.standardTurnaroundMaxDays} working days | Express:{" "}
                            {formatExpressWorkingDays(svc)} (+
                            {formatZarFromCents(
                              svc.expressSurchargeCents,
                              false,
                            )}{" "}
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
            )}
          </div>
        )}

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
                  {liveQuote.items.length > 0 ? (
                    <>
                      {liveQuote.turnaround.minDays ===
                      liveQuote.turnaround.maxDays
                        ? `${liveQuote.turnaround.minDays} working days`
                        : `${liveQuote.turnaround.minDays} to ${liveQuote.turnaround.maxDays} working days`}{" "}
                      in total for the services selected — we work through them
                      one after another. Standard rate card applies.
                    </>
                  ) : (
                    <>
                      Turnaround in working days is determined by the services
                      you select above — we work through them one after another.
                      Standard rate card applies.
                    </>
                  )}
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
                  {liveQuote.items.length > 0 ? (
                    <>
                      {liveQuote.turnaround.expressMinDays ===
                      liveQuote.turnaround.expressMaxDays
                        ? `${liveQuote.turnaround.expressMinDays} ${liveQuote.turnaround.expressMinDays === 1 ? "working day" : "working days"}`
                        : `${liveQuote.turnaround.expressMinDays} to ${liveQuote.turnaround.expressMaxDays} working days`}{" "}
                      in total, working through each selected service in
                      priority sequence. Express surcharge applies.
                    </>
                  ) : (
                    <>
                      Priority turnaround in working days is determined by the
                      services you select above, working through each selected
                      service in priority sequence. Express surcharge applies.
                    </>
                  )}
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
