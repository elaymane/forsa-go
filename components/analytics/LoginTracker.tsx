"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/gtm";

/** Fires once after a successful login. The login action redirects with ?login=1. */
export default function LoginTracker() {
  const router = useRouter();

  useEffect(() => {
    trackEvent("login");
    // Remove the one-time marker so refresh/back navigation cannot count another login.
    router.replace("/dashboard");
  }, [router]);

  return null;
}
