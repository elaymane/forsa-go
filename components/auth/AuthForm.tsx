"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, Lock, User, Tag, CheckCircle2, XCircle } from "lucide-react";
import type { AuthFormState } from "@/app/actions";
import { lookupManagerCodeAction } from "@/app/actions";

// Field configs (including icon components) live here, inside the Client
// Component. Icons are React components, not plain data — Server Components
// can't pass them as props to Client Components, so the parent pages only
// pass a plain string ("login" | "signup") and we look the fields up here.
const FIELD_SETS = {
  login: [
    { name: "email", type: "email", placeholder: "Email address", icon: Mail, autoComplete: "email" },
    { name: "password", type: "password", placeholder: "Password", icon: Lock, autoComplete: "current-password" },
  ],
  signup: [
    { name: "name", type: "text", placeholder: "Full name", icon: User, autoComplete: "name" },
    { name: "email", type: "email", placeholder: "Email address", icon: Mail, autoComplete: "email" },
    {
      name: "password",
      type: "password",
      placeholder: "Password (min. 8 characters)",
      icon: Lock,
      autoComplete: "new-password",
    },
  ],
} as const;

interface AuthFormProps {
  variant: "login" | "signup";
  title: string;
  subtitle: string;
  submitLabel: string;
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  footer: { text: string; linkLabel: string; href: string };
}

const initialState: AuthFormState = {};

export default function AuthForm({ variant, title, subtitle, submitLabel, action, footer }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fields = FIELD_SETS[variant];

  const [managerCode, setManagerCode] = useState("");
  const [managerLookup, setManagerLookup] = useState<{ name: string } | "not_found" | null>(null);
  const [checking, setChecking] = useState(false);

  // Debounced live lookup — only for signup, only once there's something to check.
  useEffect(() => {
    if (variant !== "signup" || !managerCode.trim()) {
      setManagerLookup(null);
      return;
    }
    setChecking(true);
    const timeout = setTimeout(async () => {
      const result = await lookupManagerCodeAction(managerCode);
      setManagerLookup(result ?? "not_found");
      setChecking(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [managerCode, variant]);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <img src="/logo-icon.png" alt="Forsa Go" className="mx-auto mb-4 h-12 w-12 rounded-xl" />
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      <form action={formAction} className="space-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.name} className="relative">
              <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                required
                className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>
          );
        })}

        {variant === "signup" && (
          <div>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="managerCode"
                type="text"
                placeholder="Invite code (optional)"
                value={managerCode}
                onChange={(e) => setManagerCode(e.target.value.toUpperCase())}
                className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-3 text-sm uppercase tracking-widest outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
              />
            </div>
            {checking && <p className="mt-1.5 text-xs text-gray-400">Checking…</p>}
            {!checking && managerLookup && managerLookup !== "not_found" && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={13} /> You'll be linked to {managerLookup.name}
              </p>
            )}
            {!checking && managerLookup === "not_found" && (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
                <XCircle size={13} /> That code doesn't match anyone — leave it blank if you don't have one
              </p>
            )}
          </div>
        )}

        {state.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : submitLabel}
          {!isPending && <ArrowRight size={16} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        {footer.text}{" "}
        <Link href={footer.href} className="font-medium text-purple-600 hover:underline dark:text-purple-400">
          {footer.linkLabel}
        </Link>
      </p>
    </div>
  );
}
