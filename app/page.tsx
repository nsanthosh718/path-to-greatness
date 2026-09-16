"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useFamilyMembers, usePointBalances } from "@/lib/hooks";
import SetupNotice from "@/components/SetupNotice";
import PointsBadge from "@/components/PointsBadge";
import Mascot from "@/components/Mascot";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 20 } },
};

export default function HomePage() {
  const { members, loading } = useFamilyMembers();
  const { balances } = usePointBalances();

  if (!isSupabaseConfigured) return <SetupNotice />;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-4 flex flex-col items-center"
      >
        <Mascot size={80} say="Hi there!" />
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 mt-2">
          Who&apos;s checking in? 👋
        </h1>
        <p className="text-slate-500 mt-1">Tap your name to see today&apos;s schedule and chores.</p>
      </motion.div>

      {loading && <p className="text-center text-slate-400">Loading family...</p>}

      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto"
      >
        {members
          .filter((m) => m.role === "kid")
          .map((member, i) => (
            <motion.div
              key={member.id}
              variants={cardVariants}
              whileHover={{ scale: 1.04, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href={`/kid/${member.slug}`}
                className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow"
                style={{ borderTopWidth: 6, borderTopColor: member.color }}
              >
                <motion.span
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                  className="text-6xl"
                >
                  {member.avatar_emoji}
                </motion.span>
                <span className="text-2xl font-display font-bold text-slate-900">{member.name}</span>
                {member.age !== null && <span className="text-slate-400 text-sm">Age {member.age}</span>}
                {balances[member.slug] && <PointsBadge balance={balances[member.slug].balance} />}
              </Link>
            </motion.div>
          ))}
      </motion.div>

      {!loading && members.length === 0 && (
        <p className="text-center text-slate-400 mt-8">
          No family members yet — add some from Parent Admin, or run{" "}
          <span className="font-mono">supabase/seed.sql</span>.
        </p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-center gap-4 mt-10"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/week"
            className="block px-5 py-3 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
          >
            📅 View Weekly Calendar
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/rewards"
            className="block px-5 py-3 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
          >
            🏆 Rewards Store
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
