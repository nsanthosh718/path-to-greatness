"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";

/**
 * Sunny — a hand-animated SVG mascot (no external Lottie/CDN assets), so it
 * always renders even if the wall tablet's wifi is flaky.
 */
export default function Mascot({
  size = 96,
  celebrateKey = 0,
  say,
  className = "",
}: {
  size?: number;
  /** Increment this number from the parent to trigger a one-off celebration burst. */
  celebrateKey?: number;
  say?: string;
  className?: string;
}) {
  const controls = useAnimationControls();
  const raysControls = useAnimationControls();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    controls.start({
      scale: [1, 1.35, 0.9, 1.2, 1],
      rotate: [0, -12, 10, -6, 0],
      y: [0, -28, 0, -10, 0],
      transition: { duration: 0.9, ease: "easeInOut" },
    });
    raysControls.start({
      rotate: [0, 360],
      transition: { duration: 0.9, ease: "linear" },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebrateKey]);

  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ width: size }}>
      {say && (
        <motion.div
          key={say}
          initial={{ opacity: 0, y: 6, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          className="mb-1 max-w-[160px] text-center rounded-2xl bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-md border border-slate-100"
        >
          {say}
        </motion.div>
      )}
      <motion.div
        animate={controls}
        initial={{ y: 0 }}
        style={{ width: size, height: size }}
        // Gentle idle bob, paused whenever a celebration animation takes over.
      >
        <motion.svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.g
            animate={raysControls}
            initial={{ rotate: 0 }}
            style={{ transformOrigin: "50px 50px" }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="47"
                y="2"
                width="6"
                height="16"
                rx="3"
                fill="#fbbf24"
                transform={`rotate(${i * 45} 50 50)`}
              />
            ))}
          </motion.g>
          <circle cx="50" cy="50" r="26" fill="#fde047" stroke="#f59e0b" strokeWidth="2" />
          <circle cx="41" cy="46" r="3.2" fill="#78350f" />
          <circle cx="59" cy="46" r="3.2" fill="#78350f" />
          <path
            d="M40 58 Q50 68 60 58"
            stroke="#78350f"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="33" cy="53" r="4" fill="#fb923c" opacity="0.6" />
          <circle cx="67" cy="53" r="4" fill="#fb923c" opacity="0.6" />
        </motion.svg>
      </motion.div>
    </div>
  );
}
