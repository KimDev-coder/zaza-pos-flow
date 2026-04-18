import { motion } from "framer-motion";
import { ChefHat, Sparkles, ArrowRight } from "lucide-react";

interface SplashProps {
  onDone: () => void;
}

export const Splash = ({ onDone }: SplashProps) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between overflow-hidden gradient-mesh px-8 py-12 safe-bottom"
    >
      {/* Animated orbs */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-primary-glow/40 blur-3xl" />
        <div className="absolute right-10 bottom-32 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      </motion.div>

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: [0, 1, 0], y: [-20, -120], x: Math.sin(i) * 40 }}
          transition={{ duration: 2.5, delay: i * 0.3, repeat: Infinity, ease: "easeOut" }}
          className="absolute"
          style={{ left: `${20 + i * 12}%`, top: "55%" }}
        >
          <Sparkles size={14} className="text-white/60" />
        </motion.div>
      ))}

      {/* Spacer top */}
      <div />

      {/* Center: Logo + welcome */}
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0.4)", "0 0 0 30px rgba(255,255,255,0)"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-[32px]"
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-white shadow-pop">
            <ChefHat size={44} className="text-primary" strokeWidth={2.4} />
          </div>
        </div>

        <h1
          className="mt-6 text-5xl font-black tracking-tight text-white"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          Zaza Food
        </h1>
        <p className="mt-2 text-sm font-semibold tracking-wide text-white/90">
          Bujumbura • Bwiza
        </p>

        {/* Floating animated welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 180, damping: 18 }}
          className="relative mt-10"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative rounded-[28px] bg-white/15 px-6 py-4 backdrop-blur-xl ring-1 ring-white/30 shadow-pop"
          >
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -inset-px rounded-[28px] bg-gradient-to-r from-white/0 via-white/40 to-white/0 blur-md"
            />
            <p
              className="relative text-center text-base font-extrabold tracking-tight text-white"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              ✨ Assalam Aleykum
            </p>
            <p className="relative mt-1 text-center text-sm font-semibold text-white/95">
              Karibu sana Mabuja 🌿
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* CTA bottom */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="relative z-10 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-extrabold tracking-tight text-primary shadow-pop transition hover:shadow-glow"
      >
        Commencer <ArrowRight size={16} strokeWidth={3} />
      </motion.button>
    </motion.div>
  );
};
