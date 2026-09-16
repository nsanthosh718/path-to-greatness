"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { FamilyMember, PointBalance } from "./types";

export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("family_members")
        .select("*")
        .order("sort_order", { ascending: true });
      if (!cancelled) {
        setMembers((data as FamilyMember[]) ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { members, loading };
}

export function usePointBalances() {
  const [balances, setBalances] = useState<Record<string, PointBalance>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data } = await supabase.from("point_balances").select("*");
      if (!cancelled && data) {
        const bySlug: Record<string, PointBalance> = {};
        for (const row of data as PointBalance[]) bySlug[row.slug] = row;
        setBalances(bySlug);
        setLoading(false);
      }
    }

    load();

    const channel = supabase
      .channel("points-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "chore_completions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reward_redemptions" }, load)
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { balances, loading };
}
