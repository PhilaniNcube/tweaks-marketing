"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { REFERRAL_SOURCES } from "@/lib/validations/contact";
import type {
  ContactFormValues,
  LookupInstitution,
  LookupDegreeLevel,
  LookupProgramme,
} from "./types";

interface Step1ClientDetailsProps {
  institutions: LookupInstitution[];
  degreeLevels: LookupDegreeLevel[];
  degreeProgrammes: LookupProgramme[];
}

export function Step1ClientDetails({
  institutions,
  degreeLevels,
  degreeProgrammes,
}: Step1ClientDetailsProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const watchedInstitutionId = watch("institutionId");
  const watchedDegreeLevel = watch("degreeLevel");

  const orderedProgrammeSuggestions = useMemo(() => {
    const seen = new Set<string>();
    const instMatched: string[] = [];
    const others: string[] = [];

    for (const p of degreeProgrammes) {
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
  }, [degreeProgrammes, watchedInstitutionId]);

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 1: Your Details &amp; Academic Context
        </h3>
        <p className="text-xs font-light text-muted-foreground">
          These details are used for your quotation and completion certificate.
        </p>
      </div>

      <FieldGroup className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field data-invalid={!!errors.firstName}>
          <FieldLabel htmlFor="firstName">
            First Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="firstName"
            type="text"
            placeholder="Thabo"
            aria-invalid={!!errors.firstName}
            {...register("firstName")}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>

        <Field data-invalid={!!errors.surname}>
          <FieldLabel htmlFor="surname">
            Surname <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="surname"
            type="text"
            placeholder="Mokoena"
            aria-invalid={!!errors.surname}
            {...register("surname")}
          />
          <FieldError errors={[errors.surname]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">
            Email Address <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="student@university.ac.za"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.whatsapp}>
          <FieldLabel htmlFor="whatsapp">
            WhatsApp Number (with country code){" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="+27 82 123 4567"
            aria-invalid={!!errors.whatsapp}
            {...register("whatsapp")}
          />
          <FieldError errors={[errors.whatsapp]} />
        </Field>

        <Field data-invalid={!!errors.institutionId}>
          <FieldLabel htmlFor="institutionId">
            Institution <span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            id="institutionId"
            aria-invalid={!!errors.institutionId}
            className="w-full"
            {...register("institutionId")}
          >
            <NativeSelectOption value="">
              Select your institution...
            </NativeSelectOption>
            {institutions.map((inst) => (
              <NativeSelectOption key={inst.id} value={inst.id}>
                {inst.name}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value="Other">
              Other (not listed)
            </NativeSelectOption>
          </NativeSelect>
          <FieldError errors={[errors.institutionId]} />
        </Field>

        {watchedInstitutionId === "Other" && (
          <Field data-invalid={!!errors.institutionOther}>
            <FieldLabel htmlFor="institutionOther">
              Institution Name (if Other){" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="institutionOther"
              type="text"
              placeholder="Enter your university or college name"
              aria-invalid={!!errors.institutionOther}
              {...register("institutionOther")}
            />
            <FieldError errors={[errors.institutionOther]} />
          </Field>
        )}

        <Field data-invalid={!!errors.degreeLevel}>
          <FieldLabel htmlFor="degreeLevel">
            Degree Level (Designator){" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            id="degreeLevel"
            aria-invalid={!!errors.degreeLevel}
            className="w-full"
            {...register("degreeLevel")}
          >
            <NativeSelectOption value="">
              Select designator (e.g. MSc, MCom, PhD)...
            </NativeSelectOption>
            {degreeLevels.map((deg) => (
              <NativeSelectOption key={deg.id} value={deg.designator}>
                {deg.designator}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value="Other">Other</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={[errors.degreeLevel]} />
        </Field>

        {watchedDegreeLevel === "Other" && (
          <Field data-invalid={!!errors.degreeLevelOther}>
            <FieldLabel htmlFor="degreeLevelOther">
              Specify Degree Designator{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="degreeLevelOther"
              type="text"
              placeholder="e.g. MComm, Dsc"
              aria-invalid={!!errors.degreeLevelOther}
              {...register("degreeLevelOther")}
            />
            <FieldError errors={[errors.degreeLevelOther]} />
          </Field>
        )}

        <Field
          className="md:col-span-2"
          data-invalid={!!errors.degreeProgramme}
        >
          <FieldLabel htmlFor="degreeProgramme">
            Degree Programme <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="degreeProgramme"
            type="text"
            list="degree-programme-suggestions"
            placeholder="e.g. Chemistry, Educational Psychology, Sociology"
            aria-invalid={!!errors.degreeProgramme}
            {...register("degreeProgramme")}
          />
          <datalist id="degree-programme-suggestions">
            {orderedProgrammeSuggestions.map((prog) => (
              <option key={prog} value={prog} />
            ))}
          </datalist>
          <FieldDescription>
            Appears alongside your degree designator on your completion
            certificate (e.g.{" "}
            <em>
              {watchedDegreeLevel && watchedDegreeLevel !== "Other"
                ? watchedDegreeLevel
                : "MSc"}{" "}
              Chemistry
            </em>
            ).
          </FieldDescription>
          <FieldError errors={[errors.degreeProgramme]} />
        </Field>

        <Field className="md:col-span-2" data-invalid={!!errors.researchTitle}>
          <FieldLabel htmlFor="researchTitle">
            Research Title <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="researchTitle"
            type="text"
            placeholder="Enter your exact research title as it should appear on your completion certificate"
            aria-invalid={!!errors.researchTitle}
            {...register("researchTitle")}
          />
          <FieldError errors={[errors.researchTitle]} />
        </Field>

        <Field className="md:col-span-2" data-invalid={!!errors.referralSource}>
          <FieldLabel htmlFor="referralSource">
            How did you hear about us?{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <NativeSelect
            id="referralSource"
            aria-invalid={!!errors.referralSource}
            className="w-full"
            {...register("referralSource")}
          >
            <NativeSelectOption value="">Please select...</NativeSelectOption>
            {REFERRAL_SOURCES.map((src) => (
              <NativeSelectOption key={src} value={src}>
                {src}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={[errors.referralSource]} />
        </Field>
      </FieldGroup>
    </div>
  );
}
