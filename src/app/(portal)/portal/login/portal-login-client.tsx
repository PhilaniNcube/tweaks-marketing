"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Loader2,
  AlertCircle,
  FileUp,
  ArrowLeft,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import {
  checkClientEmailStatusAction,
  registerClientPortalAccountAction,
} from "@/app/actions/portal";
import { toast } from "sonner";

interface PortalLoginClientProps {
  initialEmail?: string;
  initialMode?: "signin" | "signup";
}

export function PortalLoginClient({
  initialEmail = "",
  initialMode = "signin",
}: PortalLoginClientProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAccountPrompt, setNeedsAccountPrompt] = useState(false);

  const switchMode = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    setError(null);
    setNeedsAccountPrompt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsAccountPrompt(false);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        const regResult = await registerClientPortalAccountAction({
          email: cleanEmail,
          password,
          name: name.trim() || undefined,
        });

        if (!regResult.success) {
          if ("code" in regResult && regResult.code === "ACCOUNT_EXISTS") {
            setMode("signin");
            setPassword("");
            setConfirmPassword("");
          }
          setError(regResult.error);
          setIsLoading(false);
          return;
        }

        const { error: signInError } = await signIn.email({
          email: cleanEmail,
          password,
        });

        if (signInError) {
          setError(
            signInError.message ||
              "Your account was created, but sign-in failed. Please sign in manually."
          );
          setMode("signin");
          setIsLoading(false);
          return;
        }

        toast.success("Client account created!", {
          description: "You can now view your project and upload your document.",
        });
        router.push("/portal");
        router.refresh();
      } else {
        const { error: signInError } = await signIn.email({
          email: cleanEmail,
          password,
        });

        if (signInError) {
          const status = await checkClientEmailStatusAction(cleanEmail);
          if (status.hasClientRecord && !status.hasUserAccount) {
            setNeedsAccountPrompt(true);
            setError(
              "We found a quote request for this email, but you haven't created a portal password yet."
            );
          } else {
            setError(signInError.message || "Invalid email or password.");
          }
          setIsLoading(false);
          return;
        }

        toast.success("Signed in to Client Portal");
        router.push("/portal");
        router.refresh();
      }
    } catch {
      setError("Authentication request failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-tweaks-blue transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Tweaks Website
        </Link>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tweaks-blue">
              <FileUp className="h-4 w-4" />
              <span>Tweaks Client Portal</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === "signup"
                ? "Create Your Client Account"
                : "Sign In to Your Project"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Use the same email address you used when submitting your quote
              request to view your project and upload your document for editing.
            </p>
          </div>

          {/* Mode Toggle Tabs */}
          <div className="grid grid-cols-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`py-2 text-xs font-bold transition-colors cursor-pointer ${
                mode === "signup"
                  ? "bg-tweaks-blue text-white"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Create Client Account
            </button>
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`py-2 text-xs font-bold transition-colors cursor-pointer ${
                mode === "signin"
                  ? "bg-tweaks-blue text-white"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 space-y-2 text-xs text-red-700 dark:text-red-300">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
              {needsAccountPrompt && (
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="ml-6 inline-flex items-center px-3 py-1.5 bg-tweaks-blue text-white font-bold text-[11px] hover:bg-tweaks-red transition-colors cursor-pointer"
                >
                  Create Client Account Now
                </button>
              )}
            </div>
          )}

          {mode === "signup" && !error && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5 text-[11px] text-slate-700 dark:text-zinc-300">
              <Info className="h-4 w-4 text-tweaks-blue shrink-0 mt-0.5" />
              <span>
                Only email addresses linked to a submitted quote request can
                create a client account. You will only see your own project.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="portal-email"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Quote Email Address
              </Label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  id="portal-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.ac.za"
                  className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="portal-name"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Full Name (Optional)
                </Label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="portal-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Uses name from your quote if left blank"
                    className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="portal-password"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {mode === "signup"
                  ? "Create Password (min 8 characters)"
                  : "Password"}
              </Label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  id="portal-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>

            {mode === "signup" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="portal-confirm-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="portal-confirm-password"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none py-6 font-bold cursor-pointer transition-colors"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {mode === "signup"
                ? isLoading
                  ? "Creating Account & Opening Portal..."
                  : "Create Account & Open Client Dashboard"
                : isLoading
                  ? "Signing In..."
                  : "Sign In to Client Dashboard"}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-center text-xs text-slate-500 dark:text-zinc-400">
            Haven&apos;t requested a quote yet?{" "}
            <Link
              href="/contact"
              className="text-tweaks-blue font-bold hover:underline"
            >
              Request a quote here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
