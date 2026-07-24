import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

/**
 * Automatically displays a friendly notice when an API request/loading state
 * takes longer than delayMs (default 2.5s).
 *
 * Perfect for free-tier hosting (Render cold starts).
 * When paid hosting is used, requests finish fast and this banner never appears.
 */
export function ColdStartNotice({
  loading,
  delayMs = 2500,
  message = "Backend server is waking up from sleep mode (Render free tier). This takes ~20-30 seconds on the first request...",
  className = "",
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => {
      setShow(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [loading, delayMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3 }}
          className={`flex items-start gap-3 p-3.5 rounded-2xl text-xs bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 ${className}`}
        >
          <Zap className="h-4 w-4 shrink-0 mt-0.5 text-amber-500 animate-pulse" />
          <div className="leading-relaxed">
            <span className="font-semibold block text-amber-800 dark:text-amber-200 mb-0.5">
              Server Waking Up
            </span>
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
