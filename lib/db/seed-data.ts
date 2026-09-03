import type { Opportunity } from "@/types/opportunity";

/**
 * Generates a small colored "initials" placeholder as a data URI — used so
 * each seeded organization gets a distinct image instead of every entry
 * showing the same real ENSAM logo (which was confusing on non-ENSAM cards).
 */
function initialsLogo(initials: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" rx="28" fill="${color}"/><text x="50%" y="54%" font-family="Arial, sans-serif" font-size="84" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Rows used to populate the SQLite database on first run only
 * (see lib/db/schema.ts). Once seeded, the database — not this file —
 * is the source of truth. Edit data through the app or directly in
 * data/forsa-go.db afterwards.
 */
export const seedOpportunities: Opportunity[] = [
  {
    id: "ensam-concours-2024",
    title: "ENSAM Engineering School",
    organization: "Ministry of Higher Education",
    location: "Casablanca",
    type: "Concours",
    status: "open",
    deadline: "3 days left",
    daysLeft: 3,
    date: "May 25, 2024",
    description:
      "National engineering entrance exam for top Moroccan schools. Open to Bac+2 CPGE and university students.",
    tags: ["Concours", "Bac+2", "National"],
    image: "https://ensam-casa.ma/assets/img/logoENsam.png",
    featured: true,
  },
  {
    id: "ensam-rabat-2024",
    title: "ENSAM Rabat",
    organization: "Ministry of Higher Education",
    location: "Rabat",
    type: "Concours",
    status: "open",
    deadline: "2 days left",
    daysLeft: 2,
    date: "June 1, 2024",
    description: "Engineering entrance written exam for the Rabat campus.",
    tags: ["Concours", "Bac+2"],
    image: "https://ensam-casa.ma/assets/img/logoENsam.png",
  },
  {
    id: "ocp-data-science",
    title: "OCP Data Science Program",
    organization: "OCP Group",
    location: "Benguerir",
    type: "Internship",
    status: "open",
    deadline: "5 days left",
    daysLeft: 5,
    date: "May 30, 2024",
    description:
      "6-month data science internship working on production ML pipelines with the OCP digital team.",
    tags: ["Data", "Internship", "Bac+5"],
    image: initialsLogo("OCP", "#0F766E"),
  },
  {
    id: "oncf-recruitment",
    title: "ONCF Recruitment Campaign",
    organization: "ONCF",
    location: "Rabat",
    type: "Job",
    status: "open",
    deadline: "6 days left",
    daysLeft: 6,
    date: "June 3, 2024",
    description:
      "Open positions for junior engineers across signaling, infrastructure and rail operations.",
    tags: ["Engineering", "Public Sector"],
    image: initialsLogo("ONCF", "#1D4ED8"),
  },
  {
    id: "bam-scholarship",
    title: "Bank Al-Maghrib Excellence Scholarship",
    organization: "Bank Al-Maghrib",
    location: "Rabat",
    type: "Scholarship",
    status: "open",
    deadline: "9 days left",
    daysLeft: 9,
    date: "June 6, 2024",
    description:
      "Merit-based scholarship for top-ranked economics and finance students pursuing graduate studies abroad.",
    tags: ["Finance", "Scholarship", "Bac+3"],
    image: initialsLogo("BAM", "#4338CA"),
  },
  {
    id: "inpt-bootcamp",
    title: "INPT Summer AI Bootcamp",
    organization: "INPT",
    location: "Rabat",
    type: "Training",
    status: "open",
    deadline: "12 days left",
    daysLeft: 12,
    date: "June 9, 2024",
    description:
      "Intensive 3-week bootcamp covering applied machine learning, taught by INPT faculty and industry mentors.",
    tags: ["AI", "Training"],
    image: initialsLogo("INPT", "#7C3AED"),
  },
  {
    id: "emi-concours",
    title: "EMI National Concours",
    organization: "École Mohammadia d'Ingénieurs",
    location: "Rabat",
    type: "Concours",
    status: "closed",
    deadline: "Closed",
    daysLeft: 0,
    date: "April 12, 2024",
    description:
      "One of Morocco's most competitive engineering entrance exams — applications are now closed for this cycle.",
    tags: ["Concours", "National"],
    image: initialsLogo("EMI", "#334155"),
  },
  {
    id: "royal-air-maroc-internship",
    title: "Royal Air Maroc Graduate Internship",
    organization: "Royal Air Maroc",
    location: "Casablanca",
    type: "Internship",
    status: "open",
    deadline: "8 days left",
    daysLeft: 8,
    date: "June 5, 2024",
    description:
      "PFE internship track for final-year engineering students in operations and fleet planning.",
    tags: ["Internship", "Bac+5"],
    image: initialsLogo("RAM", "#0369A1"),
  },
];

export const seedNotifications = [
  {
    title: "New opportunity posted",
    description: "ONCF just opened its recruitment campaign.",
  },
  {
    title: "Deadline in 3 days",
    description: "ENSAM Engineering School closes soon — don't miss it.",
  },
  {
    title: "Welcome to Forsa Go",
    description: "Save, track and apply to opportunities from one place.",
  },
];
