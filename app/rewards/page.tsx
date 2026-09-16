"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { usePointBalances } from "@/lib/hooks";
import type { FamilyMember, Reward } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";
import PointsBadge from "@/components/PointsBadge";

export default function RewardsPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
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
    if (!selectedMember || balance < reward.points_cost) return;
    setRedeeming(reward.id);
    await supabase.from("reward_redemptions").insert({
      reward_id: reward.id,
      family_member_id: selectedMember.id,
      points_spent: reward.points_cost,
    });
    setRedeeming(null);
  }

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (loading) return <p className="text-center text-slate-400 mt-12">Loading rewards...</p>;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">🏆 Rewards Store</h1>
      <p className="text-slate-400 mb-6">Spend chore points on real rewards.</p>

      <div className="flex gap-3 mb-6 flex-wrap">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelected(m.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium ${
              selected === m.id
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-xl">{m.avatar_emoji}</span>
            {m.name}
          </button>
        ))}
      </div>

      {selectedMember && (
        <div className="mb-6">
          <PointsBadge balance={balance} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRewards.map((reward) => {
          const affordable = balance >= reward.points_cost;
          return (
            <div
              key={reward.id}
              className={`rounded-2xl border p-5 flex flex-col items-center text-center gap-2 ${
                affordable ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100"
              }`}
            >
              <span className="text-4xl">{reward.icon}</span>
              <p className="font-semibold text-slate-900">{reward.title}</p>
              <p className="text-amber-600 font-medium text-sm">{reward.points_cost} pts</p>
              <button
                onClick={() => redeem(reward)}
                disabled={!affordable || redeeming === reward.id}
                className={`mt-2 w-full py-2 rounded-xl font-medium text-sm ${
                  affordable
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {redeeming === reward.id ? "Redeeming..." : affordable ? "Redeem" : "Not enough points"}
              </button>
            </div>
          );
        })}
        {visibleRewards.length === 0 && (
          <p className="col-span-full text-center text-slate-400 py-6">
            No rewards yet — add some from Parent Admin.
          </p>
        )}
      </div>
    </div>
  );
}
