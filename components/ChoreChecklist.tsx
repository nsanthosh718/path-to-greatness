"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import { Chore } from "@/lib/types";
import { burstAt } from "@/lib/celebrate";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 22 } },
};

export default function ChoreChecklist({
  chores,
  completedIds,
  onToggle,
  large = false,
}: {
  chores: Chore[];
  completedIds: Set<string>;
  onToggle: (chore: Chore, done: boolean) => void;
  large?: boolean;
}) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>, chore: Chore, done: boolean) {
    if (!done) burstAt(e.clientX, e.clientY);
    onToggle(chore, !done);
  }

  return (
    <motion.ul
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {chores.map((chore) => {
        const done = completedIds.has(chore.id);
        return (
          <motion.li key={chore.id} variants={itemVariants} layout>
            <motion.button
              onClick={(e) => handleClick(e, chore, done)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                done
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`relative flex items-center justify-center rounded-full border-2 shrink-0 overflow-hidden ${
                  large ? "w-9 h-9 text-lg" : "w-7 h-7 text-sm"
                } ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}
              >
                <AnimatePresence>
                  {done && (
                    <motion.span
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <motion.span
                animate={done ? { rotate: [0, -12, 12, -6, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
                className={large ? "text-3xl" : "text-xl"}
              >
                {chore.icon}
              </motion.span>
              <span className="flex-1">
                <span className={`block font-display font-semibold text-slate-900 ${large ? "text-lg" : "text-base"}`}>
                  {chore.title}
                </span>
                <span className="text-amber-600 text-sm font-medium">+{chore.points} pts</span>
              </span>
            </motion.button>
          </motion.li>
        );
      })}
      {chores.length === 0 && (
        <li className="col-span-full text-center text-slate-400 py-6">
          No chores yet — add some from Parent Admin.
        </li>
      )}
    </motion.ul>
  );
}
