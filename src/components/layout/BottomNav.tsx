import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, Receipt, User } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { to: "/", icon: LayoutDashboard, label: "Accueil" },
  { to: "/ventes", icon: ShoppingCart, label: "Ventes" },
  { to: "/stock", icon: Package, label: "Stock" },
  { to: "/achats", icon: Receipt, label: "Achats" },
  { to: "/profil", icon: User, label: "Profil" },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md px-3 pb-3">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
          className="glass shadow-pop rounded-[28px] px-2 py-2"
        >
          <div className="flex items-center justify-between">
            {tabs.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className="relative flex flex-1 flex-col items-center gap-0.5 py-2"
                >
                  {active && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-2xl gradient-mesh shadow-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={20}
                      strokeWidth={active ? 2.5 : 2}
                      className={`transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                    />
                  </motion.div>
                  <span
                    className={`relative z-10 text-[10px] font-semibold tracking-tight transition-colors ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {t.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </motion.div>
      </div>
    </nav>
  );
};
