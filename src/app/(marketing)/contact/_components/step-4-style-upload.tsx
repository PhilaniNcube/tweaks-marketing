"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
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
import { REFERENCING_STYLES } from "@/lib/validations/contact";
import type { ContactFormValues } from "./types";

interface Step4StyleUploadProps {
  fileName: string;
  onFileSelect: (file: File | null) => void;
}

export function Step4StyleUpload({
  fileName,
  onFileSelect,
}: Step4StyleUploadProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const watchedReferencingStyle = watch("referencingStyle");
  const watchedTrackedChanges = watch("trackedChanges");
  const watchedCertificate = watch("certificate");

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 4: Style, Referencing &amp; Manuscript Upload
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          Select your referencing style, editing preferences, and optionally
          attach your manuscript.
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={!!errors.referencingStyle}>
          <FieldLabel htmlFor="referencingStyle">
            Referencing Style <span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            id="referencingStyle"
            aria-invalid={!!errors.referencingStyle}
            className="w-full"
            {...register("referencingStyle")}
          >
            <NativeSelectOption value="">
              Select referencing style...
            </NativeSelectOption>
            {REFERENCING_STYLES.map((style) => (
              <NativeSelectOption key={style} value={style}>
                {style}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[errors.referencingStyle]} />
        </Field>

        {watchedReferencingStyle === "Other" && (
          <Field data-invalid={!!errors.referencingStyleOther}>
            <FieldLabel htmlFor="referencingStyleOther">
              Specify Referencing Style{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="referencingStyleOther"
              type="text"
              placeholder="Enter your department or journal referencing guide"
              aria-invalid={!!errors.referencingStyleOther}
              {...register("referencingStyleOther")}
            />
            <FieldError errors={[errors.referencingStyleOther]} />
          </Field>
        )}
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FieldSet data-invalid={!!errors.trackedChanges}>
          <FieldLegend variant="label">
            Tracked Changes Preference{" "}
            <span className="text-destructive">*</span>
          </FieldLegend>
          <RadioGroup
            value={watchedTrackedChanges}
            onValueChange={(value) =>
              setValue("trackedChanges", value, { shouldValidate: true })
            }
            aria-invalid={!!errors.trackedChanges}
            className="gap-3"
          >
            {[
              "Yes, both versions",
              "Just the edited file is fine",
              "Other",
            ].map((opt, index) => (
              <FieldLabel
                key={opt}
                htmlFor={`trackedChanges-${index}`}
                className={`w-full cursor-pointer border transition-colors ${
                  watchedTrackedChanges === opt
                    ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Field orientation="horizontal">
                  <RadioGroupItem id={`trackedChanges-${index}`} value={opt} />
                  <FieldContent>
                    <FieldTitle>{opt}</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          {watchedTrackedChanges === "Other" && (
            <Field data-invalid={!!errors.trackedChangesOther}>
              <FieldLabel htmlFor="trackedChangesOther">
                Specify Preference <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="trackedChangesOther"
                type="text"
                placeholder="Specify preference..."
                aria-invalid={!!errors.trackedChangesOther}
                {...register("trackedChangesOther")}
              />
              <FieldError errors={[errors.trackedChangesOther]} />
            </Field>
          )}
          <FieldError errors={[errors.trackedChanges]} />
        </FieldSet>

        <FieldSet data-invalid={!!errors.certificate}>
          <FieldLegend variant="label">
            Official Editing Certificate Required?{" "}
            <span className="text-destructive">*</span>
          </FieldLegend>
          <RadioGroup
            value={watchedCertificate}
            onValueChange={(value) =>
              setValue("certificate", value, { shouldValidate: true })
            }
            aria-invalid={!!errors.certificate}
            className="gap-3"
          >
            {["Yes", "No"].map((opt, index) => (
              <FieldLabel
                key={opt}
                htmlFor={`certificate-${index}`}
                className={`w-full cursor-pointer border transition-colors ${
                  watchedCertificate === opt
                    ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Field orientation="horizontal">
                  <RadioGroupItem id={`certificate-${index}`} value={opt} />
                  <FieldContent>
                    <FieldTitle>{opt}</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <FieldError errors={[errors.certificate]} />
        </FieldSet>
      </FieldGroup>

      <Field>
        <FieldLabel htmlFor="file-upload">
          Attach Document or Institutional Style Guide
        </FieldLabel>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            Select File
          </Button>
          <Input
            id="file-upload"
            type="file"
            accept=".docx,.doc,.pdf,.txt"
            className="hidden"
            {...register("file")}
            onChange={(e) => {
              register("file").onChange(e);
              const file =
                e.target.files && e.target.files.length > 0
                  ? e.target.files[0]
                  : null;
              onFileSelect(file);
            }}
          />
          <span className="max-w-xs truncate text-xs text-muted-foreground">
            {fileName || "No file selected"}
          </span>
        </div>
        <FieldDescription>
          Optional, max 10MB. Accepted formats: DOCX, DOC, PDF, TXT.
        </FieldDescription>
      </Field>
    </div>
  );
}
