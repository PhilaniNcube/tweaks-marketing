"use client";

import React, {
  useState,
  useMemo,
  useActionState,
  useTransition,
  useRef,
} from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calculator,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import {
  contactSchema,
  CONTACT_FORM_STEPS,
  getMinimumTurnaroundDays,
} from "@/lib/validations/contact";
import {
  submitContactForm,
  type ContactActionState,
} from "@/app/actions/contact";
import {
  calculateQuoteFromCatalog,
  formatZarFromCents,
} from "@/lib/pricing/quote-calculator";
import { sendGTMEvent } from "@next/third-parties/google";
import { toast } from "sonner";
import type {
  ContactLookupsData,
  ContactInitialDefaults,
  ContactFormValues,
} from "./types";
import { Step1ClientDetails } from "./step-1-client-details";
import { Step2DocumentVolume } from "./step-2-document-volume";
import { Step3ServicesSpeed } from "./step-3-services-speed";
import { Step4StyleUpload } from "./step-4-style-upload";
import { Step5DatesPayment } from "./step-5-dates-payment";

interface ContactQuoteFormProps {
  lookups: ContactLookupsData;
  initialDefaults: ContactInitialDefaults;
}

const initialContactState: ContactActionState = {
  success: false,
};

export function ContactQuoteForm({
  lookups,
  initialDefaults,
}: ContactQuoteFormProps) {
  const formTopRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [highestCompletedStep, setHighestCompletedStep] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [state, formAction, isActionPending] = useActionState(
    async (
      prevState: ContactActionState,
      formData: FormData
    ): Promise<ContactActionState> => {
      const result = await submitContactForm(prevState, formData);

      if (result.success) {
        toast.success("Brief submitted & quote generated!", {
          description: result.quoteNumber
            ? `Your quote reference is ${result.quoteNumber}.`
            : "We have received your project details.",
        });
        sendGTMEvent({
          event: "contact_form_submission",
          services: formData.getAll("services").join(",") || "custom",
        });
      } else {
        if (result.error) {
          toast.error("Submission failed", {
            description: result.error,
          });
        }
        if (result.errors && Object.keys(result.errors).length > 0) {
          const errorKeys = Object.keys(result.errors);
          for (const step of CONTACT_FORM_STEPS) {
            if (step.fields.some((f) => errorKeys.includes(f))) {
              setCurrentStep(step.id);
              break;
            }
          }
        }
      }

      return result;
    },
    initialContactState
  );

  const [isTransitionPending, startTransition] = useTransition();
  const isPending = isActionPending || isTransitionPending;

  const methods = useForm<ContactFormValues>({
    resolver: valibotResolver(
      contactSchema
    ) as unknown as Resolver<ContactFormValues>,
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
      firstName: "",
      surname: "",
      email: "",
      whatsapp: "+27 ",
      institutionId: "",
      institutionOther: "",
      degreeLevel: "",
      degreeLevelOther: "",
      degreeProgramme: "",
      researchTitle: "",
      referralSource: "",
      documentType: "Thesis/Dissertation",
      documentTypeOther: "",
      wholeOrPart: "whole",
      whichPart: "",
      pageCount: initialDefaults.pageCount as unknown as number,
      referencePageCount: 0,
      services: initialDefaults.services,
      deliverySpeed: initialDefaults.deliverySpeed,
      mainGoal: "",
      concerns: "",
      referencingStyle: "",
      referencingStyleOther: "",
      expectedSendDate: initialDefaults.todayIso,
      requestedReturnDate: "",
      supervisorSignOff: "yes",
      supervisorDisclaimerAck: false,
      requestSupervisorSignOff: false,
      supervisorName: "",
      supervisorEmail: "",
      trackedChanges: "Yes, both versions",
      trackedChangesOther: "",
      certificate: "Yes",
      paymentOption: "full_payment",
      selectedInstalmentMonths: 2,
      department: "",
      billingContactName: "",
      billingContactEmail: "",
      additionalInfo: "",
      scopeDeclarationAccepted: undefined as unknown as true,
      hp_website: "",
      _formTime: initialDefaults.formTime,
      file: undefined,
    },
  });

  const { register, handleSubmit, watch, trigger } = methods;

  // Watch reactive fields for live quote & turnaround calculation
  const watchedDegreeLevel = watch("degreeLevel");
  const watchedPageCount = watch("pageCount");
  const watchedRefPageCount = watch("referencePageCount");
  const watchedServices = watch("services") || [];
  const watchedDeliverySpeed = watch("deliverySpeed");
  const watchedExpectedSendDate = watch("expectedSendDate");
  const watchedPaymentOption = watch("paymentOption");
  const watchedSelectedMonths = watch("selectedInstalmentMonths");

  const minTurnaroundDays = useMemo(
    () => getMinimumTurnaroundDays(watchedServices, watchedDeliverySpeed),
    [watchedServices, watchedDeliverySpeed]
  );

  const minReturnDateIso = useMemo(() => {
    const base = watchedExpectedSendDate
      ? new Date(watchedExpectedSendDate)
      : new Date(initialDefaults.todayIso);
    if (isNaN(base.getTime())) return initialDefaults.todayIso;
    const minDate = new Date(base);
    minDate.setDate(minDate.getDate() + minTurnaroundDays);
    return minDate.toISOString().split("T")[0];
  }, [watchedExpectedSendDate, minTurnaroundDays, initialDefaults.todayIso]);

  const liveQuote = useMemo(() => {
    return calculateQuoteFromCatalog(
      {
        selectedServices: watchedServices,
        pageCount: Number(watchedPageCount) || 0,
        referencePageCount: Number(watchedRefPageCount) || 0,
        deliverySpeed: watchedDeliverySpeed || "standard",
        paymentOption: watchedPaymentOption || "full_payment",
        requestedInstalmentMonths: Number(watchedSelectedMonths) || undefined,
        degreeLevel: watchedDegreeLevel,
      },
      lookups.services,
      lookups.rules
    );
  }, [
    watchedServices,
    watchedPageCount,
    watchedRefPageCount,
    watchedDeliverySpeed,
    watchedPaymentOption,
    watchedSelectedMonths,
    watchedDegreeLevel,
    lookups.services,
    lookups.rules,
  ]);

  const scrollToFormTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNextStep = async () => {
    const stepConfig = CONTACT_FORM_STEPS[currentStep - 1];
    if (!stepConfig) return;

    const isStepValid = await trigger(
      stepConfig.fields as (keyof ContactFormValues)[]
    );
    if (!isStepValid) {
      toast.error("Please complete the required fields in this step.");
      return;
    }

    setHighestCompletedStep((prev) => Math.max(prev, currentStep));
    setCurrentStep((prev) => Math.min(CONTACT_FORM_STEPS.length, prev + 1));
    scrollToFormTop();
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    scrollToFormTop();
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === currentStep) return;
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      scrollToFormTop();
      return;
    }
    if (targetStep <= highestCompletedStep + 1) {
      const stepConfig = CONTACT_FORM_STEPS[currentStep - 1];
      const isStepValid = await trigger(
        stepConfig.fields as (keyof ContactFormValues)[]
      );
      if (isStepValid) {
        setHighestCompletedStep((prev) => Math.max(prev, currentStep));
        setCurrentStep(targetStep);
        scrollToFormTop();
      }
    }
  };

  const onSubmit = (data: ContactFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (key === "file") return;
      if (key === "selectedInstalmentMonths") {
        const capped = Math.min(
          liveQuote.maxInstalmentMonths,
          Math.max(2, Number(val) || liveQuote.maxInstalmentMonths)
        );
        formData.append(key, String(capped));
        return;
      }
      if (Array.isArray(val)) {
        val.forEach((item) => formData.append(key, item));
      } else if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });

    if (selectedFile) {
      formData.append("file", selectedFile);
    } else if (data.file && data.file.length > 0) {
      formData.append("file", data.file[0]);
    }

    startTransition(() => {
      formAction(formData);
    });
  };

  if (state.success) {
    return (
      <div className="py-10 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Brief Submitted & Quote Generated!
          </h3>
          {state.quoteNumber && (
            <p className="text-sm font-semibold text-tweaks-blue">
              Quote Reference: {state.quoteNumber}
            </p>
          )}
          <p className="text-slate-500 dark:text-zinc-400 font-light text-sm max-w-md mx-auto leading-relaxed">
            Thank you! Your project brief has been recorded in our system and a
            confirmation has been sent to your email.
          </p>
        </div>

        {state.quoteSummary && (
          <div className="max-w-md mx-auto bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-5 text-left space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estimated Quote Total (ZAR)
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                {formatZarFromCents(state.quoteSummary.totalFeeCents)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
              <span>
                Deposit Required ({state.quoteSummary.depositPercentage}%):
              </span>
              <span className="font-semibold">
                {formatZarFromCents(state.quoteSummary.depositRequiredCents)}
              </span>
            </div>
            {state.quoteSummary.paymentOption === "payment_plan" && (
              <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
                <span>Payment Plan:</span>
                <span className="font-semibold">
                  {state.quoteSummary.selectedInstalmentMonths} monthly
                  instalments
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {state.quoteToken && (
            <Button
              asChild
              className="bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none font-bold transition-colors"
            >
              <Link href={`/quote/${state.quoteToken}`}>
                View Interactive Quote
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="cursor-pointer rounded-none border-slate-300 hover:border-tweaks-blue hover:text-tweaks-blue transition-colors"
          >
            Submit Another Brief
          </Button>
        </div>
      </div>
    );
  }

  const totalSteps = CONTACT_FORM_STEPS.length;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <FormProvider {...methods}>
      <div ref={formTopRef} className="space-y-8 text-left">
        {/* ===================================================================
            MULTI-STEP PROGRESS HEADER
           =================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            <span>
              Step {currentStep} of {totalSteps}:{" "}
              <strong className="text-slate-900 dark:text-white">
                {CONTACT_FORM_STEPS[currentStep - 1]?.title}
              </strong>
            </span>
            <span className="text-tweaks-blue">{progressPercentage}%</span>
          </div>

          <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-tweaks-blue transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
            {CONTACT_FORM_STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted =
                step.id < currentStep || step.id <= highestCompletedStep;
              const isClickable =
                step.id < currentStep || step.id <= highestCompletedStep + 1;

              return (
                <button
                  key={step.id}
                  type="button"
                  disabled={!isClickable}
                  onClick={() => handleStepClick(step.id)}
                  className={`group min-w-0 overflow-hidden flex flex-col items-start justify-between p-2 sm:p-2.5 border text-left transition-all ${
                    isActive
                      ? "border-tweaks-blue bg-blue-50/50 dark:bg-blue-950/30"
                      : isCompleted
                        ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/10 hover:border-tweaks-blue cursor-pointer"
                        : "border-slate-200 dark:border-zinc-800 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center gap-1.5 w-full min-w-0">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center text-[10px] font-black ${
                        isActive
                          ? "bg-tweaks-blue text-white"
                          : isCompleted
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        step.id
                      )}
                    </span>
                    <span
                      className={`hidden sm:block min-w-0 w-full text-[11px] font-bold leading-tight truncate ${
                        isActive
                          ? "text-tweaks-blue dark:text-blue-400"
                          : "text-slate-700 dark:text-zinc-300"
                      }`}
                      title={step.title}
                    >
                      {step.title}
                    </span>
                  </div>
                  <span
                    className="text-[10px] text-slate-400 truncate w-full min-w-0 mt-1 hidden md:block"
                    title={step.subtitle}
                  >
                    {step.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Running Quote Banner (Visible on Steps 2-4 once services & pages are chosen) */}
        {currentStep < 5 && liveQuote.items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white text-xs border-l-4 border-tweaks-red">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-tweaks-red shrink-0" />
              <span className="text-slate-300">Running Estimate:</span>
              <strong className="text-sm font-black text-white">
                {formatZarFromCents(liveQuote.totalFeeCents)}
              </strong>
            </div>
            <div className="text-slate-400">
              {watchedPageCount ? `${watchedPageCount} pages · ` : ""}
              {liveQuote.turnaround.displayLabel}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          {/* Honeypot field for spam prevention */}
          <div
            className="absolute opacity-0 pointer-events-none -z-50 h-0 w-0 overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="hp_website">Do not fill this field</label>
            <input
              id="hp_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("hp_website")}
            />
            <input type="hidden" {...register("_formTime")} />
          </div>

          {state.error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 border border-red-200 text-sm">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {state.errors && Object.keys(state.errors).length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 border border-red-200 text-sm">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-1">
                  Please check the highlighted fields below:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {Object.entries(state.errors).map(([field, messages]) =>
                    messages?.map((msg, i) => (
                      <li key={`${field}-${i}`}>{msg}</li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <Step1ClientDetails
              institutions={lookups.institutions}
              degreeLevels={lookups.degreeLevels}
              degreeProgrammes={lookups.degreeProgrammes}
            />
          )}

          {currentStep === 2 && <Step2DocumentVolume />}

          {currentStep === 3 && (
            <Step3ServicesSpeed
              catalog={lookups.services}
              liveQuote={liveQuote}
            />
          )}

          {currentStep === 4 && (
            <Step4StyleUpload
              fileName={selectedFile?.name || ""}
              onFileSelect={setSelectedFile}
            />
          )}

          {currentStep === 5 && (
            <Step5DatesPayment
              todayIso={initialDefaults.todayIso}
              minReturnDateIso={minReturnDateIso}
              liveQuote={liveQuote}
              settings={lookups.settings}
            />
          )}

          {/* =================================================================
              MULTI-STEP NAVIGATION FOOTER
             ================================================================= */}
          <div className="pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={isPending}
                className="rounded-none border-slate-300 dark:border-zinc-700 px-6 py-5 font-bold cursor-pointer"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none px-8 py-5 font-bold cursor-pointer transition-colors"
              >
                Continue to Step {currentStep + 1}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="bg-tweaks-red hover:bg-tweaks-blue text-white cursor-pointer px-8 py-6 font-bold rounded-none shadow-md transition-colors tracking-wide text-sm sm:text-base disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {isPending
                  ? "Generating Quote & Submitting Brief..."
                  : "Submit Brief & Generate Official Quote"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}

