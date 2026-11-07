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

interface AdminInvitationEmailProps {
  recipientName?: string;
  invitedByEmail: string;
  role: string;
  inviteUrl: string;
  expiresInDays?: number;
}

export function AdminInvitationEmail({
  recipientName,
  invitedByEmail,
  role = "admin",
  inviteUrl,
  expiresInDays = 7,
}: Readonly<AdminInvitationEmailProps>) {
  const roleDisplay = role === "admin" ? "Administrator" : "Editor";
  const previewText = `You've been invited to join Tweaks CRM as an ${roleDisplay}`;

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
                Tweaks Academic &amp; Research Editing
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                CRM &amp; Team Access Invitation
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="p-[25px]">
              <Text className="text-slate-800 text-[16px] leading-[24px]">
                Hello{recipientName ? ` ${recipientName}` : ""},
              </Text>

              <Text className="text-slate-600 text-[15px] leading-[24px]">
                <strong>{invitedByEmail}</strong> has invited you to join the{" "}
                <strong>Tweaks CRM Workspace</strong> as an{" "}
                <span className="text-[#1B0ABD] font-bold uppercase">
                  {roleDisplay}
                </span>
                .
              </Text>

              <Text className="text-slate-600 text-[14px] leading-[22px]">
                As an {roleDisplay}, you will be able to manage client briefs,
                track quote generation, monitor proof of payments, and
                collaborate on academic editing projects.
              </Text>

              <Section className="text-center my-[30px]">
                <Button
                  className="bg-[#1B0ABD] text-white font-bold text-[14px] px-[28px] py-[14px] rounded text-center no-underline"
                  href={inviteUrl}
                >
                  Accept Invitation &amp; Create Password
                </Button>
              </Section>

              <Text className="text-slate-500 text-[12px] leading-[18px]">
                Or copy and paste this link into your browser:
                <br />
                <Link href={inviteUrl} className="text-[#1B0ABD] break-all">
                  {inviteUrl}
                </Link>
              </Text>

              <Hr className="border-slate-200 my-[20px]" />

              <Text className="text-slate-400 text-[12px] leading-[18px] m-0">
                This invitation link is valid for {expiresInDays} days. If you
                were not expecting this invitation, you can safely ignore this
                email.
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

