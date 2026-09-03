import fs from "fs";
import path from "path";
import { t, type Locale } from "@/lib/i18n/translations";

// Drop real screenshot files into /public/screenshots using these exact
// names, and they'll appear here automatically — no code changes needed.
// Any of these that don't exist yet are simply skipped, not shown broken.
const EXPECTED_FILES = [
  { file: "dashboard.png", navKey: "dashboard" as const },
  { file: "opportunities.png", navKey: "opportunities" as const },
  { file: "applications.png", navKey: "applications" as const },
  { file: "calendar.png", navKey: "calendar" as const },
];

function getAvailableScreenshots() {
  const dir = path.join(process.cwd(), "public", "screenshots");
  return EXPECTED_FILES.filter((item) => {
    try {
      return fs.existsSync(path.join(dir, item.file));
    } catch {
      return false;
    }
  });
}

export default function ScreenshotsSection({ locale }: { locale: Locale }) {
  const available = getAvailableScreenshots();
  if (available.length === 0) return null; // nothing fake shown — just skip the section until real ones exist

  const i = t(locale).screenshots;
  const nav = t(locale).nav;

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{i.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {available.map((item) => {
            const label = nav[item.navKey];
            return (
              <div
                key={item.file}
                className="overflow-hidden rounded-2xl border border-black/10 shadow-lg dark:border-white/10"
              >
                <img src={`/screenshots/${item.file}`} alt={label} loading="lazy" decoding="async" className="w-full" />
                <div className="border-t border-black/5 bg-white/60 px-4 py-3 dark:border-white/5 dark:bg-white/5">
                  <p className="text-sm font-semibold">{label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
