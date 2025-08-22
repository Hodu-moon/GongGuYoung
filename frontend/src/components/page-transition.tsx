import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/** 라우트 전환용 래퍼 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // 사용자 접근성: motion 선호 안 하면 애니메이션 최소화
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const variants = {
    initial: { opacity: 0, y: 8, filter: "blur(2px)" },
    enter:   { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.22 } },
    exit:    { opacity: 0, y: -8, filter: "blur(2px)", transition: { duration: 0.18 } },
  };

  return (
    <AnimatePresence mode="wait">
      {/* location.pathname을 key로 주면 경로 변경 때마다 트리거 */}
      <motion.div
        key={location.pathname + location.search}
        variants={prefersReduced ? undefined : variants}
        initial="initial"
        animate="enter"
        exit="exit"
        style={{ minHeight: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
