import * as React from "react";
import { ContactFormData } from "@/lib/validations/contact";
import {
  CalculatedQuoteResult,
  deriveDocumentTypeFromServices,
  formatZarFromCents,
} from "@/lib/pricing/quote-calculator";
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
  Button,
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
  const displayDocumentType =
    data.documentType || deriveDocumentTypeFromServices(data.services);
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
              <Section className="bg-slate-50 rounded-lg p-[16px] border border-solid border-slate-100">
                <Heading className="text-slate-900 text-[14px] font-semibold m-0 uppercase tracking-wider mb-[12px]">
                  Brief &amp; Quote Summary
                </Heading>

                {quoteNumber && (
                  <Row>
                    <Column className="py-[4px] w-[170px] align-top font-medium text-[14px] text-slate-500">
                      Quote Reference:
                    </Column>
                    <Column className="py-[4px] align-top text-[14px] text-slate-900 text-right font-bold">
                      {quoteNumber}
                    </Column>
                  </Row>
                )}

                <Row>
                  <Column className="py-[4px] w-[170px] align-top font-medium text-[14px] text-slate-500">
                    Document Type:
                  </Column>
                  <Column className="py-[4px] align-top text-[14px] text-slate-900 text-right font-medium">
                    {displayDocumentType} (
                    {data.wholeOrPart === "whole"
                      ? "Whole document"
                      : data.whichPart}
                    )
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[170px] align-top font-medium text-[14px] text-slate-500">
                    Volume:
                  </Column>
                  <Column className="py-[4px] align-top text-[14px] text-slate-900 text-right font-semibold">
                    {data.pageCount} pages
                    {data.referencePageCount > 0
                      ? ` (+ ${data.referencePageCount} reference pages)`
                      : ""}
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[170px] align-top font-medium text-[14px] text-slate-500">
                    Services Requested:
                  </Column>
                  <Column className="py-[4px] align-top text-[14px] text-slate-900 text-right font-medium">
                    {data.services.join(", ")} ({data.deliverySpeed})
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[170px] align-top font-medium text-[14px] text-slate-500">
                    Requested Return Date:
                  </Column>
                  <Column className="py-[4px] align-top text-[14px] text-[#FF2216] text-right font-bold">
                    {data.requestedReturnDate}
                  </Column>
                </Row>

                {quoteSummary && (
                  <Row>
                    <Column className="py-[6px] w-[170px] align-top text-[14px] font-semibold text-slate-700 border-t border-solid border-slate-200">
                      Estimated Total (ZAR):
                    </Column>
                    <Column className="py-[6px] align-top text-[14px] text-[#1B0ABD] text-right font-bold border-t border-solid border-slate-200">
                      {formatZarFromCents(quoteSummary.totalFeeCents)}
                    </Column>
                  </Row>
                )}

                {quoteUrl && (
                  <Section className="mt-[16px] text-center">
                    <Button
                      href={quoteUrl}
                      className="bg-[#1B0ABD] text-white px-[20px] py-[10px] rounded text-[14px] font-bold no-underline inline-block"
                    >
                      View Your Quote &amp; Project Status
                    </Button>
                  </Section>
                )}
              </Section>
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
