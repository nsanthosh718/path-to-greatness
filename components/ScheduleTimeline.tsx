"use client";

import { CATEGORY_STYLES, ScheduleItem } from "@/lib/types";
import { formatTime, nowMinutes, timeToMinutes } from "@/lib/date";

export default function ScheduleTimeline({
  items,
  large = false,
}: {
  items: ScheduleItem[];
  large?: boolean;
}) {
  const now = nowMinutes();

  return (
    <ol className="space-y-2">
      {items.map((item) => {
        const start = timeToMinutes(item.start_time);
        const end = timeToMinutes(item.end_time);
        const isNow = now >= start && now < end;
        const isPast = now >= end;
        const style = CATEGORY_STYLES[item.category];

        return (
          <li
            key={item.id}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
              isNow
                ? `${style.bg} ${style.ring} ring-2 shadow-sm`
                : isPast
                ? "bg-slate-50 border-slate-100 opacity-60"
                : "bg-white border-slate-200"
            }`}
          >
            <span className={large ? "text-4xl" : "text-2xl"}>{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-slate-900 ${large ? "text-xl" : "text-base"} truncate`}>
                {item.title}
              </p>
              <p className="text-slate-400 text-sm">
                {formatTime(item.start_time)} – {formatTime(item.end_time)}
              </p>
            </div>
            {isNow && (
              <span className="text-xs font-bold uppercase tracking-wide text-slate-700 bg-white/70 px-2 py-1 rounded-full">
                Now
              </span>
            )}
            {isPast && <span className="text-emerald-500 text-xl">✓</span>}
          </li>
        );
      })}
      {items.length === 0 && (
        <li className="text-center text-slate-400 py-6">Nothing scheduled — add items from Parent Admin.</li>
      )}
    </ol>
  );
}
