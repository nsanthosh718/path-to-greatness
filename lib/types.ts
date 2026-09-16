export type Category = "routine" | "school" | "meal" | "chore" | "play" | "sleep";

export interface FamilyMember {
  id: string;
  slug: string;
  name: string;
  age: number | null;
  role: "kid" | "parent";
  avatar_emoji: string;
  color: string;
  sort_order: number;
}

export interface ScheduleItem {
  id: string;
  family_member_id: string;
  days_of_week: number[];
  start_time: string; // "HH:MM:SS"
  end_time: string;
  title: string;
  icon: string;
  category: Category;
  sort_order: number;
}

export interface Chore {
  id: string;
  family_member_id: string;
  title: string;
  icon: string;
  points: number;
  days_of_week: number[];
  sort_order: number;
}

export interface ChoreCompletion {
  id: string;
  chore_id: string;
  completion_date: string; // "YYYY-MM-DD"
  completed_at: string;
}

export interface Reward {
  id: string;
  family_member_id: string | null;
  title: string;
  icon: string;
  points_cost: number;
  sort_order: number;
}

export interface RewardRedemption {
  id: string;
  reward_id: string;
  family_member_id: string;
  points_spent: number;
  redeemed_at: string;
}

export interface PointBalance {
  family_member_id: string;
  slug: string;
  name: string;
  balance: number;
}

export const CATEGORY_STYLES: Record<Category, { bg: string; text: string; ring: string }> = {
  routine: { bg: "bg-slate-100", text: "text-slate-700", ring: "ring-slate-300" },
  school: { bg: "bg-indigo-100", text: "text-indigo-700", ring: "ring-indigo-300" },
  meal: { bg: "bg-amber-100", text: "text-amber-700", ring: "ring-amber-300" },
  chore: { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-300" },
  play: { bg: "bg-sky-100", text: "text-sky-700", ring: "ring-sky-300" },
  sleep: { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-300" },
};

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
