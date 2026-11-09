"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Calculator, ShieldAlert, FileCheck2, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  formatZarFromCents,
  type CalculatedQuoteResult,
} from "@/lib/pricing/quote-calculator";
import type { ContactFormValues } from "./types";

interface Step5DatesPaymentProps {
  todayIso: string;
  minReturnDateIso: string;
  liveQuote: CalculatedQuoteResult;
  settings: Record<string, string>;
}

export function Step5DatesPayment({
  todayIso,
  minReturnDateIso,
  liveQuote,
  settings,
}: Step5DatesPaymentProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const watchedSupervisorSignOff = watch("supervisorSignOff");
  const watchedRequestSupervisor = watch("requestSupervisorSignOff");
  const watchedPaymentOption = watch("paymentOption");
  const watchedSelectedMonths = watch("selectedInstalmentMonths");
  const watchedScopeDeclaration = watch("scopeDeclarationAccepted");

  const effectiveSelectedMonths = Math.min(
    liveQuote.maxInstalmentMonths,
    Math.max(2, Number(watchedSelectedMonths) || liveQuote.maxInstalmentMonths),
  );

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 5: Dates, Supervisor Sign-Off &amp; Payment Option
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          Turnaround time starts from the date we receive your document.
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={!!errors.expectedSendDate}>
          <FieldLabel htmlFor="expectedSendDate">
            When will you send us the document?{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="expectedSendDate"
            type="date"
            min={todayIso}
            aria-invalid={!!errors.expectedSendDate}
            {...register("expectedSendDate")}
          />
          <FieldError errors={[errors.expectedSendDate]} />
        </Field>

        <Field data-invalid={!!errors.requestedReturnDate}>
          <FieldLabel htmlFor="requestedReturnDate">
            When do you need it back?{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="requestedReturnDate"
            type="date"
            min={minReturnDateIso}
            aria-invalid={!!errors.requestedReturnDate}
            {...register("requestedReturnDate")}
          />
          <FieldDescription>
            Earliest return date based on selected services:{" "}
            <strong>{minReturnDateIso}</strong>
          </FieldDescription>
          <FieldError errors={[errors.requestedReturnDate]} />
        </Field>
      </FieldGroup>

      <FieldSet data-invalid={!!errors.supervisorSignOff}>
        <FieldLegend variant="label">
          Has your supervisor signed off on this document going for editing?{" "}
          <span className="text-destructive">*</span>
        </FieldLegend>
        <RadioGroup
          value={watchedSupervisorSignOff}
          onValueChange={(value) =>
            setValue("supervisorSignOff", value as "yes" | "no", {
              shouldValidate: true,
            })
          }
          aria-invalid={!!errors.supervisorSignOff}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {[
            { value: "yes", label: "Yes, supervisor sign-off obtained" },
            { value: "no", label: "No, not yet" },
          ].map((option) => (
            <FieldLabel
              key={option.value}
              htmlFor={`supervisorSignOff-${option.value}`}
              className={`w-full cursor-pointer border transition-colors ${
                watchedSupervisorSignOff === option.value
                  ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <Field orientation="horizontal">
                <RadioGroupItem
                  id={`supervisorSignOff-${option.value}`}
                  value={option.value}
                />
                <FieldContent>
                  <FieldTitle>{option.label}</FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        <FieldError errors={[errors.supervisorSignOff]} />
      </FieldSet>

      {watchedSupervisorSignOff === "no" && (
        <div className="space-y-4 border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-xs leading-relaxed text-amber-900 italic dark:text-amber-200">
              &ldquo;{settings.supervisor_disclaimer_text}&rdquo;
            </p>
          </div>

          <Field data-invalid={!!errors.supervisorDisclaimerAck}>
            <FieldLabel
              htmlFor="supervisorDisclaimerAck"
              className="items-start font-normal"
            >
              <Checkbox
                id="supervisorDisclaimerAck"
                checked={!!watch("supervisorDisclaimerAck")}
                onCheckedChange={(checked) =>
                  setValue("supervisorDisclaimerAck", checked === true, {
                    shouldValidate: true,
                  })
                }
                className="mt-0.5"
              />
              <span className="text-xs font-semibold text-foreground">
                I have read and acknowledge this disclaimer{" "}
                <span className="text-destructive">*</span>
              </span>
            </FieldLabel>
            <FieldError errors={[errors.supervisorDisclaimerAck]} />
          </Field>

          <div className="space-y-3 border-t border-amber-200/70 pt-2 dark:border-amber-900/60">
            <Field>
              <FieldLabel
                htmlFor="requestSupervisorSignOff"
                className="items-start font-normal"
              >
                <Checkbox
                  id="requestSupervisorSignOff"
                  checked={!!watchedRequestSupervisor}
                  onCheckedChange={(checked) =>
                    setValue("requestSupervisorSignOff", checked === true, {
                      shouldValidate: true,
                    })
                  }
                  className="mt-0.5"
                />
                <span className="text-xs font-medium text-muted-foreground">
                  Optional: Email my supervisor a 1-click sign-off confirmation
                  link now (no fees or payment details are shown to your
                  supervisor)
                </span>
              </FieldLabel>
            </Field>

            {watchedRequestSupervisor && (
              <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field data-invalid={!!errors.supervisorName}>
                  <FieldLabel htmlFor="supervisorName">
                    Supervisor Name <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="supervisorName"
                    type="text"
                    placeholder="Prof. N. Dlamini"
                    aria-invalid={!!errors.supervisorName}
                    {...register("supervisorName")}
                  />
                  <FieldError errors={[errors.supervisorName]} />
                </Field>

                <Field data-invalid={!!errors.supervisorEmail}>
                  <FieldLabel htmlFor="supervisorEmail">
                    Supervisor Institutional Email{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="supervisorEmail"
                    type="email"
                    placeholder="n.dlamini@uct.ac.za"
                    aria-invalid={!!errors.supervisorEmail}
                    {...register("supervisorEmail")}
                  />
                  <FieldError errors={[errors.supervisorEmail]} />
                </Field>
              </FieldGroup>
            )}
          </div>
        </div>
      )}

      <FieldSet data-invalid={!!errors.paymentOption}>
        <FieldLegend variant="label">
          Payment &amp; Funding Option{" "}
          <span className="text-destructive">*</span>
        </FieldLegend>
        <RadioGroup
          value={watchedPaymentOption}
          onValueChange={(value) =>
            setValue(
              "paymentOption",
              value as
                "full_payment" | "payment_plan" | "institutional_funding",
              { shouldValidate: true },
            )
          }
          aria-invalid={!!errors.paymentOption}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <FieldLabel
            htmlFor="paymentOption-full"
            className={`w-full cursor-pointer border transition-colors ${
              watchedPaymentOption === "full_payment"
                ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                id="paymentOption-full"
                value="full_payment"
                className="mt-0.5"
              />
              <FieldContent>
                <FieldTitle>1. Full Payment</FieldTitle>
                <FieldDescription>
                  Full fee paid up front via Paystack or EFT.
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel
            htmlFor="paymentOption-plan"
            className={`w-full cursor-pointer border transition-colors ${
              watchedPaymentOption === "payment_plan"
                ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                id="paymentOption-plan"
                value="payment_plan"
                className="mt-0.5"
              />
              <FieldContent>
                <FieldTitle>2. Payment Plan (50% Deposit)</FieldTitle>
                <FieldDescription>
                  50% deposit now, balance over up to{" "}
                  <strong>{liveQuote.maxInstalmentMonths} months</strong>
                  {liveQuote.totalFeeCents > 0 &&
                  liveQuote.totalFeeCents < 300000
                    ? " (max 2 months for quotes under R3,000)"
                    : " (up to 3 months for quotes R3,000+)"}
                  .
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>

          <FieldLabel
            htmlFor="paymentOption-institutional"
            className={`w-full cursor-pointer border transition-colors ${
              watchedPaymentOption === "institutional_funding"
                ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                : "border-border hover:border-muted-foreground/40"
            }`}
          >
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                id="paymentOption-institutional"
                value="institutional_funding"
                className="mt-0.5"
              />
              <FieldContent>
                <FieldTitle>3. Institutional Funding</FieldTitle>
                <FieldDescription>
                  Paid by your university/institution against an official
                  Purchase Order (no deposit).
                </FieldDescription>
              </FieldContent>
            </Field>
          </FieldLabel>
        </RadioGroup>
        <FieldError errors={[errors.paymentOption]} />
      </FieldSet>

      {watchedPaymentOption === "payment_plan" && (
        <div className="space-y-3 border border-border bg-muted/30 p-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-foreground uppercase">
                Payment Plan Schedule
              </h4>
              <p className="text-xs text-muted-foreground">
                {liveQuote.totalFeeCents < 300000
                  ? "Quotes under R3,000 qualify for a 2-month payment plan after the 50% deposit."
                  : "Quotes of R3,000 or more qualify for up to a 3-month payment plan after the 50% deposit."}
              </p>
            </div>
            {liveQuote.maxInstalmentMonths === 3 && (
              <RadioGroup
                value={effectiveSelectedMonths}
                onValueChange={(value) =>
                  setValue("selectedInstalmentMonths", Number(value), {
                    shouldValidate: true,
                  })
                }
                className="flex items-center gap-4"
              >
                <FieldLabel
                  htmlFor="instalments-2"
                  className="w-auto cursor-pointer text-xs font-semibold"
                >
                  <RadioGroupItem id="instalments-2" value={2} />
                  <span>2 Months</span>
                </FieldLabel>
                <FieldLabel
                  htmlFor="instalments-3"
                  className="w-auto cursor-pointer text-xs font-semibold"
                >
                  <RadioGroupItem id="instalments-3" value={3} />
                  <span>3 Months</span>
                </FieldLabel>
              </RadioGroup>
            )}
          </div>
          <FieldDescription className="text-[11px]">
            Note: Under a payment plan, your edited work is released once the
            final instalment clears your balance to zero.
          </FieldDescription>
        </div>
      )}

      {watchedPaymentOption === "institutional_funding" && (
        <div className="space-y-4 border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-tweaks-blue" />
            <p className="text-xs leading-relaxed text-muted-foreground">
              {settings.institutional_release_text}
            </p>
          </div>

          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Field data-invalid={!!errors.department}>
              <FieldLabel htmlFor="department">
                Department / Faculty <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="department"
                type="text"
                placeholder="e.g. Department of Sociology"
                aria-invalid={!!errors.department}
                {...register("department")}
              />
              <FieldError errors={[errors.department]} />
            </Field>

            <Field data-invalid={!!errors.billingContactName}>
              <FieldLabel htmlFor="billingContactName">
                Billing Contact Name <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="billingContactName"
                type="text"
                placeholder="Finance Officer / Administrator"
                aria-invalid={!!errors.billingContactName}
                {...register("billingContactName")}
              />
              <FieldError errors={[errors.billingContactName]} />
            </Field>

            <Field data-invalid={!!errors.billingContactEmail}>
              <FieldLabel htmlFor="billingContactEmail">
                Billing Contact Email{" "}
                <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="billingContactEmail"
                type="email"
                placeholder="finance@university.ac.za"
                aria-invalid={!!errors.billingContactEmail}
                {...register("billingContactEmail")}
              />
              <FieldError errors={[errors.billingContactEmail]} />
            </Field>
          </FieldGroup>
        </div>
      )}

      {liveQuote.items.length > 0 && (
        <div className="space-y-4 bg-slate-900 p-6 text-white">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-tweaks-red" />
              <span className="text-xs font-bold tracking-wider uppercase">
                Instant Quote Estimate (ZAR)
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {liveQuote.turnaround.displayLabel}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {liveQuote.items.map((item) => (
              <div
                key={item.serviceId}
                className="flex justify-between text-slate-300"
              >
                <span>
                  {item.serviceName}{" "}
                  {item.pricingBasis === "per_page"
                    ? `(${item.quantity} pages)`
                    : item.pricingBasis === "per_reference_page"
                      ? `(${item.quantity} ref pages)`
                      : "(Flat rate)"}
                </span>
                <span className="font-semibold text-white">
                  {formatZarFromCents(item.lineTotalCents)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-slate-700 pt-3 sm:flex-row sm:items-center">
            <div>
              <span className="block text-xs text-slate-400">
                Estimated Total (ZAR)
              </span>
              <span className="text-2xl font-black text-white">
                {formatZarFromCents(liveQuote.totalFeeCents)}
              </span>
            </div>
            <div className="text-left text-xs text-slate-300 sm:text-right">
              {watchedPaymentOption === "payment_plan" ? (
                <>
                  <div>
                    50% Deposit Due:{" "}
                    <strong className="text-white">
                      {formatZarFromCents(liveQuote.depositRequiredCents)}
                    </strong>
                  </div>
                  <div>
                    Followed by {liveQuote.selectedInstalmentMonths} monthly
                    instalments of{" "}
                    <strong className="text-white">
                      {formatZarFromCents(
                        liveQuote.instalmentAmountsCents[0] || 0,
                      )}
                    </strong>
                  </div>
                </>
              ) : watchedPaymentOption === "institutional_funding" ? (
                <div>
                  Payable on Institutional PO (0% Deposit):{" "}
                  <strong className="text-white">
                    {formatZarFromCents(liveQuote.totalFeeCents)}
                  </strong>
                </div>
              ) : (
                <div>
                  Full Upfront Payment:{" "}
                  <strong className="text-white">
                    {formatZarFromCents(liveQuote.totalFeeCents)}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Field data-invalid={!!errors.additionalInfo}>
        <FieldLabel htmlFor="additionalInfo">
          Anything else you&apos;d like to add or clarify?
        </FieldLabel>
        <Textarea
          id="additionalInfo"
          rows={3}
          aria-invalid={!!errors.additionalInfo}
          className="resize-none"
          {...register("additionalInfo")}
        />
        <FieldError errors={[errors.additionalInfo]} />
      </Field>

      <div className="border border-border bg-muted/30 p-5">
        <FieldSet data-invalid={!!errors.scopeDeclarationAccepted}>
          <FieldLegend variant="label">
            <span className="inline-flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-tweaks-blue" />
              Scope Declaration <span className="text-destructive">*</span>
            </span>
          </FieldLegend>
          <Field data-invalid={!!errors.scopeDeclarationAccepted}>
            <FieldLabel
              htmlFor="scopeDeclarationAccepted"
              className="items-start font-normal"
            >
              <Checkbox
                id="scopeDeclarationAccepted"
                checked={watchedScopeDeclaration === true}
                onCheckedChange={(checked) =>
                  setValue(
                    "scopeDeclarationAccepted",
                    (checked ? true : undefined) as unknown as true,
                    { shouldValidate: true },
                  )
                }
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                {settings.scope_declaration_text}
              </span>
            </FieldLabel>
            <FieldError errors={[errors.scopeDeclarationAccepted]} />
          </Field>
          {!watchedScopeDeclaration && errors.scopeDeclarationAccepted && (
            <div className="border border-blue-200 bg-blue-50 p-3 text-xs text-muted-foreground dark:border-blue-900 dark:bg-blue-950/40">
              <strong>What our service covers:</strong> Tweaks provides
              professional academic language editing, reference checking,
              reference list formatting, and document layout formatting on your
              own original research. We do not write or rewrite content, run
              Turnitin/plagiarism similarity checks, or guarantee academic
              grades. Please tick the box above to confirm and submit your
              brief.
            </div>
          )}
        </FieldSet>
      </div>
    </div>
  );
}
