"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRespectMotion } from "@/lib/motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { fade } = useRespectMotion();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fade}
    >
      {children}
    </motion.div>
  );
}
