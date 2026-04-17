import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ChefHat, Sparkles } from "lucide-react";

interface SplashProps {
  onDone: () => void;
}

export const Splash = ({ onDone }: SplashProps) => {
  const [phase, setPhase] = useState(0); // 0: logo, 1: tagline, 2: out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1100);
    const t2 = setTimeout(() => setPhase(2), 2200);
    const t3 = setTimeout(() => onDone(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden gradient-mesh"
        >
          {/* Animated orbs */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.4 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute h-[500px] w-[500px] rounded-full bg-white/20 blur-3xl"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-primary-glow/40 blur-3xl" />
            <div className="absolute right-10 bottom-32 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          </motion.div>

          {/* Floating sparkles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -120],
                x: Math.sin(i) * 40,
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.3,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute"
              style={{
                left: `${20 + i * 12}%`,
                top: "60%",
              }}
            >
              <Sparkles size={14} className="text-white/60" />
            </motion.div>
          ))}

          <div className="relative flex flex-col items-center px-8">
            {/* Logo mark */}
            <motion.div
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="relative"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(255,255,255,0.4)",
                    "0 0 0 30px rgba(255,255,255,0)",
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-[32px]"
              />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-pop">
                <ChefHat size={44} className="text-primary" strokeWidth={2.4} />
              </div>
            </motion.div>

            {/* Wordmark */}
            <div className="mt-6 overflow-hidden">
              <motion.h1
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl font-black tracking-tight text-white"
                style={{ fontFamily: "Sora, sans-serif" }}
              >
                Zaza Food
              </motion.h1>
            </div>

            {/* Tagline */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.p
                  initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.5 }}
                  className="mt-3 text-sm font-semibold tracking-wide text-white/90"
                >
                  Bujumbura • Bwiza
                </motion.p>
              )}
            </AnimatePresence>

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 flex items-center gap-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  className="h-1.5 w-1.5 rounded-full bg-white"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
