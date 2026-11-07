"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import { acceptAdminInviteAction } from "@/app/actions/admin-users";
import { toast } from "sonner";

interface AdminInviteClientProps {
  token: string;
  email: string;
  initialName?: string;
  role: string;
  invitedBy: string;
}

export function AdminInviteClient({
  token,
  email,
  initialName = "",
  role,
  invitedBy,
}: AdminInviteClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleDisplay = role === "admin" ? "Administrator" : "Editor";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Accept the invitation on the server (hashes password and inserts user/account)
      const res = await acceptAdminInviteAction({
        token,
        name: name.trim(),
        password,
      });

      if (!res.success) {
        setError(res.error || "Failed to set up account.");
        setIsLoading(false);
        return;
      }

      // 2. Sign in immediately to establish session cookies
      const { error: signInError } = await signIn.email({
        email: email.trim(),
        password,
      });

      if (signInError) {
        toast.success("Account created successfully!");
        toast.info("Please sign in with your new password.");
        router.push("/admin/login");
        return;
      }

      toast.success(`Welcome to Tweaks CRM, ${name.trim()}!`, {
        description: `Your ${roleDisplay} account is ready.`,
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm space-y-6">
        {/* Header */}
        <div className="space-y-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-tweaks-blue">
            <ShieldCheck className="h-4 w-4" />
            <span>Tweaks CRM &amp; Client Tracker</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Accept Team Invitation
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            <strong>{invitedBy}</strong> has invited you to join the Tweaks CRM
            team as an{" "}
            <span className="font-bold text-tweaks-blue uppercase">
              {roleDisplay}
            </span>
            . Complete your profile and choose a password to get started.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (Read Only) */}
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Invited Email Address
            </Label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="email"
                type="email"
                disabled
                value={email}
                className="pl-9 rounded-none border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 cursor-not-allowed"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              This account is locked to this invited address.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="name"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Your Full Name
            </Label>
            <div className="relative">
              <User className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="pl-9 rounded-none border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Create Password (min 8 characters)
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
              <Input
                id="confirmPassword"
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

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-tweaks-blue hover:bg-tweaks-red text-white rounded-none py-6 font-bold cursor-pointer transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting Up Your Account...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate {roleDisplay} Account &amp; Open CRM
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
