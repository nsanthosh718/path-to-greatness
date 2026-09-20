"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { speak, speechSupported } from "@/lib/speech";

export default function SpeakButton({ text, large = false }: { text: string; large?: boolean }) {
  const [playing, setPlaying] = useState(false);

  if (!speechSupported()) return null;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    speak(text);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 1200);
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      animate={playing ? { scale: [1, 1.2, 1] } : {}}
      transition={{ duration: 0.4 }}
      aria-label="Read this aloud"
      className={`shrink-0 flex items-center justify-center rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 ${
        large ? "w-10 h-10 text-xl" : "w-8 h-8 text-base"
      }`}
    >
      🔊
    </motion.button>
  );
}
