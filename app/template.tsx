"use client";

import { motion } from "framer-motion";

// Runs on every route change (Next.js re-mounts `template.tsx` per navigation,
// unlike `layout.tsx`), giving each page a soft entrance instead of a hard cut.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
