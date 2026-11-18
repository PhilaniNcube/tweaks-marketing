import * as React from "react";
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
  Button,
} from "@react-email/components";

export interface SupervisorConfirmationEmailProps {
  supervisorName: string;
  studentName: string;
  academicContext?: string;
  researchTitle: string;
  supervisorUrl: string;
}

export function SupervisorConfirmationEmail({
  supervisorName,
  studentName,
  academicContext,
  researchTitle,
  supervisorUrl,
}: Readonly<SupervisorConfirmationEmailProps>) {
  const previewText = `Supervisor confirmation requested: ${studentName} (${researchTitle})`;

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
                Supervisor Confirmation Request
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                Tweaks Academic &amp; Research Editing
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="p-[25px]">
              <Text className="text-slate-800 text-[16px] leading-[24px] mt-0">
                Dear {supervisorName},
              </Text>

              <Text className="text-slate-600 text-[15px] leading-[24px]">
                <strong>{studentName}</strong>
                {academicContext ? ` (${academicContext})` : ""} has submitted
                their manuscript titled:
              </Text>

              <Section className="bg-slate-50 border-l-4 border-solid border-[#1B0ABD] px-[16px] py-[12px] my-[16px] rounded-r">
                <Text className="text-slate-700 italic text-[15px] leading-[22px] m-0">
                  {researchTitle}
                </Text>
              </Section>

              <Text className="text-slate-600 text-[14px] leading-[22px]">
                They have requested your confirmation that you are aware this
                work is being submitted for professional language editing at
                this stage.
              </Text>

              <Section className="text-center my-[28px]">
                <Button
                  className="bg-[#1B0ABD] text-white font-bold text-[14px] px-[28px] py-[14px] rounded text-center no-underline"
                  href={supervisorUrl}
                >
                  Review &amp; Confirm Sign-Off
                </Button>
              </Section>

              <Text className="text-slate-500 text-[12px] leading-[18px]">
                Or copy and paste this link into your browser:
                <br />
                <Link href={supervisorUrl} className="text-[#1B0ABD] break-all">
                  {supervisorUrl}
                </Link>
              </Text>

              <Hr className="border-slate-200 my-[20px]" />

              <Text className="text-slate-500 text-[12px] leading-[18px] m-0">
                Note: Confirming only indicates awareness that the student is
                submitting their work for language editing at this stage; it is
                not an endorsement of the final edited text.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="bg-slate-50 p-[15px] text-center rounded-b border-t border-slate-100">
              <Text className="text-slate-400 text-[11px] m-0">
                Tweaks Academic Editing &bull; Cape Town &amp; Johannesburg,
                South Africa
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default SupervisorConfirmationEmail;
