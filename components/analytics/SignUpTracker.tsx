"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/gtm";

export default function SignUpTracker() {
  const router = useRouter();

  useEffect(() => {
    trackEvent("sign_up");

    // Remove the one-time marker so a refresh doesn't count another signup.
    router.replace("/profile");
  }, [router]);

  return null;
}
