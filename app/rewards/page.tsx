"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { usePointBalances } from "@/lib/hooks";
import { bigCelebration } from "@/lib/celebrate";
import type { FamilyMember, Reward } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";
import PointsBadge from "@/components/PointsBadge";
import Mascot from "@/components/Mascot";

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
};

export default function RewardsPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [mascotSay, setMascotSay] = useState<string | undefined>(undefined);
  const { balances } = usePointBalances();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function load() {
      const [{ data: memberRows }, { data: rewardRows }] = await Promise.all([
        supabase
          .from("family_members")
          .select("*")
          .eq("role", "kid")
          .order("sort_order", { ascending: true }),
        supabase.from("rewards").select("*").order("points_cost", { ascending: true }),
      ]);
      if (cancelled) return;
      const kids = (memberRows as FamilyMember[]) ?? [];
      setMembers(kids);
      setRewards((rewardRows as Reward[]) ?? []);
      setSelected((prev) => prev ?? kids[0]?.id ?? null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMember = members.find((m) => m.id === selected) ?? null;
  const balance = selectedMember ? balances[selectedMember.slug]?.balance ?? 0 : 0;
  const visibleRewards = rewards.filter(
    (r) => r.family_member_id === null || r.family_member_id === selected
  );

  async function redeem(reward: Reward) {
    const affordable = balance >= reward.points_cost;
    if (!selectedMember || !affordable) {
      setShakingId(reward.id);
      setTimeout(() => setShakingId(null), 500);
      return;
    }
    setRedeeming(reward.id);
    await supabase.from("reward_redemptions").insert({
      reward_id: reward.id,
      family_member_id: selectedMember.id,
      points_spent: reward.points_cost,
    });
    setRedeeming(null);
    setCelebrateKey((k) => k + 1);
    setMascotSay(`Enjoy your ${reward.title}!`);
    bigCelebration();
    setTimeout(() => setMascotSay(undefined), 3000);
  }

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (loading) return <p className="text-center text-slate-400 mt-12">Loading rewards...</p>;

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900"
        >
          🏆 Rewards Store
        </motion.h1>
        <Mascot size={56} celebrateKey={celebrateKey} say={mascotSay} />
      </div>
      <p className="text-slate-400 mb-6">Spend chore points on real rewards.</p>

      <div className="flex gap-3 mb-6 flex-wrap">
        {members.map((m) => (
          <motion.button
            key={m.id}
            onClick={() => setSelected(m.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${
              selected === m.id
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">{m.avatar_emoji}</span>
            {m.name}
          </motion.button>
        ))}
      </div>

      {selectedMember && (
        <div className="mb-6">
          <PointsBadge balance={balance} />
        </div>
      )}

      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {visibleRewards.map((reward) => {
          const affordable = balance >= reward.points_cost;
          return (
            <motion.div
              key={reward.id}
              variants={cardVariants}
              whileHover={affordable ? { y: -4, scale: 1.02 } : undefined}
              animate={shakingId === reward.id ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={shakingId === reward.id ? { duration: 0.4 } : undefined}
              className={`rounded-2xl border p-5 flex flex-col items-center text-center gap-2 ${
                affordable ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100"
              }`}
            >
              <motion.span
                animate={affordable ? { rotate: [0, -8, 8, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                className="text-4xl"
              >
                {reward.icon}
              </motion.span>
              <p className="font-display font-semibold text-slate-900">{reward.title}</p>
              <p className="text-amber-600 font-medium text-sm">{reward.points_cost} pts</p>
              <motion.button
                onClick={() => redeem(reward)}
                disabled={redeeming === reward.id}
                whileHover={affordable ? { scale: 1.04 } : undefined}
                whileTap={affordable ? { scale: 0.96 } : undefined}
                className={`mt-2 w-full py-2 rounded-xl font-medium text-sm ${
                  affordable
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {redeeming === reward.id ? "Redeeming..." : affordable ? "Redeem" : "Not enough points"}
              </motion.button>
            </motion.div>
          );
        })}
        {visibleRewards.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-6">
            No rewards yet — add some from Parent Admin.
          </p>
        )}
      </motion.div>
    </div>
  );
}
