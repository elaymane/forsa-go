const URL_SPLIT_PATTERN = /(https?:\/\/[^\s]+)/g;
const URL_TEST_PATTERN = /^https?:\/\//;

/**
 * Renders text with any http(s) URL turned into a real clickable link —
 * notification descriptions are plain strings in the database, so a URL
 * inside one (e.g. a WhatsApp contact link) would otherwise just show as
 * unclickable text.
 */
export default function LinkedText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(URL_SPLIT_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        URL_TEST_PATTERN.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`underline hover:text-purple-600 dark:hover:text-purple-400 ${className ?? ""}`}
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
