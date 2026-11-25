import * as React from "react";
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

export interface PreEditSubmittedEmailProps {
  editorName: string;
  editorEmail: string;
  clientFullName: string;
  researchTitle: string;
  quoteNumber: string;
  requestedReturnDate?: string;
  fileNames: string[];
  editorNotes?: string | null;
  projectWorkspaceUrl: string;
}

export function PreEditSubmittedEmail({
  editorName,
  editorEmail,
  clientFullName,
  researchTitle,
  quoteNumber,
  requestedReturnDate,
  fileNames,
  editorNotes,
  projectWorkspaceUrl,
}: Readonly<PreEditSubmittedEmailProps>) {
  const previewText = `${editorName} has uploaded pre-edited files for ${clientFullName} (${quoteNumber}). Ready for final editing.`;

  return (
    <Html>
      <Tailwind>
        <Head />
        <Preview>{previewText}</Preview>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded my-[40px] mx-auto p-[20px] max-w-[600px] bg-white shadow-sm">
            {/* Header Banner */}
            <Section className="bg-[#1B0ABD] rounded-t p-[28px] text-center">
              <Heading className="text-white text-[21px] font-bold m-0 tracking-tight">
                Pre-Edited Files Uploaded — Ready for Final Edit
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                {clientFullName} • Quote Reference: <strong>{quoteNumber}</strong>
              </Text>
            </Section>

            {/* Intro */}
            <Section className="px-[25px] pt-[26px]">
              <Text className="text-slate-800 text-[15px] leading-[24px] m-0">
                Hi Chengetai,
              </Text>
              <Text className="text-slate-700 text-[15px] leading-[24px] mt-[12px] mb-0">
                <strong>{editorName}</strong> ({editorEmail}) has uploaded the
                pre-edited files for <strong>{clientFullName}</strong>&apos;s
                project and moved it to the <strong>Editing</strong> stage so you
                can proceed with the final edit.
              </Text>
            </Section>

            {/* Project & Pre-Edit Details */}
            <Section className="px-[25px] pt-[20px]">
              <Section className="bg-slate-50 rounded-lg p-[16px] border border-solid border-slate-100">
                <Heading className="text-slate-900 text-[13px] font-semibold m-0 uppercase tracking-wider mb-[12px]">
                  Pre-Edit Handover Summary
                </Heading>

                <Row>
                  <Column className="py-[4px] w-[160px] align-top font-medium text-[13px] text-slate-500">
                    Client:
                  </Column>
                  <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-bold">
                    {clientFullName}
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[160px] align-top font-medium text-[13px] text-slate-500">
                    Quote Reference:
                  </Column>
                  <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-semibold">
                    {quoteNumber}
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[160px] align-top font-medium text-[13px] text-slate-500">
                    Research Title:
                  </Column>
                  <Column className="py-[4px] align-top text-[13px] text-slate-900 text-right font-medium">
                    {researchTitle}
                  </Column>
                </Row>

                <Row>
                  <Column className="py-[4px] w-[160px] align-top font-medium text-[13px] text-slate-500">
                    Pre-Editor:
                  </Column>
                  <Column className="py-[4px] align-top text-[13px] text-[#1B0ABD] text-right font-bold">
                    {editorName}
                  </Column>
                </Row>

                {requestedReturnDate && (
                  <Row>
                    <Column className="py-[4px] w-[160px] align-top font-medium text-[13px] text-slate-500">
                      Client Return Date:
                    </Column>
                    <Column className="py-[4px] align-top text-[13px] text-[#FF2216] text-right font-bold">
                      {requestedReturnDate}
                    </Column>
                  </Row>
                )}

                <Row>
                  <Column className="py-[6px] w-[160px] align-top font-semibold text-[13px] text-slate-700 border-t border-solid border-slate-200">
                    Uploaded Files ({fileNames.length}):
                  </Column>
                  <Column className="py-[6px] align-top text-[13px] text-slate-900 text-right font-semibold border-t border-solid border-slate-200">
                    {fileNames.length > 0
                      ? fileNames.join(", ")
                      : "Uploaded in tracker"}
                  </Column>
                </Row>
              </Section>
            </Section>

            {/* Editor Notes Box */}
            <Section className="px-[25px] pt-[18px]">
              <Section className="bg-amber-50 rounded-lg p-[16px] border border-solid border-amber-200">
                <Heading className="text-amber-900 text-[13px] font-bold m-0 uppercase tracking-wider mb-[8px]">
                  Notes from {editorName}
                </Heading>
                <Text className="text-slate-800 text-[14px] leading-[22px] m-0 whitespace-pre-wrap">
                  {editorNotes && editorNotes.trim()
                    ? editorNotes.trim()
                    : "No additional notes left by the editor."}
                </Text>
              </Section>
            </Section>

            {/* CTA to Project Workspace */}
            <Section className="px-[25px] pt-[24px] text-center">
              <Button
                href={projectWorkspaceUrl}
                className="bg-[#1B0ABD] text-white px-[22px] py-[12px] rounded text-[14px] font-bold no-underline inline-block"
              >
                Open Project Workspace &amp; Download Pre-Edited Files
              </Button>
              <Text className="text-slate-500 text-[12px] text-center mt-[12px] mb-0">
                Or open directly:{" "}
                <Link
                  href={projectWorkspaceUrl}
                  className="text-[#1B0ABD] underline break-all"
                >
                  {projectWorkspaceUrl}
                </Link>
              </Text>
            </Section>

            <Hr className="border-slate-200 my-[26px]" />

            <Section className="px-[25px]">
              <Text className="text-slate-500 text-[12px] leading-[18px] m-0">
                Tweaks CRM Operations Suite • Automated Pre-Editing Handover
                Notification
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PreEditSubmittedEmail;
