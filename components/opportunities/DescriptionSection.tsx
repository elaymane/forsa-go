import { ListChecks, CheckCircle2 } from "lucide-react";

/**
 * Most descriptions are one or two sentences — those just render as plain
 * text. But many real listings (like OFPPT's multi-position concours) are a
 * short intro sentence followed by many "20 Formateurs en X." style lines.
 * When that pattern is detected, the itemized lines get a real checklist
 * treatment instead of sitting in one dense, boring paragraph.
 */
export default function DescriptionSection({ description }: { description: string }) {
  const lines = description
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Not enough lines to be worth a checklist — just render plain text as before.
  if (lines.length < 4) {
    return <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600 dark:text-gray-300">{description}</p>;
  }

  // The first line is treated as the real intro — everything after it becomes
  // checklist items. This matches how these multi-position listings are
  // actually written: one summary sentence, then each position on its own line.
  const [intro, ...items] = lines;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{intro}</p>
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-purple-500">
          <ListChecks size={13} /> Détails
        </p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-purple-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
