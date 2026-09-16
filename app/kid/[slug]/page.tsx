"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { todayIso } from "@/lib/date";
import type { Chore, FamilyMember, PointBalance, ScheduleItem } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import ChoreChecklist from "@/components/ChoreChecklist";
import PointsBadge from "@/components/PointsBadge";

export default function KidTodayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date(), []);
  const dow = today.getDay();
  const dateIso = todayIso(today);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function load() {
      const { data: memberRow } = await supabase
        .from("family_members")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!memberRow) {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
        return;
      }
      if (cancelled) return;
      setMember(memberRow as FamilyMember);

      const [{ data: scheduleRows }, { data: choreRows }] = await Promise.all([
        supabase
          .from("schedule_items")
          .select("*")
          .eq("family_member_id", memberRow.id)
          .contains("days_of_week", [dow])
          .order("start_time", { ascending: true }),
        supabase
          .from("chores")
          .select("*")
          .eq("family_member_id", memberRow.id)
          .contains("days_of_week", [dow])
          .order("sort_order", { ascending: true }),
      ]);

      if (cancelled) return;
      setSchedule((scheduleRows as ScheduleItem[]) ?? []);
      setChores((choreRows as Chore[]) ?? []);

      const choreIds = (choreRows ?? []).map((c) => c.id);
      if (choreIds.length > 0) {
        const { data: completions } = await supabase
          .from("chore_completions")
          .select("chore_id")
          .eq("completion_date", dateIso)
          .in("chore_id", choreIds);
        if (!cancelled) {
          setCompletedIds(new Set((completions ?? []).map((c) => c.chore_id as string)));
        }
      }

      const { data: balanceRow } = await supabase
        .from("point_balances")
        .select("*")
        .eq("family_member_id", memberRow.id)
        .maybeSingle();
      if (!cancelled) {
        setBalance((balanceRow as PointBalance | null)?.balance ?? 0);
        setLoading(false);
      }
    }

    load();

    const channel = supabase
      .channel(`kid-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "chore_completions" }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function toggleChore(chore: Chore, done: boolean) {
    // Optimistic update so a tap feels instant on a shared tablet.
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (done) next.add(chore.id);
      else next.delete(chore.id);
      return next;
    });
    setBalance((b) => b + (done ? chore.points : -chore.points));

    if (done) {
      await supabase.from("chore_completions").insert({ chore_id: chore.id, completion_date: dateIso });
    } else {
      await supabase
        .from("chore_completions")
        .delete()
        .eq("chore_id", chore.id)
        .eq("completion_date", dateIso);
    }
  }

  if (!isSupabaseConfigured) return <SetupNotice />;

  if (notFound) {
    return (
      <div className="text-center mt-12">
        <p className="text-slate-500 mb-4">No family member found for &quot;{slug}&quot;.</p>
        <Link href="/" className="text-brand-600 font-medium">
          ← Back home
        </Link>
      </div>
    );
  }

  if (loading || !member) {
    return <p className="text-center text-slate-400 mt-12">Loading...</p>;
  }

  const isYoung = (member.age ?? 99) <= 6;
  const weekdayLabel = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{member.avatar_emoji}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{member.name}&apos;s Day</h1>
            <p className="text-slate-400">{weekdayLabel}</p>
          </div>
        </div>
        <PointsBadge balance={balance} />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-3">📋 Today&apos;s Schedule</h2>
        <ScheduleTimeline items={schedule} large={isYoung} />
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3">🧹 Today&apos;s Chores</h2>
        <ChoreChecklist chores={chores} completedIds={completedIds} onToggle={toggleChore} large={isYoung} />
      </section>
    </div>
  );
}
