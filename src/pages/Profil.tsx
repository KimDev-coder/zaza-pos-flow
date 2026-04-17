import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF } from "@/store/useStore";
import { motion } from "framer-motion";
import { Bell, Globe, Moon, Shield, LogOut, ChevronRight, Sun } from "lucide-react";
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
      <PageHeader title="Profil" />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant">
        <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold backdrop-blur-sm">
            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="text-lg font-bold">{user.name}</p>
            <p className="text-xs opacity-90">{user.email}</p>
            <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
              {user.role}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-card p-3 shadow-soft">
          <p className="text-xs text-muted-foreground">Ventes totales</p>
          <p className="mt-1 text-base font-bold">{formatBIF(totalSales)}</p>
        </div>
        <div className="rounded-2xl bg-card p-3 shadow-soft">
          <p className="text-xs text-muted-foreground">Alertes stock</p>
          <p className="mt-1 text-base font-bold">{lowStock}</p>
        </div>
      </div>

      <h3 className="mt-6 mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paramètres</h3>
      <div className="overflow-hidden rounded-2xl bg-card shadow-soft">
        <Toggle icon={dark ? Moon : Sun} label="Thème sombre" value={dark} onChange={setDark} />
        <Item icon={Bell} label="Notifications" onClick={() => toast.success("Notifications activées")} />
        <Item icon={Globe} label="Langue" right="Français" />
        <Item icon={Shield} label="Sécurité" right="2FA actif" last />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => toast("Déconnexion (UI seulement)")}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-bold text-destructive"
      >
        <LogOut size={16} /> Déconnexion
      </motion.button>

      <p className="mt-6 text-center text-xs text-muted-foreground">Zaza Food • Bwiza, Bujumbura</p>
    </AppShell>
  );
};

const Item = ({ icon: Icon, label, right, onClick, last }: any) => (
  <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-secondary ${!last ? "border-b border-border/50" : ""}`}>
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
      <Icon size={16} />
    </div>
    <span className="flex-1 text-sm font-medium">{label}</span>
    {right && <span className="text-xs text-muted-foreground">{right}</span>}
    <ChevronRight size={16} className="text-muted-foreground" />
  </button>
);

const Toggle = ({ icon: Icon, label, value, onChange }: any) => (
  <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
      <Icon size={16} />
    </div>
    <span className="flex-1 text-sm font-medium">{label}</span>
    <button onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition ${value ? "bg-primary" : "bg-secondary"}`}>
      <motion.span layout className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${value ? "left-[22px]" : "left-0.5"}`} />
    </button>
  </div>
);

export default Profil;
