"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Loader2,
  UserCheck,
} from "lucide-react";
import { calculateQuoteFromCatalog } from "@/lib/pricing/quote-calculator";
import { formatZarFromCents, STAGE_LABELS } from "@/components/crm/crm-helpers";
import { createInternalProjectAction } from "@/app/actions/crm";
import type {
  Service,
  RateCardRule,
  Institution,
  DegreeLevel,
  Editor,
  PaymentOption,
  ProjectStage,
} from "@/db/schema";
import { toast } from "sonner";

interface NewProjectClientProps {
  services: Service[];
  rules: RateCardRule[];
  institutions: Institution[];
  degreeLevels: DegreeLevel[];
  editors: Editor[];
}

export function NewProjectClient({
  services,
  rules,
  institutions,
  degreeLevels,
  editors,
}: NewProjectClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const todayIso = new Date().toISOString().split("T")[0];
  const defaultReturnIso = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [institutionId, setInstitutionId] = useState(
    institutions[0]?.id || "Other"
  );
  const [institutionOther, setInstitutionOther] = useState("");
  const [degreeLevel, setDegreeLevel] = useState(
    degreeLevels[0]?.designator || "MA"
  );
  const [degreeProgramme, setDegreeProgramme] = useState("");
  const [researchTitle, setResearchTitle] = useState("");
  const [documentType, setDocumentType] = useState(
    "Master’s dissertation / treatise"
  );
  const [wholeOrPart, setWholeOrPart] = useState<"whole" | "part">("whole");
  const [whichPart, setWhichPart] = useState("");
  const [wordCount, setWordCount] = useState<number>(15000);
  const [pageCountOverride, setPageCountOverride] = useState<number | null>(
    null
  );
  const [referencePageCount, setReferencePageCount] = useState<number>(8);
  const [referencingStyle, setReferencingStyle] = useState("APA 7th edition");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Academic editing",
  ]);
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "express">(
    "standard"
  );
  const [expectedSendDate, setExpectedSendDate] = useState(todayIso);
  const [requestedReturnDate, setRequestedReturnDate] =
    useState(defaultReturnIso);
  const [paymentOption, setPaymentOption] =
    useState<PaymentOption>("full_payment");
  const [selectedInstalmentMonths, setSelectedInstalmentMonths] =
    useState<number>(2);
  const [department, setDepartment] = useState("");
  const [billingContactName, setBillingContactName] = useState("");
  const [billingContactEmail, setBillingContactEmail] = useState("");
  const [supervisorSignOff, setSupervisorSignOff] = useState<"yes" | "no">(
    "yes"
  );
  const [supervisorName, setSupervisorName] = useState("");
  const [supervisorEmail, setSupervisorEmail] = useState("");
  const [assignedEditorId, setAssignedEditorId] = useState<string>("");
  const [initialStage, setInitialStage] = useState<ProjectStage>("quote_sent");
  const [mainGoal, setMainGoal] = useState(
    "Academic language editing, coherence, and clarity."
  );
  const [internalNotes, setInternalNotes] = useState("");

  const calculatedPages = Math.max(1, Math.ceil((wordCount || 300) / 300));
  const effectivePageCount = pageCountOverride ?? calculatedPages;

  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.length > 1
          ? prev.filter((s) => s !== serviceName)
          : prev
        : [...prev, serviceName]
    );
  };

  const liveQuote = useMemo(() => {
    return calculateQuoteFromCatalog(
      {
        selectedServices,
        pageCount: effectivePageCount,
        referencePageCount,
        wordCount,
        deliverySpeed,
        paymentOption,
        requestedInstalmentMonths: selectedInstalmentMonths,
        degreeLevel,
      },
      services,
      rules
    );
  }, [
    selectedServices,
    effectivePageCount,
    referencePageCount,
    wordCount,
    deliverySpeed,
    paymentOption,
    selectedInstalmentMonths,
    degreeLevel,
    services,
    rules,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !surname.trim() || !email.trim()) {
      toast.error("Please fill in client name and email.");
      return;
    }
    if (!researchTitle.trim() || !degreeProgramme.trim()) {
      toast.error("Please enter the degree programme and research title.");
      return;
    }

    startTransition(async () => {
      const res = await createInternalProjectAction({
        firstName,
        surname,
        email,
        whatsapp: whatsapp || "+27",
        institutionId,
        institutionOther,
        degreeLevel,
        degreeProgramme,
        researchTitle,
        services: selectedServices,
        documentType,
        wholeOrPart,
        whichPart,
        wordCount,
        pageCount: effectivePageCount,
        referencePageCount,
        referencingStyle,
        deliverySpeed,
        expectedSendDate,
        requestedReturnDate,
        mainGoal,
        trackedChanges: "Tracked changes + clean copy",
        certificate: "Yes",
        paymentOption,
        selectedInstalmentMonths: liveQuote.selectedInstalmentMonths,
        department,
        billingContactName,
        billingContactEmail,
        supervisorSignOff,
        supervisorName,
        supervisorEmail,
        assignedEditorId: assignedEditorId || undefined,
        initialStage,
        internalNotes,
      });

      if (res.success && res.projectId) {
        toast.success(`Project logged (${res.quoteNumber})`);
        router.push(`/projects/${res.projectId}`);
      } else {
        toast.error(res.error || "Failed to log project");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-5">
        <div>
          <Link
            href="/projects"
            className="text-xs font-bold text-slate-500 hover:text-tweaks-blue inline-flex items-center gap-1.5 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Projects
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Internal Project Intake
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Log a new brief directly in the CRM, calculate page estimates &amp; quote fees, and assign an editor.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        {/* Left 2 Columns: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Client & Academic Details */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              1. Client &amp; Academic Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Surname *
                </label>
                <input
                  type="text"
                  required
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+27..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Institution *
                </label>
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                  <option value="Other">Other Institution</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Degree Level *
                </label>
                <select
                  value={degreeLevel}
                  onChange={(e) => setDegreeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  {degreeLevels.map((dl) => (
                    <option key={dl.id} value={dl.designator}>
                      {dl.designator}
                    </option>
                  ))}
                  <option value="N/A">N/A (Journal Article)</option>
                </select>
              </div>
            </div>

            {institutionId === "Other" && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Specify Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={institutionOther}
                  onChange={(e) => setInstitutionOther(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Degree Programme / Field *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Educational Psychology"
                  value={degreeProgramme}
                  onChange={(e) => setDegreeProgramme(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                >
                  <option value="Master’s dissertation / treatise">
                    Master’s dissertation / treatise
                  </option>
                  <option value="Doctoral thesis (PhD / DPhil / DEd)">
                    Doctoral thesis (PhD / DPhil / DEd)
                  </option>
                  <option value="Honours / Postgraduate Diploma research report">
                    Honours / PGDip research report
                  </option>
                  <option value="Research proposal">Research proposal</option>
                  <option value="Journal manuscript / article">
                    Journal manuscript / article
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Research / Manuscript Title *
              </label>
              <input
                type="text"
                required
                value={researchTitle}
                onChange={(e) => setResearchTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          {/* 2. Word Count, Page Estimator & Services */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2">
              2. Word Count, Page Estimator &amp; Services
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Word Count *
                </label>
                <input
                  type="number"
                  min={100}
                  value={wordCount}
                  onChange={(e) => {
                    setWordCount(Number(e.target.value) || 0);
                    setPageCountOverride(null);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Auto-calculates at 300 words/page ({calculatedPages} pages)
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Billable Page Count *
                </label>
                <input
                  type="number"
                  min={1}
                  value={effectivePageCount}
                  onChange={(e) =>
                    setPageCountOverride(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Reference List Pages (0–500)
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={referencePageCount}
                  onChange={(e) =>
                    setReferencePageCount(Math.max(0, Number(e.target.value)))
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-bold uppercase text-slate-500">
                Select Services *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {services.map((svc) => {
                  const checked = selectedServices.includes(svc.name);
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.name)}
                      className={`p-3 text-left border text-xs flex items-start justify-between cursor-pointer transition-colors ${
                        checked
                          ? "border-tweaks-blue bg-tweaks-blue/5"
                          : "border-slate-200 dark:border-zinc-800"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {svc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Std: {formatZarFromCents(svc.standardRateCents)} | Exp: +
                          {formatZarFromCents(svc.expressSurchargeCents)}
                        </p>
                      </div>
                      {checked && (
                        <CheckCircle2 className="h-4 w-4 text-tweaks-blue shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Delivery Speed
                </label>
                <select
                  value={deliverySpeed}
                  onChange={(e) =>
                    setDeliverySpeed(e.target.value as "standard" | "express")
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-bold"
                >
                  <option value="standard">Standard Turnaround</option>
                  <option value="express">Express Turnaround</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Expected File Send Date
                </label>
                <input
                  type="date"
                  value={expectedSendDate}
                  onChange={(e) => setExpectedSendDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Requested Return Date
                </label>
                <input
                  type="date"
                  value={requestedReturnDate}
                  onChange={(e) => setRequestedReturnDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Editor Assignment, Stage & Funding Option */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-zinc-800 pb-2 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-tweaks-blue" />
              3. Editor Assignment, Stage &amp; Payment Option
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Assign Editor
                </label>
                <select
                  value={assignedEditorId}
                  onChange={(e) => setAssignedEditorId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  <option value="">Unassigned</option>
                  {editors.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.name} ({ed.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Initial Pipeline Stage
                </label>
                <select
                  value={initialStage}
                  onChange={(e) =>
                    setInitialStage(e.target.value as ProjectStage)
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  {Object.entries(STAGE_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Payment Option
                </label>
                <select
                  value={paymentOption}
                  onChange={(e) =>
                    setPaymentOption(e.target.value as PaymentOption)
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-semibold"
                >
                  <option value="full_payment">Option 1: Full Payment</option>
                  <option value="payment_plan">
                    Option 2: 50% Deposit + Plan (Max{" "}
                    {liveQuote.maxInstalmentMonths}m)
                  </option>
                  <option value="institutional_funding">
                    Option 3: Institutional PO
                  </option>
                </select>
              </div>
            </div>

            {paymentOption === "institutional_funding" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Department / Faculty
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Billing Contact Name
                  </label>
                  <input
                    type="text"
                    value={billingContactName}
                    onChange={(e) => setBillingContactName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Billing Contact Email
                  </label>
                  <input
                    type="email"
                    value={billingContactEmail}
                    onChange={(e) => setBillingContactEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                Internal Editor / Admin Notes
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Notes visible only to the Tweaks CRM team..."
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Quote Summary & Submit */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 space-y-5 sticky top-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
            <Calculator className="h-4 w-4 text-tweaks-blue" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Live Quote Calculation
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            {liveQuote.items.map((item) => (
              <div
                key={item.serviceId}
                className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/70 pb-2"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">
                    {item.serviceName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Qty: {item.quantity} ({item.pricingBasis.replace("_", " ")})
                  </p>
                </div>
                <span className="font-mono font-bold">
                  {formatZarFromCents(item.lineTotalCents)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Standard Subtotal</span>
              <span className="font-mono">
                {formatZarFromCents(liveQuote.subtotalCents)}
              </span>
            </div>
            {liveQuote.expressSurchargeCents > 0 && (
              <div className="flex justify-between text-amber-600 font-semibold">
                <span>Express Surcharge</span>
                <span className="font-mono">
                  +{formatZarFromCents(liveQuote.expressSurchargeCents)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-zinc-800">
              <span>Total Quote Fee</span>
              <span className="font-mono text-tweaks-blue">
                {formatZarFromCents(liveQuote.totalFeeCents)}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[11px] space-y-1">
            <p className="font-bold text-slate-700 dark:text-zinc-300">
              Conditional Payment Plan Rule:
            </p>
            <p className="text-slate-500">
              {liveQuote.totalFeeCents < 300000
                ? "Under R3,000 → Maximum 2 monthly instalments after 50% deposit."
                : "R3,000 or above → Eligible for up to 3 monthly instalments after 50% deposit."}
            </p>
            <p className="font-mono font-bold text-slate-800 dark:text-zinc-200 pt-1">
              Upfront Required:{" "}
              {formatZarFromCents(liveQuote.depositRequiredCents)} (
              {liveQuote.depositPercentage}%)
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-tweaks-blue hover:bg-tweaks-red text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending
              ? "Creating Project & Quote..."
              : "Log Project & Generate Quote"}
          </button>
        </div>
      </form>
    </div>
  );
}

