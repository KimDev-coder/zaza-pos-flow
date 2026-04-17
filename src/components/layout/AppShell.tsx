import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Aurora ambient background */}
      <div className="pointer-events-none fixed inset-0 aurora-bg" />
      <div className="pointer-events-none fixed -left-32 top-20 h-96 w-96 rounded-full opacity-40 blur-3xl"
           style={{ background: "radial-gradient(circle, hsl(var(--primary-glow) / 0.35), transparent 70%)" }} />
      <div className="pointer-events-none fixed -right-32 top-40 h-80 w-80 rounded-full opacity-30 blur-3xl"
           style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.30), transparent 70%)" }} />

      <main className="relative mx-auto max-w-md px-4 pt-8 pb-32">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="mb-6 flex items-start justify-between gap-3">
    <div>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-balance" style={{ fontFamily: "Sora, Inter, sans-serif" }}>
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
    {action}
  </div>
);
