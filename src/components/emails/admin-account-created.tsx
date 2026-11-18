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

export interface AdminAccountCreatedEmailProps {
  recipientName: string;
  recipientEmail: string;
  createdByEmail: string;
  role: string;
  loginUrl: string;
}

export function AdminAccountCreatedEmail({
  recipientName,
  recipientEmail,
  createdByEmail,
  role = "admin",
  loginUrl,
}: Readonly<AdminAccountCreatedEmailProps>) {
  const roleDisplay = role === "admin" ? "Administrator" : "Editor";
  const previewText = `Your Tweaks CRM ${roleDisplay} account has been created`;

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
                Welcome to Tweaks CRM
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                Your CRM Workspace Account is Ready
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="p-[25px]">
              <Text className="text-slate-800 text-[16px] leading-[24px] mt-0">
                Hello {recipientName},
              </Text>

              <Text className="text-slate-600 text-[15px] leading-[24px]">
                Your Tweaks CRM{" "}
                <span className="text-[#1B0ABD] font-bold">{roleDisplay}</span>{" "}
                account has been created by{" "}
                <strong className="text-slate-900">{createdByEmail}</strong>.
              </Text>

              <Section className="bg-slate-50 rounded-lg p-[16px] border border-solid border-slate-200 my-[20px]">
                <Text className="text-slate-900 text-[13px] font-semibold uppercase tracking-wider mt-0 mb-[10px]">
                  Login Details
                </Text>

                <Row className="py-[4px]">
                  <Column className="w-[120px]">
                    <Text className="text-slate-500 text-[14px] font-medium m-0">
                      Email:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-slate-900 text-[14px] font-medium m-0">
                      {recipientEmail}
                    </Text>
                  </Column>
                </Row>

                <Row className="py-[4px]">
                  <Column className="w-[120px]">
                    <Text className="text-slate-500 text-[14px] font-medium m-0">
                      Role:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-slate-900 text-[14px] font-bold m-0">
                      {role.toUpperCase()}
                    </Text>
                  </Column>
                </Row>

                <Row className="py-[4px]">
                  <Column className="w-[120px]">
                    <Text className="text-slate-500 text-[14px] font-medium m-0">
                      Login Portal:
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-[14px] m-0">
                      <Link
                        href={loginUrl}
                        className="text-[#1B0ABD] underline break-all"
                      >
                        {loginUrl}
                      </Link>
                    </Text>
                  </Column>
                </Row>
              </Section>

              <Text className="text-slate-600 text-[14px] leading-[22px]">
                You can sign in directly using the password provided to you.
              </Text>

              <Section className="text-center my-[28px]">
                <Button
                  className="bg-[#1B0ABD] text-white font-bold text-[14px] px-[28px] py-[14px] rounded text-center no-underline"
                  href={loginUrl}
                >
                  Sign In to Tweaks CRM
                </Button>
              </Section>

              <Hr className="border-slate-200 my-[20px]" />

              <Text className="text-slate-400 text-[12px] leading-[18px] m-0">
                If you were not expecting this account or need help signing in,
                please contact your workspace administrator.
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

export default AdminAccountCreatedEmail;
