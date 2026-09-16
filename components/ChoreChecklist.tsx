"use client";

import { Chore } from "@/lib/types";

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
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {chores.map((chore) => {
        const done = completedIds.has(chore.id);
        return (
          <li key={chore.id}>
            <button
              onClick={() => onToggle(chore, !done)}
              className={`w-full flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                done
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <span
                className={`flex items-center justify-center rounded-full border-2 shrink-0 ${
                  large ? "w-9 h-9 text-lg" : "w-7 h-7 text-sm"
                } ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 text-transparent"}`}
              >
                ✓
              </span>
              <span className={large ? "text-3xl" : "text-xl"}>{chore.icon}</span>
              <span className="flex-1">
                <span className={`block font-semibold text-slate-900 ${large ? "text-lg" : "text-base"}`}>
                  {chore.title}
                </span>
                <span className="text-amber-600 text-sm font-medium">+{chore.points} pts</span>
              </span>
            </button>
          </li>
        );
      })}
      {chores.length === 0 && (
        <li className="col-span-full text-center text-slate-400 py-6">
          No chores yet — add some from Parent Admin.
        </li>
      )}
    </ul>
  );
}
