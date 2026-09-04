import { Users, Link2, Eye, ArrowRight } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

export default function ManagerFeature({ locale }: { locale: Locale }) {
  const fr = locale === "fr";

  const steps = [
    {
      icon: Link2,
      title: fr ? "Partagez votre code" : "Share your code",
      body: fr
        ? "Chaque personne que vous suivez entre votre code unique lors de son inscription — ou le lie plus tard depuis son profil."
        : "Everyone you're tracking enters your unique code at signup — or links it later from their profile.",
    },
    {
      icon: Eye,
      title: fr ? "Suivez tout, en un endroit" : "See everything, in one place",
      body: fr
        ? "Basculez entre chaque compte lié et voyez exactement où en est chaque candidature, concours et échéance."
        : "Switch between every linked account and see exactly where each application, concours and deadline stands.",
    },
    {
      icon: Users,
      title: fr ? "Postulez pour eux" : "Apply on their behalf",
      body: fr
        ? "Suivez, postulez et faites avancer chaque étape directement — pas seulement en spectateur."
        : "Track, apply, and advance every stage directly for them — not just watching from the sidelines.",
    },
  ];

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-purple-500">
              <Users size={14} /> {fr ? "Pour les coachs et les parents" : "For coaches and parents"}
            </p>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {fr ? "Suivez plusieurs personnes à la fois" : "Track several people at once"}
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {fr
                ? "Vous gérez la préparation aux concours de plusieurs personnes — un centre d'orientation, un coach, ou un parent qui suit plusieurs enfants pendant la saison des concours ? Un compte Manager vous donne une vue d'ensemble réelle, avec la possibilité d'agir directement pour chacun."
                : "Managing concours prep for more than one person — an orientation center, a coach, or a parent tracking several kids through concours season? A Manager account gives you a real overview, with the ability to act directly for each one."}
            </p>
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <a
          href="#pricing"
          className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:underline dark:text-purple-400"
        >
          {fr ? "Voir les tarifs Manager" : "See Manager pricing"} <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}
