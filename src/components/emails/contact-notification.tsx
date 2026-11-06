import * as React from "react";
import { ContactFormData } from "@/lib/validations/contact";
import { CalculatedQuoteResult, formatZarFromCents } from "@/lib/pricing/quote-calculator";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
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
  const previewText = `${isDuplicateFlag ? "[POTENTIAL DUPLICATE] " : ""}New Brief: ${fullName} - ${data.documentType}`;

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
                <div className="bg-amber-50 border border-solid border-amber-300 p-[12px] text-[13px] text-amber-900 rounded">
                  <strong>Duplicate Submission Flagged:</strong> Another brief
                  with the same email ({data.email}) and document type (
                  {data.documentType}) was submitted within the last 24 hours.
                </div>
              </Section>
            )}

            {/* Submitter & Academic Details */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Client & Academic Information
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[160px] text-slate-500">
                      Client Name:
                    </td>
                    <td className="py-[6px] text-slate-900 font-medium">
                      {fullName}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Email:
                    </td>
                    <td className="py-[6px]">
                      <a
                        href={`mailto:${data.email}`}
                        className="text-[#1B0ABD] underline font-medium"
                      >
                        {data.email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      WhatsApp:
                    </td>
                    <td className="py-[6px] text-slate-900 font-medium">
                      {data.whatsapp}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Institution:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {institutionName || data.institutionId}
                      {data.institutionOther && (
                        <span className="text-slate-500 italic">
                          {" "}
                          ({data.institutionOther})
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Degree & Programme:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.degreeLevel === "Other"
                        ? data.degreeLevelOther
                        : data.degreeLevel}{" "}
                      — {data.degreeProgramme}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Research Title:
                    </td>
                    <td className="py-[6px] text-slate-900 font-medium">
                      {data.researchTitle}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Came From:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.referralSource}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Document & Scope Details */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Document & Scope
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[160px] text-slate-500">
                      Document Type:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.documentType}
                      {data.documentTypeOther && (
                        <span className="text-slate-500 italic">
                          {" "}
                          ({data.documentTypeOther})
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Scope:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.wholeOrPart === "whole"
                        ? "Whole document"
                        : `Part: ${data.whichPart}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Word / Page Count:
                    </td>
                    <td className="py-[6px] text-slate-900 font-semibold">
                      {data.wordCount.toLocaleString()} words ({data.pageCount}{" "}
                      billable pages)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Reference Pages:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.referencePageCount} pages
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Services:
                    </td>
                    <td className="py-[6px] text-slate-900 font-medium">
                      {data.services.join(", ")}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Delivery Speed:
                    </td>
                    <td className="py-[6px] text-slate-900 font-semibold uppercase">
                      {data.deliverySpeed}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Referencing Style:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.referencingStyle === "Other"
                        ? data.referencingStyleOther
                        : data.referencingStyle}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Main Goal:
                    </td>
                    <td className="py-[6px] text-slate-900">{data.mainGoal}</td>
                  </tr>
                  {data.concerns && (
                    <tr>
                      <td className="py-[6px] font-semibold text-slate-500">
                        Concerns:
                      </td>
                      <td className="py-[6px] text-slate-900">
                        {data.concerns}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            {/* Logistics & Supervisor Sign-Off */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Dates, Sign-Off & Funding
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[160px] text-slate-500">
                      Document Send Date:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.expectedSendDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Requested Return:
                    </td>
                    <td className="py-[6px] text-[#FF2216] font-bold">
                      {data.requestedReturnDate}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Supervisor Sign-Off:
                    </td>
                    <td className="py-[6px] text-slate-900">
                      {data.supervisorSignOff === "yes"
                        ? "Yes (Declared by student)"
                        : data.requestSupervisorSignOff
                          ? `No (Request emailed to ${data.supervisorName} <${data.supervisorEmail}>)`
                          : "No (Disclaimer acknowledged)"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">
                      Payment Option:
                    </td>
                    <td className="py-[6px] text-slate-900 font-medium">
                      {data.paymentOption === "full_payment"
                        ? "Full payment"
                        : data.paymentOption === "payment_plan"
                          ? "Payment plan (50% deposit)"
                          : `Institutional funding (${data.department} — ${data.billingContactName} <${data.billingContactEmail}>)`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Auto-Calculated Quote Summary */}
            {quoteSummary && (
              <Section className="px-[20px] pt-[24px]">
                <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                  Auto-Calculated Quote ({quoteNumber})
                </Heading>
                <div className="bg-slate-50 p-[14px] rounded border border-solid border-slate-200 text-[14px]">
                  <p className="m-0 mb-[6px]">
                    <strong>Total Fee:</strong>{" "}
                    {formatZarFromCents(quoteSummary.totalFeeCents)}
                  </p>
                  <p className="m-0 mb-[6px]">
                    <strong>Deposit Required:</strong>{" "}
                    {formatZarFromCents(quoteSummary.depositRequiredCents)} (
                    {quoteSummary.depositPercentage}%)
                  </p>
                  {quoteSummary.paymentOption === "payment_plan" && (
                    <p className="m-0 mb-[6px]">
                      <strong>Payment Plan Eligibility:</strong> Up to{" "}
                      {quoteSummary.maxInstalmentMonths} months (selected:{" "}
                      {quoteSummary.selectedInstalmentMonths} months)
                    </p>
                  )}
                  {quoteUrl && (
                    <p className="m-0 mt-[10px]">
                      <Link
                        href={quoteUrl}
                        className="text-[#1B0ABD] font-bold underline"
                      >
                        Open Interactive Quote Page &rarr;
                      </Link>
                    </p>
                  )}
                </div>
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
