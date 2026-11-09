"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
import { DOCUMENT_TYPES } from "@/lib/validations/contact";
import type { ContactFormValues } from "./types";

export function Step2DocumentVolume() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const watchedDocumentType = watch("documentType");
  const watchedWholeOrPart = watch("wholeOrPart");

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 2: Document Scope &amp; Page Count
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          Enter your document page count and reference list pages so we can
          calculate your quote based on our per-page rate card.
        </p>
      </div>

      <FieldSet data-invalid={!!errors.documentType}>
        <FieldLegend variant="label">
          Document Type <span className="text-destructive">*</span>
        </FieldLegend>
        <RadioGroup
          value={watchedDocumentType}
          onValueChange={(value) =>
            setValue("documentType", value, { shouldValidate: true })
          }
          aria-invalid={!!errors.documentType}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {DOCUMENT_TYPES.map((docType, index) => (
            <FieldLabel
              key={docType}
              htmlFor={`documentType-${index}`}
              className={`w-full cursor-pointer border transition-colors ${
                watchedDocumentType === docType
                  ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                  : "border-border hover:border-muted-foreground/40"
              }`}
            >
              <Field orientation="horizontal">
                <RadioGroupItem id={`documentType-${index}`} value={docType} />
                <FieldContent>
                  <FieldTitle>{docType}</FieldTitle>
                </FieldContent>
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        {watchedDocumentType === "Other" && (
          <Field data-invalid={!!errors.documentTypeOther}>
            <FieldLabel htmlFor="documentTypeOther">
              Specify Document Type <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="documentTypeOther"
              type="text"
              placeholder="Specify document type..."
              aria-invalid={!!errors.documentTypeOther}
              {...register("documentTypeOther")}
            />
            <FieldError errors={[errors.documentTypeOther]} />
          </Field>
        )}
        <FieldError errors={[errors.documentType]} />
      </FieldSet>

      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FieldSet data-invalid={!!errors.wholeOrPart}>
          <FieldLegend variant="label">
            Are you submitting the whole document or a part?{" "}
            <span className="text-destructive">*</span>
          </FieldLegend>
          <RadioGroup
            value={watchedWholeOrPart}
            onValueChange={(value) =>
              setValue("wholeOrPart", value as "whole" | "part", {
                shouldValidate: true,
              })
            }
            aria-invalid={!!errors.wholeOrPart}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {[
              { value: "whole", label: "Whole document" },
              { value: "part", label: "Part of document" },
            ].map((option) => (
              <FieldLabel
                key={option.value}
                htmlFor={`wholeOrPart-${option.value}`}
                className={`w-full cursor-pointer border transition-colors ${
                  watchedWholeOrPart === option.value
                    ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Field orientation="horizontal">
                  <RadioGroupItem
                    id={`wholeOrPart-${option.value}`}
                    value={option.value}
                  />
                  <FieldContent>
                    <FieldTitle>{option.label}</FieldTitle>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <FieldError errors={[errors.wholeOrPart]} />
        </FieldSet>

        {watchedWholeOrPart === "part" && (
          <Field data-invalid={!!errors.whichPart}>
            <FieldLabel htmlFor="whichPart">
              Which part? <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="whichPart"
              type="text"
              placeholder="e.g. Chapters 1 to 3, or Chapter 4 of 6"
              aria-invalid={!!errors.whichPart}
              {...register("whichPart")}
            />
            <FieldError errors={[errors.whichPart]} />
          </Field>
        )}
      </FieldGroup>

      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={!!errors.pageCount}>
          <FieldLabel htmlFor="pageCount">
            Page Count (excl. references){" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="pageCount"
            type="number"
            min={1}
            placeholder="e.g. 120"
            aria-invalid={!!errors.pageCount}
            {...register("pageCount")}
          />
          <FieldDescription>
            Total document pages excluding your reference list.
          </FieldDescription>
          <FieldError errors={[errors.pageCount]} />
        </Field>

        <Field data-invalid={!!errors.referencePageCount}>
          <FieldLabel htmlFor="referencePageCount">
            Reference List Pages (0–500){" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="referencePageCount"
            type="number"
            min={0}
            max={500}
            placeholder="0"
            aria-invalid={!!errors.referencePageCount}
            {...register("referencePageCount")}
          />
          <FieldDescription>
            Used when Reference List Editing is ticked.
          </FieldDescription>
          <FieldError errors={[errors.referencePageCount]} />
        </Field>
      </FieldGroup>
    </div>
  );
}
