"use client";

import React, { useActionState, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { reviewSchema, ReviewInput } from "@/lib/validations/review";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type FormState = {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
};

async function submitReviewAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ratingStr = formData.get("rating");
  const rating = ratingStr ? Number(ratingStr) : 0;
  const feedback = (formData.get("feedback") as string) || "";
  const authorName = (formData.get("authorName") as string) || "";
  const authorEmail = (formData.get("authorEmail") as string) || "";
  const university = (formData.get("university") as string) || "";
  const hp_website = (formData.get("hp_website") as string) || "";
  const _formTime = (formData.get("_formTime") as string) || "";

  const payload = {
    rating,
    feedback,
    authorName: authorName.trim() || undefined,
    authorEmail: authorEmail.trim() || undefined,
    university: university.trim() || undefined,
    hp_website,
    _formTime,
  };

  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to submit review. Please check your inputs.",
        errors: data.errors,
      };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export default function ReviewPage() {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitReviewAction,
    { success: false }
  );

  const {
    register,
    setValue,
    watch,
    formState: { errors: formErrors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      feedback: "",
      authorName: "",
      authorEmail: "",
      university: "",
      hp_website: "",
      _formTime: "",
    },
  });

  const rating = watch("rating");

  useEffect(() => {
    setValue("_formTime", String(Date.now()));
  }, [setValue]);

  if (state.success) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thank You for Your Feedback!</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Your review has been successfully submitted. We deeply appreciate your time and trust in our editing services!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-10 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full uppercase tracking-wider">
            Client Feedback
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How was your experience with Tweaks?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            We value your honest feedback to help us continuously improve our academic & professional editing services.
          </p>
        </div>

        {/* Form using action and Shadcn UI components */}
        <form action={formAction} className="space-y-6">
          
          {/* Hidden inputs for React Hook Form integration & anti-spam */}
          <input type="hidden" {...register("rating")} value={rating || 0} />
          <input type="hidden" {...register("_formTime")} />

          {/* Honeypot field (hidden from users) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="hp_website">Do not fill this field</label>
            <input
              id="hp_website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("hp_website")}
            />
          </div>

          {/* Global Error Banner */}
          {state.error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{state.error}</div>
            </div>
          )}

          {/* Star Rating Selection */}
          <div className="space-y-2 text-center">
            <Label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setValue("rating", star, { shouldValidate: true })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 focus:outline-none transition-transform transform hover:scale-110"
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300 dark:text-slate-700"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {formErrors.rating && (
              <p className="text-xs text-red-500">{formErrors.rating.message}</p>
            )}
            {state.errors?.rating && (
              <p className="text-xs text-red-500">{state.errors.rating[0]}</p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Your Review / Feedback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="feedback"
              rows={4}
              required
              {...register("feedback")}
              placeholder="Tell us what you liked about our service or how we can improve..."
              className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 transition-colors text-sm rounded-xl"
            />
            {formErrors.feedback && (
              <p className="text-xs text-red-500">{formErrors.feedback.message}</p>
            )}
            {state.errors?.feedback && (
              <p className="text-xs text-red-500">{state.errors.feedback[0]}</p>
            )}
          </div>

          {/* Author Name (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="authorName" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Your Name <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="authorName"
              type="text"
              {...register("authorName")}
              placeholder="e.g. Dr. Jane Smith"
              className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 transition-colors text-sm rounded-xl"
            />
          </div>

          {/* Author Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="authorEmail" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              Your Email <span className="text-slate-400 font-normal">(Optional, kept private)</span>
            </Label>
            <Input
              id="authorEmail"
              type="email"
              {...register("authorEmail")}
              placeholder="jane@example.com"
              className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 transition-colors text-sm rounded-xl"
            />
            {formErrors.authorEmail && (
              <p className="text-xs text-red-500">{formErrors.authorEmail.message}</p>
            )}
            {state.errors?.authorEmail && (
              <p className="text-xs text-red-500">{state.errors.authorEmail[0]}</p>
            )}
          </div>

          {/* University / Institution (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="university" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
              University / Institution <span className="text-slate-400 font-normal">(Optional)</span>
            </Label>
            <Input
              id="university"
              type="text"
              {...register("university")}
              placeholder="e.g. University of Cape Town"
              className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 transition-colors text-sm rounded-xl"
            />
            {formErrors.university && (
              <p className="text-xs text-red-500">{formErrors.university.message}</p>
            )}
            {state.errors?.university && (
              <p className="text-xs text-red-500">{state.errors.university[0]}</p>
            )}
          </div>

          {/* Submit Button using Shadcn Button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full py-6 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Submitting Feedback...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}
