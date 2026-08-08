import type { OpportunityType } from "@/types/opportunity";

export const TYPE_ROUTES: Record<string, { type: OpportunityType; typeLabel: string; keywords: string[] }> = {
  concours: {
    type: "Concours",
    typeLabel: "Concours",
    keywords: [
      "concours maroc", "concours 2026", "concours fonction publique", "concours ministères",
      "concours police", "concours gendarmerie", "concours santé", "concours justice",
      "concours enseignement", "concours douane", "postuler concours", "inscription concours",
      "résultat concours", "date limite concours",
    ],
  },
  jobs: {
    type: "Job",
    typeLabel: "Jobs",
    keywords: [
      "emploi maroc", "offre d'emploi maroc", "emploi public", "emploi privé", "recrutement maroc",
      "emploi développeur", "emploi ingénieur", "emploi comptable", "emploi infirmier", "emploi médecin",
      "emploi enseignant", "emploi commercial", "emploi marketing", "emploi finance", "emploi RH",
      "emploi juridique", "emploi informatique", "emploi data analyst", "emploi cybersécurité",
      "emploi data science", "emploi IA", "emploi react", "emploi nextjs",
      "jobs in morocco", "government jobs morocco", "engineering jobs morocco",
    ],
  },
  internships: {
    type: "Internship",
    typeLabel: "Internships",
    keywords: [
      "stage maroc", "stage pfe", "stage fin d'études", "stage rémunéré", "stage informatique",
      "internships in morocco",
    ],
  },
  trainings: {
    type: "Training",
    typeLabel: "Trainings",
    keywords: ["formation maroc", "formation gratuite", "formation certifiante", "formation en ligne", "formation 2026"],
  },
  scholarships: {
    type: "Scholarship",
    typeLabel: "Scholarships",
    keywords: [
      "bourse maroc", "bourse france", "bourse canada", "bourse europe", "bourse 2026",
      "scholarships for moroccan students",
    ],
  },
};
