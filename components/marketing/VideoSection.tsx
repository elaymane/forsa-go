import { Play } from "lucide-react";
import { t, type Locale } from "@/lib/i18n/translations";

export default function VideoSection({ locale }: { locale: Locale }) {
  const i = t(locale).video;
  const videoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL;

  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
        <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">{i.title}</h2>

        {videoUrl ? (
          <div className="overflow-hidden rounded-3xl border border-black/10 shadow-xl dark:border-white/10">
            <div className="aspect-video">
              <iframe
                src={videoUrl}
                title="Forsa Go demo"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-3xl border border-dashed border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.02]">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                <Play size={22} />
              </div>
              <p className="text-sm text-gray-400">{i.comingSoon}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
