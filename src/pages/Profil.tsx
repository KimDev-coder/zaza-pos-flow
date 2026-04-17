import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF } from "@/store/useStore";
import { motion } from "framer-motion";
import { Bell, Globe, Moon, Shield, LogOut, ChevronRight, Sun, BadgeCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Profil = () => {
  const { user, sales, products } = useStore();
  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <AppShell>
      <PageHeader title="Profil" subtitle="Votre compte & paramètres" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="relative overflow-hidden rounded-[28px] gradient-mesh p-6 text-primary-foreground shadow-pop"
      >
        <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-3xl float" />
        <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-4">
          <div className="relative flex h-18 w-18 h-[72px] w-[72px] items-center justify-center rounded-3xl bg-white/20 text-2xl font-black backdrop-blur-md ring-2 ring-white/30">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-glow">
              <BadgeCheck size={14} strokeWidth={3} />
            </span>
          </div>
          <div className="flex-1">
            <p className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{user.name}</p>
            <p className="text-xs opacity-90">{user.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              {user.role}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl gradient-card p-4 shadow-soft ring-1 ring-border/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ventes totales</p>
          <p className="mt-1 text-base font-extrabold gradient-text" style={{ fontFamily: "Sora, sans-serif" }}>{formatBIF(totalSales)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl gradient-card p-4 shadow-soft ring-1 ring-border/50">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alertes stock</p>
          <p className="mt-1 text-base font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{lowStock}</p>
        </motion.div>
      </div>

      <h3 className="mt-7 mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paramètres</h3>
      <div className="overflow-hidden rounded-2xl gradient-card shadow-soft ring-1 ring-border/50">
        <Toggle icon={dark ? Moon : Sun} label="Thème sombre" value={dark} onChange={setDark} />
        <Item icon={Bell} label="Notifications" onClick={() => toast.success("Notifications activées")} />
        <Item icon={Globe} label="Langue" right="Français" />
        <Item icon={Shield} label="Sécurité" right="2FA actif" last />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => toast("Déconnexion (UI seulement)")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3.5 text-sm font-bold text-destructive transition hover:bg-destructive/10"
      >
        <LogOut size={16} /> Déconnexion
      </motion.button>

      <p className="mt-6 text-center text-xs text-muted-foreground">Zaza Food • Bwiza, Bujumbura</p>
    </AppShell>
  );
};

const Item = ({ icon: Icon, label, right, onClick, last }: any) => (
  <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-secondary ${!last ? "border-b border-border/50" : ""}`}>
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
      <Icon size={16} />
    </div>
    <span className="flex-1 text-sm font-semibold">{label}</span>
    {right && <span className="text-xs font-medium text-muted-foreground">{right}</span>}
    <ChevronRight size={16} className="text-muted-foreground" />
  </button>
);

const Toggle = ({ icon: Icon, label, value, onChange }: any) => (
  <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5">
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
      <Icon size={16} />
    </div>
    <span className="flex-1 text-sm font-semibold">{label}</span>
    <button onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full transition-colors ${value ? "gradient-mesh shadow-glow" : "bg-secondary"}`}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-soft ${value ? "left-[22px]" : "left-0.5"}`} />
    </button>
  </div>
);

export default Profil;
