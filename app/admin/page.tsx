"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { DAY_NAMES } from "@/lib/types";
import type { Category, Chore, FamilyMember, Reward, ScheduleItem } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";

const CATEGORIES: Category[] = ["routine", "school", "meal", "chore", "play", "sleep"];

function DayToggles({
  days,
  onChange,
}: {
  days: number[];
  onChange: (days: number[]) => void;
}) {
  return (
    <div className="flex gap-1">
      {DAY_NAMES.map((label, dow) => {
        const active = days.includes(dow);
        return (
          <button
            key={dow}
            type="button"
            onClick={() =>
              onChange(active ? days.filter((d) => d !== dow) : [...days, dow].sort())
            }
            className={`w-8 h-8 rounded-full text-xs font-bold ${
              active ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-400"
            }`}
          >
            {label[0]}
          </button>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [chores, setChores] = useState<Chore[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function load() {
      const [{ data: m }, { data: s }, { data: c }, { data: r }] = await Promise.all([
        supabase.from("family_members").select("*").order("sort_order"),
        supabase.from("schedule_items").select("*").order("start_time"),
        supabase.from("chores").select("*").order("sort_order"),
        supabase.from("rewards").select("*").order("points_cost"),
      ]);
      setMembers((m as FamilyMember[]) ?? []);
      setScheduleItems((s as ScheduleItem[]) ?? []);
      setChores((c as Chore[]) ?? []);
      setRewards((r as Reward[]) ?? []);
      setActiveMemberId((prev) => prev ?? (m as FamilyMember[])?.[0]?.id ?? null);
      setLoading(false);
    }

    load();
  }, []);

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (loading) return <p className="text-center text-slate-400 mt-12">Loading admin...</p>;

  const activeMember = members.find((m) => m.id === activeMemberId) ?? null;

  // --- Family members -------------------------------------------------
  async function saveMember(id: string, patch: Partial<FamilyMember>) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    await supabase.from("family_members").update(patch).eq("id", id);
  }

  async function addKid() {
    const { data } = await supabase
      .from("family_members")
      .insert({ slug: `kid-${Date.now()}`, name: "New Kid", age: 8, role: "kid", avatar_emoji: "🙂", color: "#a3a3a3", sort_order: members.length + 1 })
      .select()
      .single();
    if (data) setMembers((prev) => [...prev, data as FamilyMember]);
  }

  // --- Schedule items ---------------------------------------------------
  async function addScheduleItem() {
    if (!activeMember) return;
    const { data } = await supabase
      .from("schedule_items")
      .insert({
        family_member_id: activeMember.id,
        days_of_week: [1, 2, 3, 4, 5],
        start_time: "09:00",
        end_time: "10:00",
        title: "New Activity",
        icon: "⏰",
        category: "routine",
        sort_order: 0,
      })
      .select()
      .single();
    if (data) setScheduleItems((prev) => [...prev, data as ScheduleItem]);
  }

  async function updateScheduleItem(id: string, patch: Partial<ScheduleItem>) {
    setScheduleItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    await supabase.from("schedule_items").update(patch).eq("id", id);
  }

  async function deleteScheduleItem(id: string) {
    setScheduleItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("schedule_items").delete().eq("id", id);
  }

  // --- Chores -------------------------------------------------------------
  async function addChore() {
    if (!activeMember) return;
    const { data } = await supabase
      .from("chores")
      .insert({
        family_member_id: activeMember.id,
        title: "New Chore",
        icon: "🧹",
        points: 5,
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        sort_order: 0,
      })
      .select()
      .single();
    if (data) setChores((prev) => [...prev, data as Chore]);
  }

  async function updateChore(id: string, patch: Partial<Chore>) {
    setChores((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    await supabase.from("chores").update(patch).eq("id", id);
  }

  async function deleteChore(id: string) {
    setChores((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("chores").delete().eq("id", id);
  }

  // --- Rewards --------------------------------------------------------------
  async function addReward() {
    const { data } = await supabase
      .from("rewards")
      .insert({ title: "New Reward", icon: "🎁", points_cost: 50, family_member_id: null })
      .select()
      .single();
    if (data) setRewards((prev) => [...prev, data as Reward]);
  }

  async function updateReward(id: string, patch: Partial<Reward>) {
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    await supabase.from("rewards").update(patch).eq("id", id);
  }

  async function deleteReward(id: string) {
    setRewards((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("rewards").delete().eq("id", id);
  }

  const memberSchedule = scheduleItems.filter((i) => i.family_member_id === activeMemberId);
  const memberChores = chores.filter((c) => c.family_member_id === activeMemberId);

  return (
    <div className="space-y-10 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mb-1">⚙️ Parent Admin</h1>
        <p className="text-slate-400">Edit names, the daily schedule, chores, and rewards. Changes sync live.</p>
      </div>

      {/* Family members */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Family Members</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
              <input
                value={m.avatar_emoji}
                onChange={(e) => saveMember(m.id, { avatar_emoji: e.target.value })}
                className="w-12 text-center text-xl border border-slate-200 rounded-lg py-1"
              />
              <input
                value={m.name}
                onChange={(e) => saveMember(m.id, { name: e.target.value })}
                className="flex-1 min-w-[120px] border border-slate-200 rounded-lg px-2 py-1"
              />
              <input
                type="number"
                value={m.age ?? ""}
                onChange={(e) => saveMember(m.id, { age: Number(e.target.value) })}
                className="w-16 border border-slate-200 rounded-lg px-2 py-1"
                title="Age"
              />
              <input
                type="color"
                value={m.color}
                onChange={(e) => saveMember(m.id, { color: e.target.value })}
                className="w-10 h-9 border border-slate-200 rounded-lg"
              />
              <span className="text-slate-300 text-xs font-mono">/{m.slug}</span>
            </div>
          ))}
          <button onClick={addKid} className="text-brand-600 font-medium text-sm">
            + Add family member
          </button>
        </div>
      </section>

      {/* Member picker for schedule + chores */}
      <div className="flex gap-2 flex-wrap">
        {members.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveMemberId(m.id)}
            className={`px-4 py-2 rounded-xl border font-medium ${
              activeMemberId === m.id
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-white border-slate-200 text-slate-600"
            }`}
          >
            {m.avatar_emoji} {m.name}
          </button>
        ))}
      </div>

      {/* Schedule editor */}
      {activeMember && (
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">{activeMember.name}&apos;s Schedule</h2>
          <div className="space-y-2">
            {memberSchedule.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                <input
                  value={item.icon}
                  onChange={(e) => updateScheduleItem(item.id, { icon: e.target.value })}
                  className="w-10 text-center border border-slate-200 rounded-lg py-1"
                />
                <input
                  value={item.title}
                  onChange={(e) => updateScheduleItem(item.id, { title: e.target.value })}
                  className="flex-1 min-w-[140px] border border-slate-200 rounded-lg px-2 py-1"
                />
                <input
                  type="time"
                  value={item.start_time.slice(0, 5)}
                  onChange={(e) => updateScheduleItem(item.id, { start_time: e.target.value })}
                  className="border border-slate-200 rounded-lg px-2 py-1"
                />
                <input
                  type="time"
                  value={item.end_time.slice(0, 5)}
                  onChange={(e) => updateScheduleItem(item.id, { end_time: e.target.value })}
                  className="border border-slate-200 rounded-lg px-2 py-1"
                />
                <select
                  value={item.category}
                  onChange={(e) => updateScheduleItem(item.id, { category: e.target.value as Category })}
                  className="border border-slate-200 rounded-lg px-2 py-1"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <DayToggles days={item.days_of_week} onChange={(days) => updateScheduleItem(item.id, { days_of_week: days })} />
                <button onClick={() => deleteScheduleItem(item.id)} className="text-red-500 text-sm ml-auto">
                  Delete
                </button>
              </div>
            ))}
            <button onClick={addScheduleItem} className="text-brand-600 font-medium text-sm">
              + Add schedule item
            </button>
          </div>
        </section>
      )}

      {/* Chores editor */}
      {activeMember && (
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">{activeMember.name}&apos;s Chores</h2>
          <div className="space-y-2">
            {memberChores.map((chore) => (
              <div key={chore.id} className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                <input
                  value={chore.icon}
                  onChange={(e) => updateChore(chore.id, { icon: e.target.value })}
                  className="w-10 text-center border border-slate-200 rounded-lg py-1"
                />
                <input
                  value={chore.title}
                  onChange={(e) => updateChore(chore.id, { title: e.target.value })}
                  className="flex-1 min-w-[140px] border border-slate-200 rounded-lg px-2 py-1"
                />
                <input
                  type="number"
                  value={chore.points}
                  onChange={(e) => updateChore(chore.id, { points: Number(e.target.value) })}
                  className="w-20 border border-slate-200 rounded-lg px-2 py-1"
                  title="Points"
                />
                <DayToggles days={chore.days_of_week} onChange={(days) => updateChore(chore.id, { days_of_week: days })} />
                <button onClick={() => deleteChore(chore.id)} className="text-red-500 text-sm ml-auto">
                  Delete
                </button>
              </div>
            ))}
            <button onClick={addChore} className="text-brand-600 font-medium text-sm">
              + Add chore
            </button>
          </div>
        </section>
      )}

      {/* Rewards editor */}
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Rewards Catalog</h2>
        <div className="space-y-2">
          {rewards.map((reward) => (
            <div key={reward.id} className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
              <input
                value={reward.icon}
                onChange={(e) => updateReward(reward.id, { icon: e.target.value })}
                className="w-10 text-center border border-slate-200 rounded-lg py-1"
              />
              <input
                value={reward.title}
                onChange={(e) => updateReward(reward.id, { title: e.target.value })}
                className="flex-1 min-w-[140px] border border-slate-200 rounded-lg px-2 py-1"
              />
              <input
                type="number"
                value={reward.points_cost}
                onChange={(e) => updateReward(reward.id, { points_cost: Number(e.target.value) })}
                className="w-20 border border-slate-200 rounded-lg px-2 py-1"
                title="Points cost"
              />
              <select
                value={reward.family_member_id ?? ""}
                onChange={(e) => updateReward(reward.id, { family_member_id: e.target.value || null })}
                className="border border-slate-200 rounded-lg px-2 py-1"
              >
                <option value="">Everyone</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} only
                  </option>
                ))}
              </select>
              <button onClick={() => deleteReward(reward.id)} className="text-red-500 text-sm ml-auto">
                Delete
              </button>
            </div>
          ))}
          <button onClick={addReward} className="text-brand-600 font-medium text-sm">
            + Add reward
          </button>
        </div>
      </section>
    </div>
  );
}
