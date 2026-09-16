"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { formatTime, timeToMinutes } from "@/lib/date";
import { DAY_NAMES_LONG, FamilyMember, ScheduleItem } from "@/lib/types";
import SetupNotice from "@/components/SetupNotice";

export default function WeekPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().getDay();

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    async function load() {
      const [{ data: memberRows }, { data: itemRows }] = await Promise.all([
        supabase.from("family_members").select("*").order("sort_order", { ascending: true }),
        supabase.from("schedule_items").select("*").order("start_time", { ascending: true }),
      ]);
      if (cancelled) return;
      setMembers((memberRows as FamilyMember[]) ?? []);
      setItems((itemRows as ScheduleItem[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured) return <SetupNotice />;
  if (loading) return <p className="text-center text-slate-400 mt-12">Loading week...</p>;

  const memberById = Object.fromEntries(members.map((m) => [m.id, m]));

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">📅 This Week</h1>
      <p className="text-slate-400 mb-6">The whole family&apos;s schedule at a glance.</p>

      <div className="flex gap-4 mb-4 flex-wrap">
        {members.map((m) => (
          <span key={m.id} className="inline-flex items-center gap-2 text-sm text-slate-600">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
            {m.avatar_emoji} {m.name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 overflow-x-auto">
        {DAY_NAMES_LONG.map((name, dow) => {
          const dayItems = items
            .filter((i) => i.days_of_week.includes(dow))
            .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
          const isToday = dow === today;

          return (
            <div
              key={dow}
              className={`rounded-2xl border p-3 min-w-[220px] ${
                isToday ? "bg-brand-50 border-brand-300" : "bg-white border-slate-200"
              }`}
            >
              <p className={`font-bold mb-2 ${isToday ? "text-brand-700" : "text-slate-700"}`}>
                {name}
                {isToday && <span className="ml-1 text-xs font-medium">(today)</span>}
              </p>
              <ul className="space-y-2">
                {dayItems.map((item) => {
                  const member = memberById[item.family_member_id];
                  return (
                    <li
                      key={item.id}
                      className="rounded-lg px-2 py-1.5 text-xs bg-slate-50 border-l-4"
                      style={{ borderLeftColor: member?.color ?? "#94a3b8" }}
                    >
                      <p className="font-semibold text-slate-800 truncate">
                        {item.icon} {item.title}
                      </p>
                      <p className="text-slate-400">
                        {formatTime(item.start_time)} · {member?.avatar_emoji} {member?.name}
                      </p>
                    </li>
                  );
                })}
                {dayItems.length === 0 && <li className="text-slate-300 text-xs">Nothing scheduled</li>}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
