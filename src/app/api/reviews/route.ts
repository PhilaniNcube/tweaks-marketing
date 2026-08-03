import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/components";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { reviewSchema } from "@/lib/validations/review";
import { checkRateLimit } from "@/lib/rate-limit";
import { ReviewNotificationEmail } from "@/components/emails/review-notification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // 1. IP Rate Limiting Check (3 submissions per 10 mins)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(ip, 3, 10 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many feedback submissions. Please wait a few minutes before trying again.",
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    // 2. Honeypot check: If the hidden trap field is filled, silently succeed without storing
    if (body.hp_website && typeof body.hp_website === "string" && body.hp_website.trim() !== "") {
      console.warn("Spam detected via Honeypot trap on reviews route:", { ip });
      return NextResponse.json({ success: true });
    }

    // 3. Time trap check: Submissions under 3 seconds (3000ms) are flagged as bot actions
    if (body._formTime) {
      const formTimeNum = Number(body._formTime);
      if (!isNaN(formTimeNum)) {
        const elapsedTime = Date.now() - formTimeNum;
        if (elapsedTime < 3000) {
          console.warn("Spam detected via Time Trap (<3s) on reviews route:", { ip, elapsedTime });
          return NextResponse.json({ success: true });
        }
      }
    }

    // 4. Schema Validation
    const validated = reviewSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { rating, feedback, authorName, authorEmail, university } = validated.data;

    // 5. Insert into Turso database via Drizzle
    await db.insert(reviews).values({
      rating,
      feedback: feedback.trim(),
      authorName: authorName ? authorName.trim() : null,
      authorEmail: authorEmail ? authorEmail.trim() : null,
      university: university ? university.trim() : null,
    });

    // 6. Send notification email to admin via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const emailHtml = await render(
          ReviewNotificationEmail({
            rating,
            feedback: feedback.trim(),
            authorName: authorName ? authorName.trim() : undefined,
            authorEmail: authorEmail ? authorEmail.trim() : undefined,
            university: university ? university.trim() : undefined,
          })
        );

        const emailResult = await resend.emails.send({
          from: "Tweaks Notifications <hello@tweaks.co.za>",
          to: ["hello@tweaks.co.za"],
          subject: `New ${rating}-Star Review from ${authorName?.trim() || "Anonymous"}`,
          html: emailHtml,
        });

        if (emailResult.error) {
          console.error("Resend Review Notification Error:", emailResult.error);
        }
      } catch (emailErr) {
        console.error("Failed rendering or sending review notification email:", emailErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reviews API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review. Please try again later." },
      { status: 500 }
    );
  }
}

