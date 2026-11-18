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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  REFERRAL_SOURCES,
  isNonDegreeEligibleServiceSelection,
} from "@/lib/validations/contact";
import type { Service } from "@/db/schema";
import type {
  ContactFormValues,
  LookupInstitution,
  LookupDegreeLevel,
} from "./types";

interface Step1ClientDetailsProps {
  institutions: LookupInstitution[];
  degreeLevels: LookupDegreeLevel[];
  catalog: Service[];
}

export function Step1ClientDetails({
  institutions,
  degreeLevels,
  catalog,
}: Step1ClientDetailsProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ContactFormValues>();

  const watchedServices = watch("services") || [];
  const watchedIsUniversityEnrolled = watch("isUniversityEnrolled");
  const watchedInstitutionId = watch("institutionId");
  const watchedDegreeLevel = watch("degreeLevel");
  const watchedDegreeProgramme = watch("degreeProgramme");
  const watchedSupervisorSignOff = watch("supervisorSignOff");
  const watchedPaymentOption = watch("paymentOption");

  const isJournalOrProposal = isNonDegreeEligibleServiceSelection(
    watchedServices,
    catalog
  );
  const isEnrolled =
    !isJournalOrProposal || watchedIsUniversityEnrolled !== false;

  const handleEnrollmentChange = (enrolled: boolean) => {
    setValue("isUniversityEnrolled", enrolled, { shouldValidate: true });
    if (!enrolled) {
      if (!watchedInstitutionId) {
        setValue("institutionId", "None", { shouldValidate: true });
      }
      setValue("degreeLevel", "N/A", { shouldValidate: true });
      setValue("degreeLevelOther", "");
      setValue("degreeProgramme", "N/A", { shouldValidate: true });
      setValue("supervisorSignOff", "not_applicable");
      setValue("supervisorDisclaimerAck", false);
      setValue("requestSupervisorSignOff", false);
      if (
        watchedPaymentOption === "institutional_funding" &&
        (!watchedInstitutionId || watchedInstitutionId === "None")
      ) {
        setValue("paymentOption", "full_payment");
      }
    } else {
      if (watchedInstitutionId === "None") {
        setValue("institutionId", "", { shouldValidate: true });
      }
      if (watchedDegreeLevel === "N/A") {
        setValue("degreeLevel", "", { shouldValidate: true });
      }
      if (watchedDegreeProgramme === "N/A") {
        setValue("degreeProgramme", "", { shouldValidate: true });
      }
      if (watchedSupervisorSignOff === "not_applicable") {
        setValue("supervisorSignOff", "yes");
      }
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-200">
      <div className="border-b border-border pb-2">
        <h3 className="text-lg font-bold text-foreground">
          Step 3: Your Details &amp; Academic Context
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

        {isJournalOrProposal && (
          <FieldSet className="md:col-span-2">
            <FieldLegend variant="label">
              Are you currently enrolled in a university degree programme for
              this work? <span className="text-destructive">*</span>
            </FieldLegend>
            <RadioGroup
              value={isEnrolled ? "yes" : "no"}
              onValueChange={(value) => handleEnrollmentChange(value === "yes")}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              {[
                {
                  value: "yes",
                  title: "Yes, I am enrolled at a university",
                  description:
                    "Submitted toward a degree (Honours, Master's, or PhD).",
                },
                {
                  value: "no",
                  title: "No — Independent / Non-degree",
                  description:
                    "Independent researcher, faculty/staff, or external organisation.",
                },
              ].map((option) => {
                const selected = (isEnrolled ? "yes" : "no") === option.value;
                return (
                  <FieldLabel
                    key={option.value}
                    htmlFor={`isUniversityEnrolled-${option.value}`}
                    className={`w-full cursor-pointer border transition-colors ${
                      selected
                        ? "border-tweaks-blue bg-blue-50/40 dark:bg-blue-950/20"
                        : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <Field orientation="horizontal" className="items-start">
                      <RadioGroupItem
                        id={`isUniversityEnrolled-${option.value}`}
                        value={option.value}
                        className="mt-0.5"
                      />
                      <FieldContent>
                        <FieldTitle>{option.title}</FieldTitle>
                        <FieldDescription>{option.description}</FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                );
              })}
            </RadioGroup>
          </FieldSet>
        )}

        <Field data-invalid={!!errors.institutionId}>
          <FieldLabel htmlFor="institutionId">
            {isEnrolled ? (
              <>
                Institution <span className="text-destructive">*</span>
              </>
            ) : (
              "Affiliation / Organisation / Institution (Optional)"
            )}
          </FieldLabel>
          <NativeSelect
            id="institutionId"
            aria-invalid={!!errors.institutionId}
            className="w-full"
            {...register("institutionId", {
              onChange: (e) => {
                const nextVal = e.target.value;
                if (
                  !isEnrolled &&
                  (!nextVal || nextVal === "None") &&
                  watchedPaymentOption === "institutional_funding"
                ) {
                  setValue("paymentOption", "full_payment");
                }
              },
            })}
          >
            {isEnrolled ? (
              <NativeSelectOption value="">
                Select your institution...
              </NativeSelectOption>
            ) : (
              <NativeSelectOption value="None">
                None / Independent Researcher
              </NativeSelectOption>
            )}
            {institutions.map((inst) => (
              <NativeSelectOption key={inst.id} value={inst.id}>
                {inst.name}
              </NativeSelectOption>
            ))}
            <NativeSelectOption value="Other">
              {isEnrolled
                ? "Other (not listed)"
                : "Other Organisation / Research Institute / University"}
            </NativeSelectOption>
          </NativeSelect>
          <FieldError errors={[errors.institutionId]} />
        </Field>

        {watchedInstitutionId === "Other" && (
          <Field data-invalid={!!errors.institutionOther}>
            <FieldLabel htmlFor="institutionOther">
              {isEnrolled
                ? "Institution Name (if Other)"
                : "Organisation / Institution Name"}{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="institutionOther"
              type="text"
              placeholder={
                isEnrolled
                  ? "Enter your university or college name"
                  : "Enter your organisation, research institute, or university name"
              }
              aria-invalid={!!errors.institutionOther}
              {...register("institutionOther")}
            />
            <FieldError errors={[errors.institutionOther]} />
          </Field>
        )}

        {isEnrolled && (
          <>
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
                placeholder="e.g. Chemistry, Educational Psychology, Sociology"
                aria-invalid={!!errors.degreeProgramme}
                {...register("degreeProgramme")}
              />
              <FieldDescription>
                Type the full programme name exactly as it should appear on your
                completion certificate (e.g.{" "}
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
          </>
        )}

        <Field className="md:col-span-2" data-invalid={!!errors.researchTitle}>
          <FieldLabel htmlFor="researchTitle">
            {isEnrolled ? "Research Title" : "Manuscript / Proposal Title"}{" "}
            <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            id="researchTitle"
            type="text"
            placeholder={
              isEnrolled
                ? "Enter your exact research title as it should appear on your completion certificate"
                : "Enter the title of your journal article or proposal"
            }
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
