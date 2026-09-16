"use client";

import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useFamilyMembers, usePointBalances } from "@/lib/hooks";
import SetupNotice from "@/components/SetupNotice";
import PointsBadge from "@/components/PointsBadge";

export default function HomePage() {
  const { members, loading } = useFamilyMembers();
  const { balances } = usePointBalances();

  if (!isSupabaseConfigured) return <SetupNotice />;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Who&apos;s checking in? 👋</h1>
        <p className="text-slate-500 mt-1">Tap your name to see today&apos;s schedule and chores.</p>
      </div>

      {loading && <p className="text-center text-slate-400">Loading family...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
        {members
          .filter((m) => m.role === "kid")
          .map((member) => (
            <Link
              key={member.id}
              href={`/kid/${member.slug}`}
              className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-sm border border-slate-200 p-8 hover:shadow-md hover:-translate-y-0.5 transition"
              style={{ borderTopWidth: 6, borderTopColor: member.color }}
            >
              <span className="text-6xl">{member.avatar_emoji}</span>
              <span className="text-2xl font-bold text-slate-900">{member.name}</span>
              {member.age !== null && (
                <span className="text-slate-400 text-sm">Age {member.age}</span>
              )}
              {balances[member.slug] && <PointsBadge balance={balances[member.slug].balance} />}
            </Link>
          ))}
      </div>

      {!loading && members.length === 0 && (
        <p className="text-center text-slate-400 mt-8">
          No family members yet — add some from Parent Admin, or run{" "}
          <span className="font-mono">supabase/seed.sql</span>.
        </p>
      )}

      <div className="flex justify-center gap-4 mt-10">
        <Link
          href="/week"
          className="px-5 py-3 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
        >
          📅 View Weekly Calendar
        </Link>
        <Link
          href="/rewards"
          className="px-5 py-3 rounded-xl bg-white border border-slate-200 font-medium text-slate-700 hover:bg-slate-50"
        >
          🏆 Rewards Store
        </Link>
      </div>
    </div>
  );
}
