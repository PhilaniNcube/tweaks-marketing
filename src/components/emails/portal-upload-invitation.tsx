import * as React from "react";
import { formatZarFromCents } from "@/lib/pricing/quote-calculator";
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

export interface PortalUploadInvitationEmailProps {
  clientFirstName: string;
  clientFullName: string;
  clientEmail: string;
  researchTitle: string;
  quoteNumber: string;
  expectedSendDate?: string;
  requestedReturnDate?: string;
  uploadedFileName?: string | null;
  trigger: "payment_recorded" | "institutional_accepted";
  paymentAmountCents?: number;
  receiptNumber?: string;
  paidToDateCents: number;
  balanceCents: number;
  poNumber?: string | null;
  hasPortalAccount: boolean;
  portalLoginUrl: string;
  quoteUrl: string;
}

export function PortalUploadInvitationEmail({
  clientFirstName,
  clientFullName,
  clientEmail,
  researchTitle,
  quoteNumber,
  expectedSendDate,
  requestedReturnDate,
  uploadedFileName,
  trigger,
  paymentAmountCents,
  receiptNumber,
  paidToDateCents,
  balanceCents,
  poNumber,
  hasPortalAccount,
  portalLoginUrl,
  quoteUrl,
}: Readonly<PortalUploadInvitationEmailProps>) {
  const isPaymentTrigger = trigger === "payment_recorded";
  const bannerTitle = isPaymentTrigger
    ? "Payment Received — Upload Your Manuscript"
    : "Institutional Quote Accepted — Upload Your Manuscript";
  const previewText = isPaymentTrigger
    ? `Payment confirmed for ${quoteNumber}. Upload your document in the Tweaks Client Portal.`
    : `Your institutional quote ${quoteNumber} is accepted. Upload your document in the Tweaks Client Portal.`;

  const ctaLabel = hasPortalAccount
    ? "Sign In & Upload Your Document"
    : "Create Client Account & Upload Your Document";

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
                {bannerTitle}
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                Quote Reference: <strong>{quoteNumber}</strong>
              </Text>
            </Section>

            {/* Greeting */}
            <Section className="px-[25px] pt-[30px]">
              <Text className="text-slate-800 text-[15px] leading-[24px] m-0">
                Dear {clientFullName || clientFirstName},
              </Text>
              <Text className="text-slate-700 text-[15px] leading-[24px] mt-[14px] mb-0">
                {isPaymentTrigger ? (
                  <>
                    Thank you! We have recorded your payment for{" "}
                    <strong>{researchTitle}</strong> (
                    <strong>{quoteNumber}</strong>).
                  </>
                ) : (
                  <>
                    Thank you! Your institutional funding quote for{" "}
                    <strong>{researchTitle}</strong> (
                    <strong>{quoteNumber}</strong>) has been confirmed and your
                    booking is active.
                  </>
                )}
              </Text>
            </Section>

            {/* Confirmation Summary Box */}
            <Section className="px-[25px] pt-[20px]">
              <Section className="bg-slate-50 rounded-lg p-[16px] border border-solid border-slate-100">
                <Heading className="text-slate-900 text-[13px] font-semibold m-0 uppercase tracking-wider mb-[12px]">
                  Project &amp; {isPaymentTrigger ? "Payment" : "Booking"}{" "}
                  Summary
                </Heading>

                <Row>
                  <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                    Quote Reference:
                  </Column>
                  <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-bold">
                    {quoteNumber}
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                    Research Title:
                  </Column>
                  <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-medium">
                    {researchTitle}
                  </Column>
                </Row>

                {expectedSendDate && (
                  <Row>
                    <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                      Expected Send Date:
                    </Column>
                    <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-medium">
                      {expectedSendDate}
                    </Column>
                  </Row>
                )}

                {requestedReturnDate && (
                  <Row>
                    <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                      Agreed Return Date:
                    </Column>
                    <Column className="py-[4px] align-top text-[13px] text-[#FF2216] text-right font-bold">
                      {requestedReturnDate}
                    </Column>
                  </Row>
                )}

                {isPaymentTrigger ? (
                  <>
                    {typeof paymentAmountCents === "number" && (
                      <Row>
                        <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                          Payment Recorded:
                        </Column>
                        <Column className="py-[4px] align-top text-[13px] text-emerald-700 text-right font-bold">
                          {formatZarFromCents(paymentAmountCents)}
                        </Column>
                      </Row>
                    )}

                    {receiptNumber && (
                      <Row>
                        <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                          Receipt Number:
                        </Column>
                        <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-semibold">
                          {receiptNumber}
                        </Column>
                      </Row>
                    )}

                    <Row>
                      <Column className="py-[4px] w-[170px] align-top font-medium text-[13px] text-slate-500">
                        Paid to Date:
                      </Column>
                      <Column className="py-[4px] align-top text-[13px] text-emerald-700 text-right font-semibold">
                        {formatZarFromCents(paidToDateCents)}
                      </Column>
                    </Row>

                    <Row>
                      <Column className="py-[6px] w-[170px] align-top text-[13px] font-semibold text-slate-700 border-t border-solid border-slate-200">
                        Balance Remaining:
                      </Column>
                      <Column className="py-[6px] align-top text-[13px] text-[#1B0ABD] text-right font-bold border-t border-solid border-slate-200">
                        {formatZarFromCents(balanceCents)}
                      </Column>
                    </Row>
                  </>
                ) : (
                  <Row>
                    <Column className="py-[6px] w-[170px] align-top text-[13px] font-semibold text-slate-700 border-t border-solid border-slate-200">
                      Payment Method:
                    </Column>
                    <Column className="py-[6px] align-top text-[13px] text-[#1B0ABD] text-right font-bold border-t border-solid border-slate-200">
                      Institutional Funding / Purchase Order
                      {poNumber ? ` (PO: ${poNumber})` : " (Awaiting PO)"}
                    </Column>
                  </Row>
                )}
              </Section>
            </Section>

            {/* Primary CTA: Upload Manuscript in Client Portal */}
            <Section className="px-[25px] pt-[24px]">
              <Section className="bg-blue-50 rounded-lg p-[20px] border border-solid border-blue-200">
                <Heading className="text-[#1B0ABD] text-[15px] font-bold m-0">
                  {uploadedFileName
                    ? "Review or Update Your Manuscript in the Client Portal"
                    : "Next Step: Upload Your Document for Editing"}
                </Heading>
                <Text className="text-slate-700 text-[14px] leading-[22px] mt-[10px] mb-0">
                  {uploadedFileName ? (
                    <>
                      We currently have <strong>{uploadedFileName}</strong> on
                      file for this project. You can review your project status
                      or upload a newer version at any time in your Client
                      Portal.
                    </>
                  ) : (
                    <>
                      Please upload the document you want edited in the Tweaks
                      Client Portal so our editorial team can begin work.
                    </>
                  )}
                </Text>
                <Text className="text-slate-600 text-[13px] leading-[20px] mt-[10px] mb-0">
                  {hasPortalAccount ? (
                    <>
                      Sign in using your quote email address (
                      <strong className="text-slate-900">{clientEmail}</strong>
                      ) to access your project dashboard.
                    </>
                  ) : (
                    <>
                      Create your free client account using the exact email
                      address from your quote request (
                      <strong className="text-slate-900">{clientEmail}</strong>
                      ) to unlock your private project dashboard.
                    </>
                  )}
                </Text>

                <Section className="mt-[18px] text-center">
                  <Button
                    href={portalLoginUrl}
                    className="bg-[#1B0ABD] text-white px-[22px] py-[12px] rounded text-[14px] font-bold no-underline inline-block"
                  >
                    {ctaLabel}
                  </Button>
                </Section>

                <Text className="text-slate-500 text-[12px] text-center mt-[12px] mb-0">
                  Or copy and paste this link into your browser:{" "}
                  <Link
                    href={portalLoginUrl}
                    className="text-[#1B0ABD] underline break-all"
                  >
                    {portalLoginUrl}
                  </Link>
                </Text>
              </Section>
            </Section>

            <Section className="px-[25px] pt-[16px] text-center">
              <Link
                href={quoteUrl}
                className="text-[13px] font-semibold text-[#1B0ABD] underline"
              >
                View Your Quote, Invoice &amp; Receipt
              </Link>
            </Section>

            <Hr className="border-slate-200 my-[28px]" />

            {/* Footer / Signature */}
            <Section className="px-[25px]">
              <Text className="text-slate-600 text-[13px] leading-[20px] m-0">
                If you have any questions or need assistance, reply directly to
                this email or contact us at{" "}
                <Link
                  href="mailto:hello@tweaks.co.za"
                  className="text-[#1B0ABD] underline"
                >
                  hello@tweaks.co.za
                </Link>
                .
              </Text>
              <Text className="text-slate-800 text-[14px] mt-[20px] mb-0 font-medium">
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

export default PortalUploadInvitationEmail;
