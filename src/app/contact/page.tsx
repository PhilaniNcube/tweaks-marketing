"use client";

import React, { useState, Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Send,
  CheckCircle2,
  Paperclip,
  AlertCircle,
  Loader2,
  Calculator,
  ShieldAlert,
  FileCheck2,
  Building2,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  ContactFormData,
  REFERRAL_SOURCES,
  REFERENCING_STYLES,
  DOCUMENT_TYPES,
  getMinimumTurnaroundDays,
} from "@/lib/validations/contact";
import {
  calculateQuoteFromCatalog,
  formatZarFromCents,
  type CalculatedQuoteResult,
} from "@/lib/pricing/quote-calculator";
import {
  DEFAULT_SERVICES,
  DEFAULT_INSTITUTIONS,
  DEFAULT_DEGREE_LEVELS,
  DEFAULT_CRM_SETTINGS,
  DEFAULT_RATE_CARD_RULES,
} from "@/db/seed-data";
import type { Service, RateCardRule } from "@/db/schema";
import { sendGTMEvent } from "@next/third-parties/google";
import { toast } from "sonner";

interface LookupInstitution {
  id: string;
  name: string;
  shortName?: string | null;
}

interface LookupDegreeLevel {
  id: string;
  designator: string;
  category?: string;
}

interface LookupProgramme {
  id: string;
  institutionId?: string | null;
  degreeLevel?: string | null;
  name: string;
  usageCount: number;
}

function getDefaultSettingsMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const s of DEFAULT_CRM_SETTINGS) {
    map[s.key] = s.value;
  }
  return map;
}

function ContactForm() {
  const searchParams = useSearchParams();
  const [fileName, setFileName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [pageCountManuallyEdited, setPageCountManuallyEdited] = useState(false);

  // CRM database lookups
  const [catalog, setCatalog] = useState<Service[]>(() =>
    DEFAULT_SERVICES.map((s, idx) => ({
      id: s.slug,
      slug: s.slug,
      name: s.name,
      description: s.description ?? null,
      pricingBasis: s.pricingBasis,
      standardRateCents: s.standardRateCents,
      expressSurchargeCents: s.expressSurchargeCents ?? 0,
      hasExpressOption: s.hasExpressOption ?? true,
      standardTurnaroundMinDays: s.standardTurnaroundMinDays,
      standardTurnaroundMaxDays: s.standardTurnaroundMaxDays,
      expressTurnaroundMinHours: s.expressTurnaroundMinHours,
      expressTurnaroundMaxHours: s.expressTurnaroundMaxHours,
      includesReferencingReport: s.includesReferencingReport ?? false,
      quickbooksItemId: null,
      sortOrder: s.sortOrder ?? idx + 1,
      isActive: true,
      createdAt: "",
      updatedAt: "",
    }))
  );
  const [rules, setRules] = useState<RateCardRule[]>(() =>
    DEFAULT_RATE_CARD_RULES.map((r, idx) => ({
      id: `rule-${idx}`,
      serviceId: r.serviceId ?? null,
      name: r.name,
      description: r.description ?? null,
      ruleCategory: r.ruleCategory,
      conditionField: r.conditionField,
      operator: r.operator,
      conditionValue: r.conditionValue,
      effectType: r.effectType,
      effectValue: r.effectValue,
      priority: r.priority ?? idx * 10,
      isActive: true,
      createdAt: "",
    }))
  );
  const [institutionsList, setInstitutionsList] = useState<LookupInstitution[]>(
    () =>
      DEFAULT_INSTITUTIONS.map((inst, idx) => ({
        id: inst.name,
        name: inst.name,
        shortName: inst.shortName,
      }))
  );
  const [degreeLevelsList, setDegreeLevelsList] = useState<LookupDegreeLevel[]>(
    () =>
      DEFAULT_DEGREE_LEVELS.map((d, idx) => ({
        id: `deg-${idx}`,
        designator: d.designator,
        category: d.category,
      }))
  );
  const [programmesList, setProgrammesList] = useState<LookupProgramme[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>(
    getDefaultSettingsMap
  );

  const [state, setState] = useState<{
    success: boolean;
    error?: string;
    errors?: Record<string, string[]>;
    quoteNumber?: string;
    quoteToken?: string;
    quoteSummary?: CalculatedQuoteResult;
  }>({ success: false });

  type ContactFormValues = ContactFormData & { file?: FileList };

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
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
      wordCount: undefined as unknown as number,
      pageCount: undefined as unknown as number,
      referencePageCount: 0,
      services: [],
      deliverySpeed: "standard",
      mainGoal: "",
      concerns: "",
      referencingStyle: "",
      referencingStyleOther: "",
      expectedSendDate: todayIso,
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
      _formTime: "",
      file: undefined,
    },
  });

  // Load live CRM lookups from database
  useEffect(() => {
    setValue("_formTime", String(Date.now()));
    fetch("/api/crm/lookups")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.services) && data.services.length > 0) {
          setCatalog(data.services);
        }
        if (Array.isArray(data.institutions) && data.institutions.length > 0) {
          setInstitutionsList(data.institutions);
        }
        if (Array.isArray(data.degreeLevels) && data.degreeLevels.length > 0) {
          setDegreeLevelsList(data.degreeLevels);
        }
        if (Array.isArray(data.degreeProgrammes)) {
          setProgrammesList(data.degreeProgrammes);
        }
        if (data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
        if (Array.isArray(data.rateCardRules) && data.rateCardRules.length > 0) {
          setRules(data.rateCardRules);
        }
      })
      .catch((err) => console.warn("Using default lookup fallback:", err));
  }, [setValue]);

  // Pre-fill from URL searchParams (from service page estimators)
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const defaultPages =
      searchParams.get("pageCount") ||
      searchParams.get("pages") ||
      searchParams.get("documents") ||
      searchParams.get("articles") ||
      "";
    const speedParam = searchParams.get("speed");

    if (serviceParam) {
      const slugToNameMap: Record<string, string> = {
        "academic-editing": "Academic editing",
        "reference-checking": "Reference checking",
        "reference-list-editing": "Reference list editing",
        formatting: "Formatting",
        "journal-article-proposal-editing":
          "Journal article and proposal editing",
        "abstract-editing": "Abstract editing",
      };
      const servicesList = serviceParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => slugToNameMap[s] || s);

      if (servicesList.length > 0) {
        setValue("services", servicesList);
      }
    }

    if (defaultPages && !isNaN(Number(defaultPages))) {
      const p = Math.max(1, Number(defaultPages));
      setValue("pageCount", p);
      setValue("wordCount", p * 300);
    }

    if (speedParam === "express" || speedParam === "standard") {
      setValue("deliverySpeed", speedParam);
    }
  }, [searchParams, setValue]);

  // Watch reactive fields
  const watchedInstitutionId = watch("institutionId");
  const watchedDegreeLevel = watch("degreeLevel");
  const watchedDocumentType = watch("documentType");
  const watchedWholeOrPart = watch("wholeOrPart");
  const watchedWordCount = watch("wordCount");
  const watchedPageCount = watch("pageCount");
  const watchedRefPageCount = watch("referencePageCount");
  const watchedServices = watch("services") || [];
  const watchedDeliverySpeed = watch("deliverySpeed");
  const watchedReferencingStyle = watch("referencingStyle");
  const watchedExpectedSendDate = watch("expectedSendDate");
  const watchedSupervisorSignOff = watch("supervisorSignOff");
  const watchedRequestSupervisor = watch("requestSupervisorSignOff");
  const watchedPaymentOption = watch("paymentOption");
  const watchedSelectedMonths = watch("selectedInstalmentMonths");
  const watchedTrackedChanges = watch("trackedChanges");
  const watchedScopeDeclaration = watch("scopeDeclarationAccepted");

  // Auto-convert Word Count -> Page Count at 300 words per page unless manually overridden
  const wordsPerPage = Number(settings.words_per_page || "300") || 300;
  useEffect(() => {
    const wc = Number(watchedWordCount);
    if (!pageCountManuallyEdited && !isNaN(wc) && wc > 0) {
      setValue("pageCount", Math.max(1, Math.ceil(wc / wordsPerPage)), {
        shouldValidate: true,
      });
    }
  }, [watchedWordCount, pageCountManuallyEdited, wordsPerPage, setValue]);

  // Calculate earliest allowed return date based on expectedSendDate + longest selected service turnaround
  const minTurnaroundDays = useMemo(
    () => getMinimumTurnaroundDays(watchedServices, watchedDeliverySpeed),
    [watchedServices, watchedDeliverySpeed]
  );

  const minReturnDateIso = useMemo(() => {
    const base = watchedExpectedSendDate
      ? new Date(watchedExpectedSendDate)
      : new Date();
    if (isNaN(base.getTime())) return todayIso;
    const minDate = new Date(base);
    minDate.setDate(minDate.getDate() + minTurnaroundDays);
    return minDate.toISOString().split("T")[0];
  }, [watchedExpectedSendDate, minTurnaroundDays, todayIso]);

  // Live Quote Estimate from Rate Card & Conditional Rules
  const liveQuote = useMemo(() => {
    return calculateQuoteFromCatalog(
      {
        selectedServices: watchedServices,
        pageCount: Number(watchedPageCount) || 0,
        referencePageCount: Number(watchedRefPageCount) || 0,
        wordCount: Number(watchedWordCount) || 0,
        deliverySpeed: watchedDeliverySpeed || "standard",
        paymentOption: watchedPaymentOption || "full_payment",
        requestedInstalmentMonths: Number(watchedSelectedMonths) || undefined,
        degreeLevel: watchedDegreeLevel,
      },
      catalog,
      rules
    );
  }, [
    watchedServices,
    watchedPageCount,
    watchedRefPageCount,
    watchedWordCount,
    watchedDeliverySpeed,
    watchedPaymentOption,
    watchedSelectedMonths,
    watchedDegreeLevel,
    catalog,
    rules,
  ]);

  // Keep selectedInstalmentMonths within maxInstalmentMonths (2 vs 3 months based on R3,000 rule)
  useEffect(() => {
    if (watchedPaymentOption === "payment_plan") {
      if (
        !watchedSelectedMonths ||
        watchedSelectedMonths > liveQuote.maxInstalmentMonths
      ) {
        setValue("selectedInstalmentMonths", liveQuote.maxInstalmentMonths);
      }
    }
  }, [
    liveQuote.maxInstalmentMonths,
    watchedPaymentOption,
    watchedSelectedMonths,
    setValue,
  ]);

  // Order degree programme autocomplete suggestions: programmes from selected institution first
  const orderedProgrammeSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const instMatched: string[] = [];
    const others: string[] = [];

    for (const p of programmesList) {
      const key = p.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      if (watchedInstitutionId && p.institutionId === watchedInstitutionId) {
        instMatched.push(p.name);
      } else {
        others.push(p.name);
      }
    }

    const commonDefaults = [
      "Business Administration",
      "Public Health",
      "Educational Psychology",
      "Computer Science",
      "Information Systems",
      "Sociology",
      "Chemistry",
      "Mechanical Engineering",
      "Law",
      "Development Studies",
      "Nursing Science",
      "Finance",
      "Accounting",
    ];
    for (const def of commonDefaults) {
      if (!seen.has(def.toLowerCase())) {
        others.push(def);
      }
    }

    return [...instMatched, ...others];
  }, [programmesList, watchedInstitutionId]);

  useEffect(() => {
    if (state.success) {
      toast.success("Brief submitted & quote generated!", {
        description: state.quoteNumber
          ? `Your quote reference is ${state.quoteNumber}.`
          : "We have received your project details.",
      });
      sendGTMEvent({
        event: "contact_form_submission",
        services: watchedServices.join(",") || "custom",
      });
    }
  }, [state.success, state.quoteNumber, watchedServices]);

  useEffect(() => {
    if (state.error) {
      toast.error("Submission failed", {
        description: state.error,
      });
    }
  }, [state.error]);

  const handleServiceToggle = (serviceName: string, checked: boolean) => {
    const current = watchedServices || [];
    if (checked) {
      setValue("services", [...current, serviceName], { shouldValidate: true });
    } else {
      setValue(
        "services",
        current.filter((item) => item !== serviceName),
        { shouldValidate: true }
      );
    }
  };

  const onSubmit = async (data: ContactFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (key === "file") return;
      if (Array.isArray(val)) {
        val.forEach((item) => formData.append(key, item));
      } else if (val !== undefined && val !== null) {
        formData.append(key, String(val));
      }
    });

    if (data.file && data.file.length > 0) {
      formData.append("file", data.file[0]);
    }

    setIsPending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setState(result);
    } catch {
      setState({ success: false, error: "Network error. Please try again." });
    } finally {
      setIsPending(false);
    }
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
              <span>Deposit Required ({state.quoteSummary.depositPercentage}%):</span>
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 text-left">
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
                messages?.map((msg, i) => <li key={`${field}-${i}`}>{msg}</li>)
              )}
            </ul>
          </div>
        </div>
      )}

      {/* =====================================================================
          STEP 1: CLIENT & ACADEMIC DETAILS
         ===================================================================== */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 1: Your Details & Academic Context
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            These details are used for your quotation and completion
            certificate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Thabo"
              {...register("firstName")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.firstName && (
              <p className="text-xs text-red-500">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="surname"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Surname <span className="text-red-500">*</span>
            </Label>
            <Input
              id="surname"
              type="text"
              placeholder="Mokoena"
              {...register("surname")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.surname && (
              <p className="text-xs text-red-500">{errors.surname.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="student@university.ac.za"
              {...register("email")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="whatsapp"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              WhatsApp Number (with country code){" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="+27 82 123 4567"
              {...register("whatsapp")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.whatsapp && (
              <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
            )}
          </div>

          {/* Institution Drop-Down + Other */}
          <div className="space-y-2">
            <Label
              htmlFor="institutionId"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Institution <span className="text-red-500">*</span>
            </Label>
            <select
              id="institutionId"
              {...register("institutionId")}
              className="w-full h-10 px-3 text-sm rounded-none border border-slate-300 dark:border-zinc-800 focus:outline-none focus:border-tweaks-blue bg-white dark:bg-zinc-950"
            >
              <option value="">Select your institution...</option>
              {institutionsList.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
              <option value="Other">Other (not listed)</option>
            </select>
            {errors.institutionId && (
              <p className="text-xs text-red-500">
                {errors.institutionId.message}
              </p>
            )}
          </div>

          {watchedInstitutionId === "Other" && (
            <div className="space-y-2">
              <Label
                htmlFor="institutionOther"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Institution Name (if Other){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="institutionOther"
                type="text"
                placeholder="Enter your university or college name"
                {...register("institutionOther")}
                className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
              />
              {errors.institutionOther && (
                <p className="text-xs text-red-500">
                  {errors.institutionOther.message}
                </p>
              )}
            </div>
          )}

          {/* Degree Level Designator */}
          <div className="space-y-2">
            <Label
              htmlFor="degreeLevel"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Degree Level (Designator) <span className="text-red-500">*</span>
            </Label>
            <select
              id="degreeLevel"
              {...register("degreeLevel")}
              className="w-full h-10 px-3 text-sm rounded-none border border-slate-300 dark:border-zinc-800 focus:outline-none focus:border-tweaks-blue bg-white dark:bg-zinc-950"
            >
              <option value="">Select designator (e.g. MSc, MCom, PhD)...</option>
              {degreeLevelsList.map((deg) => (
                <option key={deg.id} value={deg.designator}>
                  {deg.designator}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {errors.degreeLevel && (
              <p className="text-xs text-red-500">
                {errors.degreeLevel.message}
              </p>
            )}
          </div>

          {watchedDegreeLevel === "Other" && (
            <div className="space-y-2">
              <Label
                htmlFor="degreeLevelOther"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Specify Degree Designator{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="degreeLevelOther"
                type="text"
                placeholder="e.g. MComm, Dsc"
                {...register("degreeLevelOther")}
                className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
              />
              {errors.degreeLevelOther && (
                <p className="text-xs text-red-500">
                  {errors.degreeLevelOther.message}
                </p>
              )}
            </div>
          )}

          {/* Degree Programme with Autocomplete */}
          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="degreeProgramme"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Degree Programme <span className="text-red-500">*</span>
            </Label>
            <Input
              id="degreeProgramme"
              type="text"
              list="degree-programme-suggestions"
              placeholder="e.g. Chemistry, Educational Psychology, Sociology"
              {...register("degreeProgramme")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            <datalist id="degree-programme-suggestions">
              {orderedProgrammeSuggestions.map((prog) => (
                <option key={prog} value={prog} />
              ))}
            </datalist>
            <p className="text-xs text-slate-400">
              Appears alongside your degree designator on your completion
              certificate (e.g.{" "}
              <em>
                {watchedDegreeLevel && watchedDegreeLevel !== "Other"
                  ? watchedDegreeLevel
                  : "MSc"}{" "}
                Chemistry
              </em>
              ).
            </p>
            {errors.degreeProgramme && (
              <p className="text-xs text-red-500">
                {errors.degreeProgramme.message}
              </p>
            )}
          </div>

          {/* Research Title */}
          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="researchTitle"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Research Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="researchTitle"
              type="text"
              placeholder="Enter your exact research title as it should appear on your completion certificate"
              {...register("researchTitle")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.researchTitle && (
              <p className="text-xs text-red-500">
                {errors.researchTitle.message}
              </p>
            )}
          </div>

          {/* How did you hear about us */}
          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="referralSource"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              How did you hear about us? <span className="text-red-500">*</span>
            </Label>
            <select
              id="referralSource"
              {...register("referralSource")}
              className="w-full h-10 px-3 text-sm rounded-none border border-slate-300 dark:border-zinc-800 focus:outline-none focus:border-tweaks-blue bg-white dark:bg-zinc-950"
            >
              <option value="">Please select...</option>
              {REFERRAL_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
            {errors.referralSource && (
              <p className="text-xs text-red-500">
                {errors.referralSource.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          STEP 2: DOCUMENT & VOLUME DETAILS
         ===================================================================== */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 2: Document Scope & Volume
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            Enter your word count from Microsoft Word and we will automatically
            calculate your billable pages at {wordsPerPage} words per page.
          </p>
        </div>

        {/* Document Type */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Document Type <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DOCUMENT_TYPES.map((docType) => (
              <label
                key={docType}
                className={`flex items-center space-x-3 p-3 border cursor-pointer transition-colors ${
                  watchedDocumentType === docType
                    ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-slate-200 dark:border-zinc-800"
                }`}
              >
                <input
                  type="radio"
                  value={docType}
                  {...register("documentType")}
                  className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
                />
                <span className="text-sm text-slate-700 dark:text-zinc-300">
                  {docType}
                </span>
              </label>
            ))}
          </div>
          {watchedDocumentType === "Other" && (
            <Input
              type="text"
              placeholder="Specify document type..."
              {...register("documentTypeOther")}
              className="mt-2 rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
          )}
          {errors.documentType && (
            <p className="text-xs text-red-500">
              {errors.documentType.message}
            </p>
          )}
          {errors.documentTypeOther && (
            <p className="text-xs text-red-500">
              {errors.documentTypeOther.message}
            </p>
          )}
        </div>

        {/* Whole Document or Part */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Are you submitting the whole document or a part?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="whole"
                  {...register("wholeOrPart")}
                  className="w-4 h-4 text-tweaks-blue"
                />
                <span className="text-sm">Whole document</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="part"
                  {...register("wholeOrPart")}
                  className="w-4 h-4 text-tweaks-blue"
                />
                <span className="text-sm">Part of document</span>
              </label>
            </div>
            {errors.wholeOrPart && (
              <p className="text-xs text-red-500">
                {errors.wholeOrPart.message}
              </p>
            )}
          </div>

          {watchedWholeOrPart === "part" && (
            <div className="space-y-2">
              <Label
                htmlFor="whichPart"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Which part? <span className="text-red-500">*</span>
              </Label>
              <Input
                id="whichPart"
                type="text"
                placeholder="e.g. Chapters 1 to 3, or Chapter 4 of 6"
                {...register("whichPart")}
                className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
              />
              {errors.whichPart && (
                <p className="text-xs text-red-500">
                  {errors.whichPart.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Word Count, Auto-Converted Page Count, and Reference List Page Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <Label
              htmlFor="wordCount"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Word Count (excl. references){" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="wordCount"
              type="number"
              min={1}
              placeholder="e.g. 45000"
              {...register("wordCount", {
                onChange: () => setPageCountManuallyEdited(false),
              })}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.wordCount && (
              <p className="text-xs text-red-500">{errors.wordCount.message}</p>
            )}
            <p className="text-xs text-slate-400">
              Read directly from MS Word status bar
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="pageCount"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Billable Page Count <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pageCount"
              type="number"
              min={1}
              placeholder="Auto-filled (300 words/page)"
              {...register("pageCount", {
                onChange: () => setPageCountManuallyEdited(true),
              })}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.pageCount && (
              <p className="text-xs text-red-500">{errors.pageCount.message}</p>
            )}
            <p className="text-xs text-slate-400">
              Auto-calculated at {wordsPerPage} words/page (editable)
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="referencePageCount"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Reference List Pages (0–500){" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="referencePageCount"
              type="number"
              min={0}
              max={500}
              placeholder="0"
              {...register("referencePageCount")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.referencePageCount && (
              <p className="text-xs text-red-500">
                {errors.referencePageCount.message}
              </p>
            )}
            <p className="text-xs text-slate-400">
              Used when Reference List Editing is ticked
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          STEP 3: SERVICES & DELIVERY SPEED
         ===================================================================== */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 3: Select Services & Turnaround Speed
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            All six live services from our rate card. Tick all that apply.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Which services do you require?{" "}
            <span className="text-red-500">*</span>
          </Label>
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
                <label
                  key={svc.id}
                  className={`flex items-start justify-between gap-4 p-4 border cursor-pointer transition-colors ${
                    isChecked
                      ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-zinc-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-1 rounded-none border-slate-300 text-tweaks-blue focus:ring-tweaks-blue"
                      checked={isChecked}
                      onChange={(e) =>
                        handleServiceToggle(svc.name, e.target.checked)
                      }
                    />
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {svc.name}
                      </span>
                      {svc.description && (
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                          {svc.description}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        Standard: {svc.standardTurnaroundMinDays}–
                        {svc.standardTurnaroundMaxDays} days | Express:{" "}
                        {svc.expressTurnaroundMinHours ===
                        svc.expressTurnaroundMaxHours
                          ? `${svc.expressTurnaroundMinHours} hours`
                          : `${svc.expressTurnaroundMinHours}–${svc.expressTurnaroundMaxHours} hours`}{" "}
                        (+{formatZarFromCents(svc.expressSurchargeCents, false)}{" "}
                        {basisLabel})
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-extrabold text-tweaks-blue">
                      {formatZarFromCents(svc.standardRateCents)}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {basisLabel}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.services && (
            <p className="text-xs text-red-500">{errors.services.message}</p>
          )}
        </div>

        {/* Delivery Speed: Standard vs Express */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Delivery Speed <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                watchedDeliverySpeed === "standard"
                  ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              <input
                type="radio"
                value="standard"
                {...register("deliverySpeed")}
                className="w-4 h-4 mt-1 text-tweaks-blue"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                  <Clock className="h-4 w-4 text-tweaks-blue" />
                  <span>Standard Delivery</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {liveQuote.turnaround.minDays} to{" "}
                  {liveQuote.turnaround.maxDays} days from when we receive your
                  document. Standard rate card applies.
                </p>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                watchedDeliverySpeed === "express"
                  ? "border-tweaks-red bg-red-50/30 dark:bg-red-950/20"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              <input
                type="radio"
                value="express"
                {...register("deliverySpeed")}
                className="w-4 h-4 mt-1 text-tweaks-red"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                  <Zap className="h-4 w-4 text-tweaks-red" />
                  <span>Express Priority</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {liveQuote.turnaround.expressMinHours} to{" "}
                  {liveQuote.turnaround.expressMaxHours} hours priority
                  turnaround. Express surcharge applies to selected services.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Main Goal (min 20 chars) & Specific Concerns */}
        <div className="space-y-2 pt-2">
          <Label
            htmlFor="mainGoal"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            What is the main goal of the edit? (min 20 characters){" "}
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="mainGoal"
            rows={3}
            placeholder="e.g. Prepare my PhD thesis for final examination submission, improve academic tone and flow..."
            {...register("mainGoal")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
          />
          {errors.mainGoal && (
            <p className="text-xs text-red-500">{errors.mainGoal.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="concerns"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            Do you have any particular concerns you&apos;d like us to focus on?
          </Label>
          <Textarea
            id="concerns"
            rows={2}
            placeholder="e.g. Wordiness, academic tone, citation consistency, repetition"
            {...register("concerns")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
          />
        </div>
      </div>

      {/* =====================================================================
          STEP 4: STYLE & REFERENCING
         ===================================================================== */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 4: Style & Referencing
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="referencingStyle"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Referencing Style <span className="text-red-500">*</span>
            </Label>
            <select
              id="referencingStyle"
              {...register("referencingStyle")}
              className="w-full h-10 px-3 text-sm rounded-none border border-slate-300 dark:border-zinc-800 focus:outline-none focus:border-tweaks-blue bg-white dark:bg-zinc-950"
            >
              <option value="">Select referencing style...</option>
              {REFERENCING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            {errors.referencingStyle && (
              <p className="text-xs text-red-500">
                {errors.referencingStyle.message}
              </p>
            )}
          </div>

          {watchedReferencingStyle === "Other" && (
            <div className="space-y-2">
              <Label
                htmlFor="referencingStyleOther"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
              >
                Specify Referencing Style{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="referencingStyleOther"
                type="text"
                placeholder="Enter your department or journal referencing guide"
                {...register("referencingStyleOther")}
                className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
              />
              {errors.referencingStyleOther && (
                <p className="text-xs text-red-500">
                  {errors.referencingStyleOther.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Attach Document or Institutional Style Guide (Optional, max 10MB)
          </Label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-dashed border-slate-300 dark:border-zinc-700 rounded-none cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-tweaks-blue transition-all text-sm font-semibold"
            >
              <Paperclip className="h-4 w-4 text-slate-400" />
              <span>Select File</span>
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".docx,.doc,.pdf,.txt"
              className="hidden"
              {...register("file")}
              onChange={(e) => {
                register("file").onChange(e);
                if (e.target.files && e.target.files.length > 0) {
                  setFileName(e.target.files[0].name);
                }
              }}
            />
            <span className="text-xs text-slate-500 truncate max-w-xs">
              {fileName || "No file selected"}
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================================
          STEP 5: DATES, SUPERVISOR SIGN-OFF, FUNDING & QUOTE PREVIEW
         ===================================================================== */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 5: Dates, Supervisor Sign-Off & Payment Option
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            Turnaround time starts from the date we receive your document.
          </p>
        </div>

        {/* Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="expectedSendDate"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              When will you send us the document?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expectedSendDate"
              type="date"
              min={todayIso}
              {...register("expectedSendDate")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.expectedSendDate && (
              <p className="text-xs text-red-500">
                {errors.expectedSendDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="requestedReturnDate"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              When do you need it back? <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requestedReturnDate"
              type="date"
              min={minReturnDateIso}
              {...register("requestedReturnDate")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.requestedReturnDate && (
              <p className="text-xs text-red-500">
                {errors.requestedReturnDate.message}
              </p>
            )}
            <p className="text-xs text-slate-400">
              Earliest return date based on selected services:{" "}
              <strong>{minReturnDateIso}</strong>
            </p>
          </div>
        </div>

        {/* Supervisor Sign-Off Obtained */}
        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Has your supervisor signed off on this document going for editing?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="yes"
                {...register("supervisorSignOff")}
                className="w-4 h-4 text-tweaks-blue"
              />
              <span className="text-sm font-medium">
                Yes, supervisor sign-off obtained
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="no"
                {...register("supervisorSignOff")}
                className="w-4 h-4 text-tweaks-red"
              />
              <span className="text-sm font-medium">No, not yet</span>
            </label>
          </div>

          {watchedSupervisorSignOff === "no" && (
            <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 space-y-4 mt-3">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed italic">
                  &ldquo;{settings.supervisor_disclaimer_text}&rdquo;
                </p>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("supervisorDisclaimerAck")}
                  className="w-4 h-4 mt-0.5 rounded-none border-amber-400 text-tweaks-blue"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  I have read and acknowledge this disclaimer{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.supervisorDisclaimerAck && (
                <p className="text-xs text-red-600">
                  {errors.supervisorDisclaimerAck.message}
                </p>
              )}

              <div className="pt-2 border-t border-amber-200/70 dark:border-amber-900/60 space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("requestSupervisorSignOff")}
                    className="w-4 h-4 rounded-none border-slate-300 text-tweaks-blue"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Optional: Email my supervisor a 1-click sign-off
                    confirmation link now (no fees or payment details are shown
                    to your supervisor)
                  </span>
                </label>

                {watchedRequestSupervisor && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Supervisor Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="Prof. N. Dlamini"
                        {...register("supervisorName")}
                        className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs"
                      />
                      {errors.supervisorName && (
                        <p className="text-xs text-red-500">
                          {errors.supervisorName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Supervisor Institutional Email{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        placeholder="n.dlamini@uct.ac.za"
                        {...register("supervisorEmail")}
                        className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs"
                      />
                      {errors.supervisorEmail && (
                        <p className="text-xs text-red-500">
                          {errors.supervisorEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tracked Changes & Certificate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Tracked Changes Preference <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {["Yes, both versions", "Just the edited file is fine", "Other"].map(
                (opt) => (
                  <label
                    key={opt}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={opt}
                      {...register("trackedChanges")}
                      className="w-4 h-4 text-tweaks-blue"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                )
              )}
              {watchedTrackedChanges === "Other" && (
                <Input
                  type="text"
                  placeholder="Specify preference..."
                  {...register("trackedChangesOther")}
                  className="rounded-none h-8 text-xs"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Official Editing Certificate Required?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={opt}
                    {...register("certificate")}
                    className="w-4 h-4 text-tweaks-blue"
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Payment / Funding Option + Conditional Payment Plan (2 vs 3 months) */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Payment & Funding Option <span className="text-red-500">*</span>
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label
              className={`p-4 border cursor-pointer transition-colors ${
                watchedPaymentOption === "full_payment"
                  ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <input
                  type="radio"
                  value="full_payment"
                  {...register("paymentOption")}
                  className="w-4 h-4 text-tweaks-blue"
                />
                <span>1. Full Payment</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Full fee paid up front via Paystack or EFT.
              </p>
            </label>

            <label
              className={`p-4 border cursor-pointer transition-colors ${
                watchedPaymentOption === "payment_plan"
                  ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <input
                  type="radio"
                  value="payment_plan"
                  {...register("paymentOption")}
                  className="w-4 h-4 text-tweaks-blue"
                />
                <span>2. Payment Plan (50% Deposit)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                50% deposit now, balance over up to{" "}
                <strong>{liveQuote.maxInstalmentMonths} months</strong>
                {liveQuote.totalFeeCents > 0 && liveQuote.totalFeeCents < 300000
                  ? " (max 2 months for quotes under R3,000)"
                  : " (up to 3 months for quotes R3,000+)"}
                .
              </p>
            </label>

            <label
              className={`p-4 border cursor-pointer transition-colors ${
                watchedPaymentOption === "institutional_funding"
                  ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <input
                  type="radio"
                  value="institutional_funding"
                  {...register("paymentOption")}
                  className="w-4 h-4 text-tweaks-blue"
                />
                <span>3. Institutional Funding</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Paid by your university/institution against an official Purchase
                Order (no deposit).
              </p>
            </label>
          </div>

          {/* Option 2: Instalment Month Picker (2 vs 3 months conditional on R3,000 rule) */}
          {watchedPaymentOption === "payment_plan" && (
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Payment Plan Schedule
                  </h4>
                  <p className="text-xs text-slate-500">
                    {liveQuote.totalFeeCents < 300000
                      ? "Quotes under R3,000 qualify for a 2-month payment plan after the 50% deposit."
                      : "Quotes of R3,000 or more qualify for up to a 3-month payment plan after the 50% deposit."}
                  </p>
                </div>
                {liveQuote.maxInstalmentMonths === 3 && (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        value={2}
                        checked={Number(watchedSelectedMonths) === 2}
                        onChange={() => setValue("selectedInstalmentMonths", 2)}
                      />
                      <span>2 Months</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                      <input
                        type="radio"
                        value={3}
                        checked={Number(watchedSelectedMonths) === 3}
                        onChange={() => setValue("selectedInstalmentMonths", 3)}
                      />
                      <span>3 Months</span>
                    </label>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Note: Under a payment plan, your edited work is released once
                the final instalment clears your balance to zero.
              </p>
            </div>
          )}

          {/* Option 3: Institutional Funding Fields & Policy Notice */}
          {watchedPaymentOption === "institutional_funding" && (
            <div className="p-5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-tweaks-blue shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                  {settings.institutional_release_text}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Department / Faculty <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Department of Sociology"
                    {...register("department")}
                    className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs"
                  />
                  {errors.department && (
                    <p className="text-xs text-red-500">
                      {errors.department.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Billing Contact Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Finance Officer / Administrator"
                    {...register("billingContactName")}
                    className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs"
                  />
                  {errors.billingContactName && (
                    <p className="text-xs text-red-500">
                      {errors.billingContactName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                    Billing Contact Email{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="finance@university.ac.za"
                    {...register("billingContactEmail")}
                    className="rounded-none bg-white dark:bg-zinc-950 h-9 text-xs"
                  />
                  {errors.billingContactEmail && (
                    <p className="text-xs text-red-500">
                      {errors.billingContactEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Quote Breakdown Card */}
        {liveQuote.items.length > 0 && (
          <div className="p-6 bg-slate-900 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-tweaks-red" />
                <span className="text-xs font-bold uppercase tracking-wider">
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

            <div className="border-t border-slate-700 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs text-slate-400 block">
                  Estimated Total (ZAR)
                </span>
                <span className="text-2xl font-black text-white">
                  {formatZarFromCents(liveQuote.totalFeeCents)}
                </span>
              </div>
              <div className="text-left sm:text-right text-xs text-slate-300">
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
                          liveQuote.instalmentAmountsCents[0] || 0
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

        {/* Additional Info */}
        <div className="space-y-2 pt-2">
          <Label
            htmlFor="additionalInfo"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            Anything else you&apos;d like to add or clarify?
          </Label>
          <Textarea
            id="additionalInfo"
            rows={3}
            {...register("additionalInfo")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
          />
        </div>

        {/* Mandatory Scope Declaration */}
        <div className="p-5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
            <FileCheck2 className="h-4 w-4 text-tweaks-blue" />
            <span>
              Scope Declaration <span className="text-red-500">*</span>
            </span>
          </div>
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...register("scopeDeclarationAccepted")}
              className="w-4 h-4 mt-1 rounded-none border-slate-300 text-tweaks-blue focus:ring-tweaks-blue"
            />
            <span className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
              {settings.scope_declaration_text}
            </span>
          </label>
          {!watchedScopeDeclaration && errors.scopeDeclarationAccepted && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-zinc-300">
              <strong>What our service covers:</strong> Tweaks provides
              professional academic language editing, reference checking,
              reference list formatting, and document layout formatting on your
              own original research. We do not write or rewrite content, run
              Turnitin/plagiarism similarity checks, or guarantee academic
              grades. Please tick the box above to confirm and submit your
              brief.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-tweaks-red hover:bg-tweaks-blue text-white cursor-pointer py-6 font-bold rounded-none shadow-md transition-colors tracking-wide text-base disabled:opacity-70"
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
      </div>
    </form>
  );
}

export default function Contact() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Intro Text */}
            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 text-left">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Request a Quote
                </h1>
                <div className="space-y-4 text-base text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
                  <p>
                    Complete your project brief below to receive an instant
                    estimate and official quotation tailored to your document,
                    turnaround time, and funding route.
                  </p>
                  <p>
                    Whether you are paying upfront, choosing a 50% deposit
                    payment plan, or submitting for institutional funding via a
                    university Purchase Order, your quote is generated
                    automatically from our live rate card.
                  </p>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-zinc-800 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center h-12 w-12 bg-tweaks-red/10 text-tweaks-red rounded-none border border-tweaks-red/20">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Email Us
                      </h4>
                      <a
                        href="mailto:hello@tweaks.co.za"
                        className="text-sm font-light text-tweaks-blue hover:underline"
                      >
                        hello@tweaks.co.za
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="lg:col-span-8">
              <div className="border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-none shadow-sm p-6 sm:p-10 lg:p-12">
                <Suspense
                  fallback={
                    <div className="py-20 flex justify-center text-slate-500">
                      <div className="animate-pulse flex items-center gap-3">
                        <div className="h-5 w-5 bg-slate-300 rounded-full"></div>
                        <span className="text-base font-semibold tracking-wide uppercase">
                          Loading Brief Form...
                        </span>
                      </div>
                    </div>
                  }
                >
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
