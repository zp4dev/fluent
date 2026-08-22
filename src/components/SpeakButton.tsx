"use client";

import { useCallback, useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n/context";
import { fmt } from "@/lib/i18n/format";

// NOTE: This mirrors lucide-react's `Volume2` icon inline so the feature works
// without the dependency installed. To use the real icon later, replace the
// `VolumeIcon` below with `import { Volume2 } from "lucide-react";` and render
// `<Volume2 size={size} strokeWidth={2} aria-hidden="true" />`.
function VolumeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

interface SpeakButtonProps {
  text: string;
  size?: number;
  className?: string;
  label?: string;
}

export default function SpeakButton({
  text,
  size = 16,
  className = "",
  label,
}: SpeakButtonProps) {
  const { t } = useI18n();
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reset speaking state if the component unmounts mid-utterance.
  useEffect(() => {
    return () => {
      setIsSpeaking(false);
    };
  }, []);

  const handleSpeak = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent triggering parent handlers (e.g. flip cards).
      event.stopPropagation();

      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window) ||
        !text.trim()
      ) {
        return;
      }

      const synth = window.speechSynthesis;

      // Cancel anything already speaking so taps don't overlap.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      synth.speak(utterance);
    },
    [text],
  );

  return (
    <button
      type="button"
      onClick={handleSpeak}
      aria-label={label ?? fmt(t.speak.aria, { text })}
      title={t.speak.title}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full p-1.5 text-primary transition ease-smooth hover:bg-highlight hover:text-primary-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isSpeaking ? "animate-pulse bg-highlight" : ""
      } ${className}`}
    >
      <VolumeIcon size={size} />
    </button>
  );
}
