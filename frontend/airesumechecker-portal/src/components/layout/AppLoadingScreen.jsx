import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2 } from "lucide-react";
import AILogo from "./AILogo";

export function AppLoadingScreen() {
  const [showColdBootMessage, setShowColdBootMessage] = useState(false);

  useEffect(() => {
    // Only show cold boot message if loading takes longer than 4 seconds
    const timer = setTimeout(() => {
      setShowColdBootMessage(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--bg)] p-6 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Animated Brand Logo */}
        <div className="mb-6 scale-110">
          <AILogo />
        </div>

        {/* Brand Title */}
        <h2 className="font-display text-xl font-semibold tracking-tight text-[var(--ink)]">
          AI Resume Roaster
        </h2>

        {/* Loading Spinner & Status */}
        <div className="flex items-center gap-2.5 mt-3 text-xs text-[var(--ink-muted)]">
          <Loader2 size={15} className="animate-spin text-[var(--accent)]" />
          <span>Initializing workspace...</span>
        </div>

        {/* Cold Start Banner — ONLY appears if loading exceeds 4 seconds */}
        <AnimatePresence>
          {showColdBootMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mt-8 p-4 rounded-2xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-left shadow-card"
            >
              <div className="flex items-start gap-3">
                <Zap className="h-4 w-4 shrink-0 text-amber-500 animate-pulse mt-0.5" />
                <div>
                  <span className="font-semibold block text-amber-900 dark:text-amber-100 mb-1">
                    Waking up cloud server...
                  </span>
                  <p className="text-amber-800/90 dark:text-amber-200/90 leading-relaxed text-[11px]">
                    The free backend instance is spinning up from sleep mode (Render free tier). This takes ~20–30 seconds on the first load.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
