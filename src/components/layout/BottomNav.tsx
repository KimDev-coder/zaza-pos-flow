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
        <div className="glass shadow-elegant rounded-2xl border border-border/50 px-2 py-2">
          <div className="flex items-center justify-between">
            {tabs.map((t) => {
              const active = pathname === t.to;
              const Icon = t.icon;
              return (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className="relative flex flex-1 flex-col items-center gap-0.5 py-1.5"
                >
                  {active && (
                    <motion.div
                      layoutId="navPill"
                      className="absolute inset-0 rounded-xl gradient-primary shadow-glow"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <Icon
                    size={20}
                    className={`relative z-10 transition ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                  />
                  <span
                    className={`relative z-10 text-[10px] font-medium ${active ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {t.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
