"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { todayIso } from "@/lib/date";
import { bigCelebration } from "@/lib/celebrate";
import type { Chore, FamilyMember, PointBalance, ScheduleItem } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";
import ScheduleTimeline from "@/components/ScheduleTimeline";
import ChoreChecklist from "@/components/ChoreChecklist";
import PointsBadge from "@/components/PointsBadge";
import Mascot from "@/components/Mascot";

export default function KidTodayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [member, setMember] = useState<FamilyMember | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const initializedRef = useRef(false);
  const prevAllDoneRef = useRef(false);

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

  const allChoresDone = chores.length > 0 && chores.every((c) => completedIds.has(c.id));

  useEffect(() => {
    if (loading) return;
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevAllDoneRef.current = allChoresDone;
      return;
    }
    const justCompleted = allChoresDone && !prevAllDoneRef.current;
    prevAllDoneRef.current = allChoresDone;
    if (!justCompleted) return;

    setCelebrateKey((k) => k + 1);
    setShowBanner(true);
    bigCelebration();
    const t = setTimeout(() => setShowBanner(false), 3200);
    return () => clearTimeout(t);
  }, [allChoresDone, loading]);

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
    <div className="relative">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-400 to-pink-400 text-white font-display font-bold text-lg px-6 py-3 rounded-full shadow-lg"
          >
            🎉 All chores done — amazing job, {member.name}!
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between flex-wrap gap-3 mb-6"
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl"
          >
            {member.avatar_emoji}
          </motion.span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
              {member.name}&apos;s Day
            </h1>
            <p className="text-slate-400">{weekdayLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PointsBadge balance={balance} />
          <Mascot size={64} celebrateKey={celebrateKey} say={showBanner ? "Woohoo!" : undefined} />
        </div>
      </motion.div>

      <section className="mb-8">
        <h2 className="text-lg font-display font-bold text-slate-800 mb-3">📋 Today&apos;s Schedule</h2>
        <ScheduleTimeline items={schedule} large={isYoung} />
      </section>

      <section>
        <h2 className="text-lg font-display font-bold text-slate-800 mb-3">🧹 Today&apos;s Chores</h2>
        <ChoreChecklist chores={chores} completedIds={completedIds} onToggle={toggleChore} large={isYoung} />
      </section>
    </div>
  );
}
