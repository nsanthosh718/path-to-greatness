"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export default function PointsBadge({ balance }: { balance: number }) {
  const count = useMotionValue(balance);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(balance);
  const [pop, setPop] = useState(0);
  const prevBalance = useRef(balance);

  useEffect(() => {
    const controls = animate(count, balance, { duration: 0.6, ease: "easeOut" });
    if (balance > prevBalance.current) setPop((p) => p + 1);
    prevBalance.current = balance;
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance]);

  useEffect(() => rounded.on("change", (v) => setDisplay(v)), [rounded]);

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-display font-bold text-sm">
      <motion.span
        key={pop}
        animate={{ scale: [1, 1.5, 1], rotate: [0, -20, 20, 0] }}
        transition={{ duration: 0.5 }}
      >
        ⭐
      </motion.span>
      {display} pts
    </span>
  );
}
