import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrganizationSummary } from "@/lib/organizations";
import { t, type Locale } from "@/lib/i18n/translations";

export default function TrustedByOrgs({ organizations, locale }: { organizations: OrganizationSummary[]; locale: Locale }) {
  if (organizations.length === 0) return null;
  const i = t(locale).trustedBy;

  const top = organizations.slice(0, 7);

  return (
    <section className="px-6 sm:px-10">
      <div className="mx-auto max-w-5xl rounded-3xl border border-black/10 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-wide text-gray-400">{i.eyebrow}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {top.map((org) => (
            <Link
              key={org.slug}
              href={`/organizations/${org.slug}`}
              className="flex items-center gap-2 grayscale transition hover:grayscale-0"
            >
              <img src={org.image} alt={org.name} loading="lazy" decoding="async" className="h-7 w-7 rounded-md object-cover" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{org.name}</span>
            </Link>
          ))}
          <Link
            href="/organizations"
            className="flex items-center gap-1 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            {i.viewAll} <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
