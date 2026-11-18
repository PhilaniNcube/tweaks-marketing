import * as React from "react";
import { ContactFormData } from "@/lib/validations/contact";
import {
  CalculatedQuoteResult,
  deriveDocumentTypeFromServices,
  formatZarFromCents,
} from "@/lib/pricing/quote-calculator";
import { formatDegreeSummary } from "@/lib/utils";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Hr,
  Tailwind,
  Preview,
  Link,
} from "@react-email/components";

interface ContactNotificationEmailProps {
  data: ContactFormData;
  institutionName?: string;
  quoteNumber?: string;
  quoteSummary?: CalculatedQuoteResult;
  isDuplicateFlag?: boolean;
  quoteUrl?: string;
}

export function ContactNotificationEmail({
  data,
  institutionName,
  quoteNumber,
  quoteSummary,
  isDuplicateFlag,
  quoteUrl,
}: Readonly<ContactNotificationEmailProps>) {
  const fullName = `${data.firstName} ${data.surname}`.trim();
  const displayDocumentType =
    data.documentType || deriveDocumentTypeFromServices(data.services);
  const previewText = `${isDuplicateFlag ? "[POTENTIAL DUPLICATE] " : ""}New Brief: ${fullName} - ${displayDocumentType}`;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] max-w-[600px] bg-white shadow-sm">
            {/* Header Banner */}
            <Section className="bg-[#1B0ABD] rounded-t p-[30px] text-center">
              <Heading className="text-white text-[24px] font-bold m-0 tracking-tight">
                New Editing Brief Submitted
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                {quoteNumber
                  ? `CRM Quote #${quoteNumber} generated automatically`
                  : "Recorded in the Tweaks CRM"}
              </Text>
            </Section>

            {isDuplicateFlag && (
              <Section className="px-[20px] pt-[16px]">
                <Section className="bg-amber-50 border border-solid border-amber-300 p-[12px] rounded">
                  <Text className="text-[13px] text-amber-900 m-0 leading-[20px]">
                    <strong>Duplicate Submission Flagged:</strong> Another
                    brief with the same email ({data.email}) and document type (
                    {displayDocumentType}) was submitted within the last 24
                    hours.
                  </Text>
                </Section>
              </Section>
            )}

            {/* Submitter & Academic Details */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Client &amp; Academic Information
              </Heading>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Client Name:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {fullName}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Email:
                </Column>
                <Column className="py-[6px] align-top text-[14px]">
                  <Link
                    href={`mailto:${data.email}`}
                    className="text-[#1B0ABD] underline font-medium"
                  >
                    {data.email}
                  </Link>
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  WhatsApp:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {data.whatsapp}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Institution:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {institutionName ||
                    (data.institutionId && data.institutionId !== "None"
                      ? data.institutionId
                      : "Independent Researcher")}
                  {data.institutionId === "Other" && data.institutionOther && (
                    <span className="text-slate-500 italic">
                      {" "}
                      ({data.institutionOther})
                    </span>
                  )}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Degree &amp; Programme:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {formatDegreeSummary(
                    data.degreeLevel === "Other"
                      ? data.degreeLevelOther
                      : data.degreeLevel,
                    data.degreeProgramme
                  )}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Research Title:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {data.researchTitle}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Came From:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.referralSource}
                </Column>
              </Row>
            </Section>

            {/* Document & Scope Details */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Document &amp; Scope
              </Heading>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Document Type:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {displayDocumentType}
                  {data.documentTypeOther && (
                    <span className="text-slate-500 italic">
                      {" "}
                      ({data.documentTypeOther})
                    </span>
                  )}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Scope:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.wholeOrPart === "whole"
                    ? "Whole document"
                    : `Part: ${data.whichPart}`}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Page Count:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-semibold">
                  {data.pageCount} billable pages
                  {data.wordCount
                    ? ` (${data.wordCount.toLocaleString()} words)`
                    : ""}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Reference Pages:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.referencePageCount} pages
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Services:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {data.services.join(", ")}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Delivery Speed:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-semibold uppercase">
                  {data.deliverySpeed}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Referencing Style:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.referencingStyle === "Other"
                    ? data.referencingStyleOther
                    : data.referencingStyle}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Main Goal:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.mainGoal}
                </Column>
              </Row>

              {data.concerns && (
                <Row>
                  <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                    Concerns:
                  </Column>
                  <Column className="py-[6px] align-top text-[14px] text-slate-900">
                    {data.concerns}
                  </Column>
                </Row>
              )}
            </Section>

            {/* Logistics & Supervisor Sign-Off */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Dates, Sign-Off &amp; Funding
              </Heading>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Document Send Date:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.expectedSendDate}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Requested Return:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-[#FF2216] font-bold">
                  {data.requestedReturnDate}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Supervisor Sign-Off:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900">
                  {data.supervisorSignOff === "not_applicable"
                    ? "Not applicable (non-degree / independent)"
                    : data.supervisorSignOff === "yes"
                      ? "Yes (Declared by student)"
                      : data.requestSupervisorSignOff
                        ? `No (Request emailed to ${data.supervisorName} <${data.supervisorEmail}>)`
                        : "No (Disclaimer acknowledged)"}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[160px] align-top text-[14px] font-semibold text-slate-500">
                  Payment Option:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {data.paymentOption === "full_payment"
                    ? "Full payment"
                    : data.paymentOption === "payment_plan"
                      ? "Payment plan (50% deposit)"
                      : `Institutional funding (${data.department} — ${data.billingContactName} <${data.billingContactEmail}>)`}
                </Column>
              </Row>
            </Section>

            {/* Auto-Calculated Quote Summary */}
            {quoteSummary && (
              <Section className="px-[20px] pt-[24px]">
                <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                  Auto-Calculated Quote ({quoteNumber})
                </Heading>
                <Section className="bg-slate-50 p-[14px] rounded border border-solid border-slate-200">
                  <Text className="text-[14px] text-slate-800 m-0 mb-[6px]">
                    <strong>Total Fee:</strong>{" "}
                    {formatZarFromCents(quoteSummary.totalFeeCents)}
                  </Text>
                  <Text className="text-[14px] text-slate-800 m-0 mb-[6px]">
                    <strong>Deposit Required:</strong>{" "}
                    {formatZarFromCents(quoteSummary.depositRequiredCents)} (
                    {quoteSummary.depositPercentage}%)
                  </Text>
                  {quoteSummary.paymentOption === "payment_plan" && (
                    <Text className="text-[14px] text-slate-800 m-0 mb-[6px]">
                      <strong>Payment Plan Eligibility:</strong> Up to{" "}
                      {quoteSummary.maxInstalmentMonths} months (selected:{" "}
                      {quoteSummary.selectedInstalmentMonths} months)
                    </Text>
                  )}
                  {quoteUrl && (
                    <Text className="text-[14px] m-0 mt-[10px]">
                      <Link
                        href={quoteUrl}
                        className="text-[#1B0ABD] font-bold underline"
                      >
                        Open Interactive Quote Page &rarr;
                      </Link>
                    </Text>
                  )}
                </Section>
              </Section>
            )}

            <Hr className="border-slate-200 my-[30px]" />

            <Section className="text-center px-[20px]">
              <Text className="text-[12px] text-slate-400 m-0">
                This is an automated CRM notification from tweaks.co.za
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ContactNotificationEmail;
