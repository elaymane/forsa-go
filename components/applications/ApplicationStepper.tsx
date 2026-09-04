import { Check, Send, FileText, Mic, Trophy } from "lucide-react";
import { STAGE_ORDER, type ApplicationStage } from "@/types/opportunity";

const STEPS: Array<{ key: (typeof STAGE_ORDER)[number]; label: string; icon: typeof Send }> = [
  { key: "applied", label: "Submitted", icon: Send },
  { key: "written", label: "Written Exam", icon: FileText },
  { key: "oral", label: "Oral Exam", icon: Mic },
  { key: "accepted", label: "Final Decision", icon: Trophy },
];

export default function ApplicationStepper({ stage }: { stage: ApplicationStage }) {
  if (stage === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
        This application was withdrawn.
      </div>
    );
  }

  const currentIndex = STAGE_ORDER.indexOf(stage);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isPending = i > currentIndex;

        return (
          <div key={step.key} className={`flex items-center ${i < STEPS.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                  isDone
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCurrent
                    ? "border-purple-500 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
                    : "border-black/10 bg-black/5 text-gray-400 dark:border-white/10 dark:bg-white/5 dark:text-gray-500"
                }`}
              >
                {isDone ? <Check size={16} /> : <Icon size={15} />}
              </div>
              <span
                className={`whitespace-nowrap text-center text-[11px] ${
                  isPending ? "text-gray-400 dark:text-gray-500" : "font-medium"
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-0.5 flex-1 ${isDone ? "bg-emerald-500" : "bg-black/10 dark:bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
