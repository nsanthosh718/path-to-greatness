"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { CATEGORY_STYLES, ScheduleItem } from "@/lib/types";
import { formatTime, nowMinutes, timeToMinutes } from "@/lib/date";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function ScheduleTimeline({
  items,
  large = false,
}: {
  items: ScheduleItem[];
  large?: boolean;
}) {
  // Re-render periodically so the "Now" highlight advances on its own.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const now = nowMinutes();

  return (
    <motion.ol variants={listVariants} initial="hidden" animate="visible" className="space-y-2">
      {items.map((item) => {
        const start = timeToMinutes(item.start_time);
        const end = timeToMinutes(item.end_time);
        const isNow = now >= start && now < end;
        const isPast = now >= end;
        const style = CATEGORY_STYLES[item.category];

        return (
          <motion.li
            key={item.id}
            variants={itemVariants}
            layout
            className={`relative flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
              isNow
                ? `${style.bg} ${style.ring} ring-2 shadow-sm`
                : isPast
                ? "bg-slate-50 border-slate-100 opacity-60"
                : "bg-white border-slate-200"
            }`}
          >
            {isNow && (
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                animate={{
                  boxShadow: [
                    "0 0 0 0px rgba(56,189,248,0.35)",
                    "0 0 0 8px rgba(56,189,248,0)",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <motion.span
              animate={isNow ? { y: [0, -6, 0] } : { y: 0 }}
              transition={isNow ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined}
              className={large ? "text-4xl" : "text-2xl"}
            >
              {item.icon}
            </motion.span>
            <div className="flex-1 min-w-0">
              <p className={`font-display font-semibold text-slate-900 ${large ? "text-xl" : "text-base"} truncate`}>
                {item.title}
              </p>
              <p className="text-slate-400 text-sm">
                {formatTime(item.start_time)} – {formatTime(item.end_time)}
              </p>
            </div>
            {isNow && (
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-xs font-bold uppercase tracking-wide text-slate-700 bg-white/70 px-2 py-1 rounded-full"
              >
                Now
              </motion.span>
            )}
            <AnimatePresence>
              {isPast && (
                <motion.span
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="text-emerald-500 text-xl"
                >
                  ✓
                </motion.span>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
      {items.length === 0 && (
        <li className="text-center text-slate-400 py-6">Nothing scheduled — add items from Parent Admin.</li>
      )}
    </motion.ol>
  );
}
