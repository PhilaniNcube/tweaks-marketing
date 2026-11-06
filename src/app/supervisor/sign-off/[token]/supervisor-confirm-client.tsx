"use client";

import React, { useState } from "react";
import { CheckCircle2, FileCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { confirmSupervisorSignOff } from "@/app/actions/supervisor";

interface SupervisorConfirmClientProps {
  token: string;
  data: {
    studentName: string;
    institutionName: string;
    degreeLevel: string;
    degreeProgramme: string;
    researchTitle: string;
    supervisorName: string;
    alreadyConfirmed: boolean;
    confirmedAt: string | null;
    confirmationWording: string;
  };
}

export function SupervisorConfirmClient({
  token,
  data,
}: SupervisorConfirmClientProps) {
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(data.alreadyConfirmed);
  const [confirmedAt, setConfirmedAt] = useState(data.confirmedAt);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!checked) return;
    setIsSubmitting(true);
    setError(null);
    const res = await confirmSupervisorSignOff(token);
    setIsSubmitting(false);
    if (res.success) {
      setConfirmed(true);
      setConfirmedAt(res.confirmedAt);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 py-16 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 space-y-6">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-4">
          <span className="text-xs font-bold uppercase tracking-widest text-tweaks-blue">
            Tweaks Academic Editing
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Supervisor Editing Sign-Off
          </h1>
        </div>

        {/* Academic Context Only — No Fees, Payment Status, or Notes */}
        <div className="bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-5 space-y-3 text-sm">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              Student / Researcher
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {data.studentName}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              Institution
            </span>
            <span className="text-slate-800 dark:text-zinc-200">
              {data.institutionName}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              Degree & Programme
            </span>
            <span className="text-slate-800 dark:text-zinc-200">
              {[data.degreeLevel, data.degreeProgramme]
                .filter(Boolean)
                .join(" — ")}
            </span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">
              Research Title
            </span>
            <span className="font-medium italic text-slate-900 dark:text-white">
              {data.researchTitle}
            </span>
          </div>
        </div>

        {confirmed ? (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-950 dark:text-emerald-200 space-y-1">
              <p className="font-bold">Sign-Off Confirmed</p>
              <p className="text-xs">
                Thank you, {data.supervisorName}. Your confirmation has been
                recorded
                {confirmedAt
                  ? ` on ${new Date(confirmedAt).toLocaleDateString("en-ZA")}`
                  : ""}
                .
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <label className="flex items-start gap-3 p-4 border border-slate-200 dark:border-zinc-800 cursor-pointer hover:border-tweaks-blue transition-colors">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="w-4 h-4 mt-1 rounded-none text-tweaks-blue"
              />
              <span className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                {data.confirmationWording}
              </span>
            </label>

            <p className="text-xs text-slate-400 leading-relaxed">
              Note: This confirmation only records that you are aware the
              student is submitting their manuscript for language editing at
              this stage. It is not an approval of the edited text and carries
              no financial or editorial liability.
            </p>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!checked || isSubmitting}
              className="w-full bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none py-6 font-bold cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? "Recording Confirmation..." : "Confirm Sign-Off"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

