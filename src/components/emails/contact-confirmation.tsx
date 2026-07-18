import * as React from 'react';
import { ContactFormData } from '@/lib/validations/contact';
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
} from '@react-email/components';

interface ContactConfirmationEmailProps {
  data: ContactFormData;
}

export function ContactConfirmationEmail({
  data,
}: Readonly<ContactConfirmationEmailProps>) {
  const previewText = `We have received your editing brief, ${data.name}!`;

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
                Thank you for your submission, {data.name}!
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                We have successfully received your editing brief.
              </Text>
            </Section>

            {/* Welcome message */}
            <Section className="px-[25px] pt-[30px]">
              <Text className="text-slate-700 text-[15px] leading-[24px] m-0">
                Our editorial team is reviewing your project details. We will review your specific goals, referenced content, and formatting guidelines to prepare the optimal editing approach for you.
              </Text>
              <Text className="text-slate-700 text-[15px] leading-[24px] mt-[16px] mb-0">
                We will get back to you shortly at <strong className="text-slate-900">{data.email}</strong> with an official quote and delivery confirmation.
              </Text>
            </Section>

            {/* Brief Summary Box */}
            <Section className="px-[25px] pt-[25px]">
              <div className="bg-slate-50 rounded-lg p-[16px] border border-solid border-slate-100">
                <Heading className="text-slate-900 text-[14px] font-semibold m-0 uppercase tracking-wider mb-[12px]">
                  Brief Summary
                </Heading>
                <table className="w-full text-[14px] text-slate-600">
                  <tbody>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">Document Type:</td>
                      <td className="py-[4px] text-slate-900 text-right font-medium">
                        {data.documentTypes.join(', ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">Page Count:</td>
                      <td className="py-[4px] text-slate-900 text-right font-semibold">
                        {data.pageCount} pages
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">Services Requested:</td>
                      <td className="py-[4px] text-slate-900 text-right font-medium">
                        {data.services.join(', ')}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-[4px] font-medium text-slate-500">Your Deadline:</td>
                      <td className="py-[4px] text-[#FF2216] text-right font-bold">
                        {data.deadline}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Next Steps Section */}
            <Section className="px-[25px] pt-[30px]">
              <Heading className="text-[#1B0ABD] text-[16px] font-semibold m-0 mb-[16px]">
                What happens next?
              </Heading>

              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="valign-top w-[32px] pr-[12px]">
                      <div className="w-[24px] h-[24px] rounded-full bg-blue-50 text-[#1B0ABD] text-[12px] font-bold text-center leading-[24px] border border-solid border-blue-100">
                        1
                      </div>
                    </td>
                    <td className="pb-[16px]">
                      <Heading className="text-slate-900 text-[14px] font-bold m-0 mb-[4px]">
                        Review Brief & Requirements
                      </Heading>
                      <Text className="text-slate-500 text-[13px] leading-[20px] m-0">
                        Our editors inspect your document's requirements, style guides, and goals.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td className="valign-top w-[32px] pr-[12px]">
                      <div className="w-[24px] h-[24px] rounded-full bg-blue-50 text-[#1B0ABD] text-[12px] font-bold text-center leading-[24px] border border-solid border-blue-100">
                        2
                      </div>
                    </td>
                    <td className="pb-[16px]">
                      <Heading className="text-slate-900 text-[14px] font-bold m-0 mb-[4px]">
                        Official Quote & Timeline
                      </Heading>
                      <Text className="text-slate-500 text-[13px] leading-[20px] m-0">
                        We send you a detailed invoice, delivery schedule, and pricing agreement.
                      </Text>
                    </td>
                  </tr>
                  <tr>
                    <td className="valign-top w-[32px] pr-[12px]">
                      <div className="w-[24px] h-[24px] rounded-full bg-blue-50 text-[#1B0ABD] text-[12px] font-bold text-center leading-[24px] border border-solid border-blue-100">
                        3
                      </div>
                    </td>
                    <td>
                      <Heading className="text-slate-900 text-[14px] font-bold m-0 mb-[4px]">
                        Work Commences
                      </Heading>
                      <Text className="text-slate-500 text-[13px] leading-[20px] m-0">
                        Our dedicated academic and professional editors polish your work to perfection.
                      </Text>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            <Hr className="border-slate-200 my-[30px]" />

            {/* Signature Area */}
            <Section className="px-[25px]">
              <Text className="text-slate-600 text-[14px] leading-[22px] m-0">
                If you have any questions or need to send additional files, reply directly to this email or reach us at <Link href="mailto:hello@tweaks.co.za" className="text-[#1B0ABD] underline">hello@tweaks.co.za</Link>.
              </Text>
              
              <Text className="text-slate-800 text-[14px] mt-[24px] mb-0 font-medium">
                Best regards,
              </Text>
              <Text className="text-[#1B0ABD] text-[15px] font-bold mt-[4px] mb-0">
                The Tweaks Team
              </Text>
              <Link href="https://tweaks.co.za" className="text-[12px] text-slate-400 mt-[6px] inline-block underline">
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
