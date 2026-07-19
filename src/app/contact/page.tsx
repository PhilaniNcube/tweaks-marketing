"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Send,
  CheckCircle2,
  Paperclip,
  AlertCircle,
  Phone,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, ContactFormData } from "@/lib/validations/contact";
import { sendGTMEvent } from "@next/third-parties/google";
import { toast } from "sonner";

function ContactForm() {
  const searchParams = useSearchParams();
  const [fileName, setFileName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<{
    success: boolean;
    error?: string;
    errors?: Record<string, string[]>;
  }>({ success: false });

  type ContactFormValues = ContactFormData & { file?: FileList };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      documentTypes: [],
      documentTypeOther: "",
      studyLevel: "",
      studyLevelOther: "",
      pageCount: "",
      referencePageCount: "",
      services: [],
      serviceOther: "",
      mainGoal: "",
      concerns: "",
      referencingStyle: "",
      deadline: "",
      submissionDate: "",
      trackedChanges: "",
      trackedChangesOther: "",
      certificate: "",
      funding: "",
      additionalInfo: "",
      file: undefined,
    },
  });

  // Initialize from searchParams
  useEffect(() => {
    const serviceParam = searchParams.get("service");
    const defaultPages =
      searchParams.get("pageCount") ||
      searchParams.get("pages") ||
      searchParams.get("minutes") ||
      searchParams.get("documents") ||
      searchParams.get("articles") ||
      "";

    if (serviceParam) {
      const servicesList = serviceParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (servicesList.length > 0) {
        setValue("services", servicesList);
      }
    }
    if (defaultPages) {
      setValue("pageCount", defaultPages);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (state.success) {
      toast.success("Brief submitted successfully!", {
        description:
          "We have received your project details. A member of our editorial team will reply shortly.",
      });
      sendGTMEvent({
        event: "contact_form_submission",
        services: searchParams.get("service") || "custom",
      });
    }
  }, [state.success, searchParams]);

  useEffect(() => {
    if (state.error) {
      toast.error("Submission failed", {
        description: state.error,
      });
    }
  }, [state.error]);

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
      <div className="py-12 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Brief Submitted Successfully!
          </h3>
          <p className="text-slate-500 dark:text-zinc-400 font-light text-sm max-w-md mx-auto leading-relaxed">
            Thank you! We have received your project details. A member of our
            editorial team will reply to you shortly.
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="cursor-pointer rounded-none border-slate-300 hover:border-tweaks-blue hover:text-tweaks-blue transition-colors"
        >
          Submit Another Project
        </Button>
      </div>
    );
  }

  // watch for certain fields to handle "Other" text inputs conditionally or just let them be bound
  const documentTypes = watch("documentTypes");
  const services = watch("services");

  const handleCheckboxChange = (
    field: "documentTypes" | "services",
    value: string,
    checked: boolean,
  ) => {
    const current = watch(field) || [];
    if (checked) {
      setValue(field, [...current, value]);
    } else {
      setValue(
        field,
        current.filter((item) => item !== value),
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 text-left">
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
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.entries(state.errors).map(([field, messages]) =>
                messages?.map((msg, i) => <li key={`${field}-${i}`}>{msg}</li>),
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Step 1: Tell us about yourself */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 1: Tell us about yourself
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            We just need a few contact details so we can reach you about your
            project.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Name & Surname <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Doe"
              {...register("name")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
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
              placeholder="jane.doe@university.edu"
              {...register("email")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="whatsapp"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              WhatsApp Number <span className="text-red-500">*</span>
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
        </div>
      </div>

      {/* Step 2: What are you submitting? */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 2: What are you submitting?
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            Help us understand the type and size of your document.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            What kind of document do you need edited?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Thesis/Dissertation",
              "Proposal",
              "Assignment",
              "Journal Article",
            ].map((docType) => (
              <label
                key={docType}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-none border-slate-300 text-tweaks-blue focus:ring-tweaks-blue"
                  checked={documentTypes?.includes(docType) || false}
                  onChange={(e) =>
                    handleCheckboxChange(
                      "documentTypes",
                      docType,
                      e.target.checked,
                    )
                  }
                />
                <span className="text-sm text-slate-700 dark:text-zinc-300">
                  {docType}
                </span>
              </label>
            ))}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-none border-slate-300 text-tweaks-blue focus:ring-tweaks-blue"
                checked={documentTypes?.includes("Other") || false}
                onChange={(e) =>
                  handleCheckboxChange(
                    "documentTypes",
                    "Other",
                    e.target.checked,
                  )
                }
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                Other:
              </span>
              <Input
                type="text"
                {...register("documentTypeOther")}
                className="rounded-none border-b border-slate-300 dark:border-zinc-800 border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-transparent h-8 w-full"
              />
            </label>
          </div>
          {errors.documentTypes && (
            <p className="text-xs text-red-500">
              {errors.documentTypes.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            What is your current level of study?
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {["Honors", "Masters'", "PhD"].map((level) => (
              <label
                key={level}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="radio"
                  value={level}
                  {...register("studyLevel")}
                  className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
                />
                <span className="text-sm text-slate-700 dark:text-zinc-300">
                  {level}
                </span>
              </label>
            ))}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="Other"
                {...register("studyLevel")}
                className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                Other:
              </span>
              <Input
                type="text"
                {...register("studyLevelOther")}
                className="rounded-none border-b border-slate-300 dark:border-zinc-800 border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-transparent h-8 w-full"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <Label
              htmlFor="pageCount"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Page count (excluding reference list)?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pageCount"
              type="text"
              placeholder="e.g. 150"
              {...register("pageCount")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.pageCount && (
              <p className="text-xs text-red-500">{errors.pageCount.message}</p>
            )}
            <p className="text-xs text-slate-400 italic">
              (Approximate if not finalised)
            </p>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="refPageCount"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              Page count of the Reference List?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="refPageCount"
              type="text"
              placeholder="e.g. 12"
              {...register("referencePageCount")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.referencePageCount && (
              <p className="text-xs text-red-500">
                {errors.referencePageCount.message}
              </p>
            )}
            <p className="text-xs text-slate-400 italic">
              (If Applicable, or type 0)
            </p>
          </div>
        </div>
      </div>

      {/* Step 3: What kind of editing do you need? */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 3: What kind of editing do you need?
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            Tell us what kind of editing support you're looking for so we can
            tailor our service.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Which services do you require?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-3">
            {[
              {
                id: "academic-editing",
                label: "Academic Editing",
                desc: "Our editors correct your grammar, punctuation, and spelling; edit for content, style, and presentation; delete irrelevant points; order points within sections.",
              },
              {
                id: "reference-checking",
                label: "Reference Checking",
                desc: "We check and correct reference citations in your research work, according to your Reference guide. We then check that all references in your reference list are cited in your text and vice versa.",
              },
              {
                id: "reference-list-editing",
                label: "Reference List Editing",
                desc: "We edit your reference list ensuring the correct format is used for various sources.",
              },
              {
                id: "formatting",
                label: "Formatting",
                desc: "We address things like font selection, font size and presentation, spacing, margins, alignment, columns, indentation, and lists.",
              },
            ].map((svc) => (
              <label
                key={svc.id}
                className="flex items-start space-x-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 mt-1 rounded-none border-slate-300 text-tweaks-blue focus:ring-tweaks-blue"
                  checked={
                    services?.includes(svc.id) ||
                    services?.includes(svc.label) ||
                    false
                  }
                  onChange={(e) =>
                    handleCheckboxChange("services", svc.id, e.target.checked)
                  }
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    {svc.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-light">
                    {svc.desc}
                  </span>
                </div>
              </label>
            ))}
            <label className="flex items-center space-x-3 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded-none border-slate-300 text-tweaks-blue focus:ring-tweaks-blue"
                checked={services?.includes("Other") || false}
                onChange={(e) =>
                  handleCheckboxChange("services", "Other", e.target.checked)
                }
              />
              <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                Other:
              </span>
              <Input
                type="text"
                {...register("serviceOther")}
                className="rounded-none border-b border-slate-300 dark:border-zinc-800 border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-transparent h-8 w-full max-w-sm"
              />
            </label>
          </div>
          {errors.services && (
            <p className="text-xs text-red-500">{errors.services.message}</p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Label
            htmlFor="mainGoal"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            What is the main goal of the edit?
          </Label>
          <p className="text-xs text-slate-400 italic mb-2">
            (e.g. Improve clarity, prepare for publication, fix grammar, adjust
            tone for audience, meet guidelines)
          </p>
          <Textarea
            id="mainGoal"
            rows={3}
            {...register("mainGoal")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
          />
        </div>

        <div className="space-y-2 pt-2">
          <Label
            htmlFor="concerns"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            Do you have any particular concerns you'd like us to focus on?
          </Label>
          <p className="text-xs text-slate-400 italic mb-2">
            (e.g. Wordiness, academic tone, referencing, repetition)
          </p>
          <Textarea
            id="concerns"
            rows={3}
            {...register("concerns")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
          />
        </div>
      </div>

      {/* Step 4: Style and Referencing */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 4: Style and Referencing
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            Help us ensure the final version matches your required style and
            referencing guidelines.
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="referencingStyle"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            What referencing style should we follow?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="referencingStyle"
            type="text"
            placeholder="e.g. APA 7th, Harvard, Chicago, MLA, IEEE, institution-specific"
            {...register("referencingStyle")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
          />
          {errors.referencingStyle && (
            <p className="text-xs text-red-500">
              {errors.referencingStyle.message}
            </p>
          )}
        </div>

        <div className="space-y-2 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Do you have a style guide or institutional formatting template we
            should use?
          </Label>
          <p className="text-xs text-slate-400 italic mb-3">
            (Upload or link if available.)
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Label
              htmlFor="file-upload"
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-dashed border-slate-300 dark:border-zinc-700 rounded-none cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900 hover:border-tweaks-blue transition-all text-sm font-semibold"
            >
              <Paperclip className="h-4 w-4 text-slate-400" />
              <span>Select Document</span>
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

      {/* Step 5: Logistics and Delivery */}
      <div className="space-y-6">
        <div className="border-b border-slate-100 dark:border-zinc-800 pb-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Step 5: Logistics and Delivery
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-light">
            Let's clarify practical details so we can plan accordingly and meet
            your expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="deadline"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              What is your deadline? <span className="text-red-500">*</span>
            </Label>
            <Input
              id="deadline"
              type="text"
              placeholder="Example: 7 January 2026"
              {...register("deadline")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.deadline && (
              <p className="text-xs text-red-500">{errors.deadline.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="submissionDate"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
            >
              When will you submit your document?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="submissionDate"
              type="text"
              placeholder="Example: 1 December 2025"
              {...register("submissionDate")}
              className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950"
            />
            {errors.submissionDate && (
              <p className="text-xs text-red-500">
                {errors.submissionDate.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Will you require a tracked changes version and a clean copy?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="space-y-2">
            {["Yes, both versions", "Just the edited file is fine"].map(
              (opt) => (
                <label
                  key={opt}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={opt}
                    {...register("trackedChanges")}
                    className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-zinc-300">
                    {opt}
                  </span>
                </label>
              ),
            )}
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value="Other"
                {...register("trackedChanges")}
                className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300 whitespace-nowrap">
                Other:
              </span>
              <Input
                type="text"
                {...register("trackedChangesOther")}
                className="rounded-none border-b border-slate-300 dark:border-zinc-800 border-t-0 border-l-0 border-r-0 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-transparent h-8 w-full max-w-sm"
              />
            </label>
          </div>
          {errors.trackedChanges && (
            <p className="text-xs text-red-500">
              {errors.trackedChanges.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Will you require an editing certificate?{" "}
              <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              {["Yes", "No"].map((opt) => (
                <label
                  key={opt}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={opt}
                    {...register("certificate")}
                    className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-zinc-300">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
            {errors.certificate && (
              <p className="text-xs text-red-500">
                {errors.certificate.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              How are you funding this finalisation cost?
            </Label>
            <div className="space-y-2">
              {[
                {
                  val: "Institution funded",
                  label: "Institution funded - My institution will be paying",
                },
                { val: "Self Funded", label: "Self Funded - I will be paying" },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    value={opt.val}
                    {...register("funding")}
                    className="w-4 h-4 text-tweaks-blue focus:ring-tweaks-blue border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-zinc-300">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <Label
            htmlFor="additionalInfo"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400"
          >
            Anything else you'd like to add or clarify before we begin?
          </Label>
          <Textarea
            id="additionalInfo"
            rows={4}
            {...register("additionalInfo")}
            className="rounded-none border-slate-300 dark:border-zinc-800 focus-visible:ring-0 focus-visible:border-tweaks-blue bg-white dark:bg-zinc-950 resize-none"
          />
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
          {isPending ? "Submitting..." : "Submit Editing Brief"}
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
                  Contact Us
                </h1>
                <div className="space-y-4 text-base text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
                  <p>
                    We are always happy to hear from you. Whether you have a
                    straightforward project or would like to ask a few questions
                    before deciding on the best approach, we are always happy to
                    listen and offer advice and guidance.
                  </p>
                  <p>
                    Complete the project briefing form with as much detail as
                    possible, and we'll review your requirements before sending
                    you a formal quotation, together with a proposed timeline.
                    If you have any questions, you're also welcome to contact us
                    directly by email.
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
                          Loading Form...
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
