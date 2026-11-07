"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";

interface CrmLoginClientProps {
  isFirstTimeSetup: boolean;
}

export function CrmLoginClient({ isFirstTimeSetup }: CrmLoginClientProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isFirstTimeSetup) {
        const { error: signUpError } = await signUp.email({
          name: name.trim() || "Tweaks Admin",
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message || "Failed to create initial admin account.");
          setIsLoading(false);
          return;
        }

        toast.success("Admin account created!", {
          description: "Welcome to the Tweaks CRM dashboard.",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        const { error: signInError } = await signIn.email({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setError(signInError.message || "Invalid email or password.");
          setIsLoading(false);
          return;
        }

        toast.success("Signed in successfully");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Authentication request failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm space-y-6">
        <div className="space-y-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tweaks-blue">
            <ShieldCheck className="h-4 w-4" />
            <span>Tweaks CRM &amp; Client Tracker</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isFirstTimeSetup
              ? "Initial Admin Account Setup"
              : "Sign In to CRM"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {isFirstTimeSetup
              ? "Create the primary administrator account for the Tweaks CRM. Public registration will be locked automatically once this account is created."
              : "Enter your administrator or editor credentials to manage briefs, quotes, and payments."}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isFirstTimeSetup && (
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Full Name
              </Label>
              <div className="relative">
                <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chengetai / Tweaks Admin"
                  className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Email Address
            </Label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@tweaks.co.za"
                className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Password (min 8 characters)
            </Label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="password"
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none py-6 font-bold cursor-pointer transition-colors"
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isFirstTimeSetup
              ? isLoading
                ? "Creating Admin Account..."
                : "Create Admin Account & Open CRM"
              : isLoading
                ? "Signing In..."
                : "Sign In to CRM Dashboard"}
          </Button>

          {!isFirstTimeSetup && (
            <p className="text-center text-[11px] text-slate-500 dark:text-zinc-400 pt-2">
              Received a team invitation?{" "}
              <a
                href="/admin/invite"
                className="text-tweaks-blue font-bold hover:underline"
              >
                Accept Invite &amp; Set Password
              </a>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

