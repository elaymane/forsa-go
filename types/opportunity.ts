import type { LucideIcon } from "lucide-react";

export type OpportunityType =
  | "Concours"
  | "Job"
  | "Internship"
  | "Training"
  | "Scholarship";

export type OpportunityStatus = "open" | "closed";

export const EDUCATION_LEVELS = ["Bac", "Bac+2", "Bac+3", "Bac+5", "Bac+6", "Other"] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  location: string;
  type: OpportunityType;
  status: OpportunityStatus;
  deadline: string;
  daysLeft: number;
  date: string;
  description: string;
  tags: string[];
  image: string;
  featured?: boolean;
  /** Required education level to apply — not every opportunity sets one. */
  level?: EducationLevel | null;
  /** Field of study / specialization (تخصص) — applies to any offer type. */
  specialization?: string | null;
  /** CDI/CDD for a Job-type listing — a real distinction from "type", not just a relabeling of "Job". */
  contractType?: "CDI" | "CDD" | "Fonction publique" | null;
  /** Grade or rank (الدرجة) — e.g. a civil-service grade or job seniority level. */
  grade?: string | null;
  /** Number of open positions (عدد المناصب), if announced. */
  positionsCount?: number | null;
  /** Official website / source link, if provided. */
  website?: string | null;
  /** Real written-exam date, if the admin knows it yet (ISO date string). */
  examDate?: string | null;
  /** Real oral-exam date, if the admin knows it yet (ISO date string). */
  oralExamDate?: string | null;
  /** Real application deadline, if the admin knows it yet (ISO date string). */
  deadlineDate?: string | null;
  /** False for a user's private personal-tracking submission, until an admin promotes it. */
  isPublic?: boolean;
  /** The user who submitted this privately, if it wasn't added by an admin. */
  createdByUserId?: string | null;
  /** When this opportunity was first added — used for "last updated"/"joined" info on organization pages. */
  createdAt?: string;
  updatedAt?: string;
  /** Admin-set SEO keywords, comma-separated — powers this opportunity's own detail page metadata. */
  keywords?: string | null;
  /** Optional sub-positions for a multi-role listing — shown as separate clickable profiles instead of one combined description. */
  profiles?: OpportunityProfile[] | null;
}

/** One role within a multi-position listing (e.g. "Chef d'Agence Adjoint — Berkane"). */
export interface OpportunityProfile {
  title: string;
  location?: string;
  level?: string;
  specialty?: string;
  positionsCount?: number;
  /** Responsibilities — a real list, shown as a checklist, not one paragraph. */
  missions: string[];
  /** What's required for this specific role — kept separate from missions on purpose. */
  requirements: string[];
}

export type PipelineStageKey =
  | "saved"
  | "applied"
  | "written"
  | "oral"
  | "accepted";

/** The full lifecycle of a single application, including the terminal "withdrawn" state. */
export type ApplicationStage = Exclude<PipelineStageKey, "saved"> | "rejected";

/** Order an application moves through — used to compute "next step" and stepper progress. */
export const STAGE_ORDER: ApplicationStage[] = ["applied", "written", "oral", "accepted"];

export const STAGE_LABELS: Record<Exclude<ApplicationStage, "rejected">, string> = {
  applied: "Applied",
  written: "Written Exam",
  oral: "Oral Exam",
  accepted: "Accepted",
};

export interface PipelineStage {
  key: PipelineStageKey;
  label: string;
  subtitle: string;
  count: number;
  icon: LucideIcon;
  gradient: string;
}

export type TimelinePhaseStatus = "done" | "active" | "waiting";

export interface TimelineEvent {
  id: string;
  opportunity: string;
  organization: string;
  phase: string;
  date: string;
  daysLeft: number;
}

export interface StatDefinition {
  id: string;
  title: string;
  value: number;
  trend?: string;
  note: string;
  icon: LucideIcon;
  tone: "primary" | "info" | "success" | "warning" | "danger";
  isLink?: boolean;
}
