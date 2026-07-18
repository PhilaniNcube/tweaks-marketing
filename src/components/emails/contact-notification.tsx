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
} from '@react-email/components';

interface ContactNotificationEmailProps {
  data: ContactFormData;
}

export function ContactNotificationEmail({
  data,
}: Readonly<ContactNotificationEmailProps>) {
  const previewText = `New Brief: ${data.name} - ${data.documentTypes.join(', ')}`;

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
                A new project proposal has been received on tweaks.co.za
              </Text>
            </Section>

            {/* Submitter Details */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Contact Information
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[120px] text-slate-500">Name:</td>
                    <td className="py-[6px] text-slate-900 font-medium">{data.name}</td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Email:</td>
                    <td className="py-[6px]">
                      <a href={`mailto:${data.email}`} className="text-[#1B0ABD] underline font-medium">
                        {data.email}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">WhatsApp:</td>
                    <td className="py-[6px] text-slate-900 font-medium">{data.whatsapp}</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Project Details */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Project Details
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[180px] text-slate-500">Document Types:</td>
                    <td className="py-[6px] text-slate-900">
                      {data.documentTypes.join(', ')}
                      {data.documentTypeOther && (
                        <span className="text-slate-500 italic"> ({data.documentTypeOther})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Study Level:</td>
                    <td className="py-[6px] text-slate-900">
                      {data.studyLevel}
                      {data.studyLevelOther && (
                        <span className="text-slate-500 italic"> ({data.studyLevelOther})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Page Count:</td>
                    <td className="py-[6px] text-slate-900 font-semibold">{data.pageCount} pages</td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Reference Page Count:</td>
                    <td className="py-[6px] text-slate-900">{data.referencePageCount} pages</td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Editing Requirements */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Editing Requirements
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[180px] text-slate-500">Services:</td>
                    <td className="py-[6px] text-slate-900 font-medium">
                      {data.services.join(', ')}
                      {data.serviceOther && (
                        <span className="text-slate-500 italic"> ({data.serviceOther})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Referencing Style:</td>
                    <td className="py-[6px] text-slate-900">{data.referencingStyle}</td>
                  </tr>
                  {data.mainGoal && (
                    <tr>
                      <td className="py-[6px] font-semibold text-slate-500">Main Goal:</td>
                      <td className="py-[6px] text-slate-900">{data.mainGoal}</td>
                    </tr>
                  )}
                  {data.concerns && (
                    <tr>
                      <td className="py-[6px] font-semibold text-slate-500">Specific Concerns:</td>
                      <td className="py-[6px] text-slate-900">{data.concerns}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            {/* Logistics */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Logistics & Deadlines
              </Heading>
              <table className="w-full text-left text-[14px] text-slate-600 border-collapse">
                <tbody>
                  <tr>
                    <td className="py-[6px] font-semibold w-[180px] text-slate-500">Deadline:</td>
                    <td className="py-[6px] text-[#FF2216] font-bold">{data.deadline}</td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Expected Submission:</td>
                    <td className="py-[6px] text-slate-900">{data.submissionDate}</td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Tracked Changes:</td>
                    <td className="py-[6px] text-slate-900">
                      {data.trackedChanges}
                      {data.trackedChangesOther && (
                        <span className="text-slate-500 italic"> ({data.trackedChangesOther})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-[6px] font-semibold text-slate-500">Certificate Required:</td>
                    <td className="py-[6px] text-slate-900">{data.certificate}</td>
                  </tr>
                  {data.funding && (
                    <tr>
                      <td className="py-[6px] font-semibold text-slate-500">Funding / Department:</td>
                      <td className="py-[6px] text-slate-900">{data.funding}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Section>

            {/* Additional Information */}
            {data.additionalInfo && (
              <Section className="px-[20px] pt-[24px]">
                <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                  Additional Information
                </Heading>
                <div className="bg-slate-50 border-l-4 border-solid border-[#1B0ABD] p-[12px] text-[14px] text-slate-700 rounded-r italic">
                  {data.additionalInfo}
                </div>
              </Section>
            )}

            <Hr className="border-slate-200 my-[30px]" />

            <Section className="text-center px-[20px]">
              <Text className="text-[12px] text-slate-400 m-0">
                This is an automated notification from tweaks.co.za
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ContactNotificationEmail;
