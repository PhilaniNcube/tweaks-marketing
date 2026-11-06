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

interface ContactConfirmationEmailProps {
  data: ContactFormData;
  quoteNumber?: string;
  quoteSummary?: CalculatedQuoteResult;
  quoteUrl?: string;
}

export function ContactConfirmationEmail({
  data,
  quoteNumber,
  quoteSummary,
  quoteUrl,
}: Readonly<ContactConfirmationEmailProps>) {
  const fullName = `${data.firstName} ${data.surname}`.trim();
  const previewText = `We have received your editing brief, ${data.firstName}!`;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] max-w-[600px] bg-white shadow-sm">
            {/* Header Banner */}
            <Section className="bg-[#1B0ABD] rounded-t p-[30px] text-center">
              <Heading className="text-white text-[22px] font-bold m-0 tracking-tight">
                Thank you for your submission, {data.firstName}!
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                We have successfully received your editing brief
                {quoteNumber ? ` (Reference: ${quoteNumber})` : ""}.
              </Text>
            </Section>

            {/* Welcome message */}
            <Section className="px-[25px] pt-[30px]">
              <Text className="text-slate-700 text-[15px] leading-[24px] m-0">
                Dear {fullName}, our editorial team has logged your project
                details for <strong>{data.researchTitle}</strong>.
              </Text>
              <Text className="text-slate-700 text-[15px] leading-[24px] mt-[16px] mb-0">
                We will communicate with you at{" "}
                <strong className="text-slate-900">{data.email}</strong> and via
                WhatsApp at{" "}
                <strong className="text-slate-900">{data.whatsapp}</strong>.
              </Text>
            </Section>

            {/* Brief Summary Box */}
            <Section className="px-[25px] pt-[25px]">
              <div className="bg-slate-50 rounded-lg p-[16px] border border-solid border-slate-100">
                <Heading className="text-slate-900 text-[14px] font-semibold m-0 uppercase tracking-wider mb-[12px]">
                  Brief & Quote Summary
                </Heading>
                <table className="w-full text-[14px] text-slate-600">
                  <tbody>
                    {quoteNumber && (
                      <tr>
                        <td className="py-[4px] font-medium text-slate-500">
                          Quote Reference:
                        </td>
                        <td className="py-[4px] text-slate-900 text-right font-bold">
                          {quoteNumber}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">
                        Document Type:
                      </td>
                      <td className="py-[4px] text-slate-900 text-right font-medium">
                        {data.documentType} (
                        {data.wholeOrPart === "whole"
                          ? "Whole document"
                          : data.whichPart}
                        )
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">
                        Volume:
                      </td>
                      <td className="py-[4px] text-slate-900 text-right font-semibold">
                        {data.wordCount.toLocaleString()} words ({data.pageCount}{" "}
                        pages)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">
                        Services Requested:
                      </td>
                      <td className="py-[4px] text-slate-900 text-right font-medium">
                        {data.services.join(", ")} ({data.deliverySpeed})
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">
                        Requested Return Date:
                      </td>
                      <td className="py-[4px] text-[#FF2216] text-right font-bold">
                        {data.requestedReturnDate}
                      </td>
                    </tr>
                    {quoteSummary && (
                      <tr>
                        <td className="py-[6px] font-semibold text-slate-700 border-t border-solid border-slate-200">
                          Estimated Total (ZAR):
                        </td>
                        <td className="py-[6px] text-[#1B0ABD] text-right font-bold border-t border-solid border-slate-200">
                          {formatZarFromCents(quoteSummary.totalFeeCents)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {quoteUrl && (
                  <div className="mt-[16px] text-center">
                    <Link
                      href={quoteUrl}
                      className="bg-[#1B0ABD] text-white px-[20px] py-[10px] text-[14px] font-bold no-underline inline-block"
                    >
                      View Your Quote & Project Status
                    </Link>
                  </div>
                )}
              </div>
            </Section>

            <Hr className="border-slate-200 my-[30px]" />

            {/* Signature Area */}
            <Section className="px-[25px]">
              <Text className="text-slate-600 text-[14px] leading-[22px] m-0">
                If you have any questions or need to send additional files,
                reply directly to this email or reach us at{" "}
                <Link
                  href="mailto:hello@tweaks.co.za"
                  className="text-[#1B0ABD] underline"
                >
                  hello@tweaks.co.za
                </Link>
                .
              </Text>

              <Text className="text-slate-800 text-[14px] mt-[24px] mb-0 font-medium">
                Best regards,
              </Text>
              <Text className="text-[#1B0ABD] text-[15px] font-bold mt-[4px] mb-0">
                The Tweaks Team
              </Text>
              <Link
                href="https://www.tweaks.co.za"
                className="text-[12px] text-slate-400 mt-[6px] inline-block underline"
              >
                tweaks.co.za
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default ContactConfirmationEmail;
