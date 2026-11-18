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
} from "@react-email/components";

interface ReviewNotificationEmailProps {
  rating: number;
  feedback: string;
  authorName?: string;
  authorEmail?: string;
  university?: string;
}

export function ReviewNotificationEmail({
  rating,
  feedback,
  authorName,
  authorEmail,
  university,
}: Readonly<ReviewNotificationEmailProps>) {
  const starsText = "★".repeat(rating) + "☆".repeat(5 - rating);
  const previewText = `New ${rating}-Star Review from ${authorName || "Anonymous"}`;

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
                New Client Review Received!
              </Heading>
              <Text className="text-blue-100 text-[14px] mt-[8px] mb-0">
                A client has submitted new feedback on tweaks.co.za
              </Text>
            </Section>

            {/* Rating Section */}
            <Section className="px-[20px] pt-[24px] text-center">
              <Text className="text-amber-500 text-[32px] font-bold tracking-widest my-0">
                {starsText}
              </Text>
              <Text className="text-slate-500 text-[14px] font-semibold mt-[4px]">
                {rating} out of 5 Stars
              </Text>
            </Section>

            {/* Submitter Details */}
            <Section className="px-[20px] pt-[16px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Client Details
              </Heading>

              <Row>
                <Column className="py-[6px] w-[120px] align-top text-[14px] font-semibold text-slate-500">
                  Name:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {authorName || "Anonymous"}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[120px] align-top text-[14px] font-semibold text-slate-500">
                  Email:
                </Column>
                <Column className="py-[6px] align-top text-[14px]">
                  {authorEmail ? (
                    <Link
                      href={`mailto:${authorEmail}`}
                      className="text-[#1B0ABD] underline font-medium"
                    >
                      {authorEmail}
                    </Link>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </Column>
              </Row>

              <Row>
                <Column className="py-[6px] w-[120px] align-top text-[14px] font-semibold text-slate-500">
                  University:
                </Column>
                <Column className="py-[6px] align-top text-[14px] text-slate-900 font-medium">
                  {university || (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </Column>
              </Row>
            </Section>

            {/* Feedback Content */}
            <Section className="px-[20px] pt-[24px]">
              <Heading className="text-[#1B0ABD] text-[18px] font-semibold mb-[12px] border-b border-solid border-slate-100 pb-[6px]">
                Feedback / Review
              </Heading>
              <Section className="bg-slate-50 border-l-4 border-solid border-[#1B0ABD] p-[16px] rounded-r">
                <Text className="text-[14px] text-slate-800 leading-relaxed whitespace-pre-wrap m-0">
                  {feedback}
                </Text>
              </Section>
            </Section>

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
}

export default ReviewNotificationEmail;
