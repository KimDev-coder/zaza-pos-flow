import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ShoppingCart, Package, TrendingUp, ArrowRight, Check } from "lucide-react";

interface OnboardingProps {
  onDone: () => void;
}

const steps = [
  {
    icon: ShoppingCart,
    title: "Vendez en un instant",
    desc: "Encaissez vos clients avec un point de vente fluide. Cash, Mobile Money ou carte.",
    color: "from-primary to-primary-glow",
  },
  {
    icon: Package,
    title: "Maîtrisez votre stock",
    desc: "Suivez vos produits en temps réel. Recevez des alertes quand vos articles s'épuisent.",
    color: "from-primary-glow to-primary",
  },
  {
    icon: TrendingUp,
    title: "Pilotez votre business",
    desc: "Visualisez ventes, dépenses et bénéfices. Prenez des décisions éclairées chaque jour.",
    color: "from-primary-deep to-primary-glow",
  },
];

export const Onboarding = ({ onDone }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  const next = () => (isLast ? onDone() : setStep((s) => s + 1));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[90] flex flex-col bg-background"
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 aurora-bg" />
      <div className="pointer-events-none absolute -left-32 top-32 h-96 w-96 rounded-full opacity-50 blur-3xl"
           style={{ background: "radial-gradient(circle, hsl(var(--primary-glow) / 0.4), transparent 70%)" }} />
      <div className="pointer-events-none absolute -right-32 bottom-40 h-96 w-96 rounded-full opacity-40 blur-3xl"
           style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)" }} />

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-1.5">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 28 : 8,
                backgroundColor: i <= step ? "hsl(var(--primary))" : "hsl(var(--border))",
              }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="h-1.5 rounded-full"
            />
          ))}
        </div>
        {!isLast && (
          <button onClick={onDone} className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
            Passer
          </button>
        )}
      </div>

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon hero */}
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
              className="relative mb-8"
            >
              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-[40px] gradient-mesh"
              />
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.3, ease: "easeOut" }}
                className="absolute inset-0 rounded-[40px] gradient-mesh"
              />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-[40px] gradient-mesh shadow-pop">
                <Icon size={56} className="text-primary-foreground" strokeWidth={2.2} />
              </div>

              {/* Floating dots */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, Math.cos(i * 1.5) * 80],
                    y: [0, Math.sin(i * 1.5) * 80],
                  }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-primary"
                />
              ))}
            </motion.div>

            <motion.h2
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-extrabold tracking-tight text-balance"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              {current.title}
            </motion.h2>
            <motion.p
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted-foreground text-balance"
            >
              {current.desc}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="relative px-6 pb-10 safe-bottom">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl gradient-mesh py-4 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow transition hover:shadow-pop"
        >
          {isLast ? (
            <>
              Commencer <Check size={16} strokeWidth={3} />
            </>
          ) : (
            <>
              Continuer <ArrowRight size={16} strokeWidth={3} />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};
