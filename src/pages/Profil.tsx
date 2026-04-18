import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF, Permission, Role } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Globe, Moon, Shield, LogOut, ChevronRight, Sun, BadgeCheck, Camera, Users, X, Check, UserCog, Mail, Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const ALL_PERMS: { v: Permission; label: string }[] = [
  { v: "dashboard", label: "Tableau de bord" },
  { v: "ventes", label: "Ventes" },
  { v: "stock", label: "Stock" },
  { v: "achats", label: "Achats & Dépenses" },
  { v: "profil", label: "Profil" },
];

const ROLES: Role[] = ["Admin", "Manager", "Caissier"];

interface ProfilProps {
  onLogout?: () => void;
}

const Profil = ({ onLogout }: ProfilProps) => {
  const { user, sales, products, updateUser } = useStore();
  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const [dark, setDark] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Image trop grande (max 4MB)");
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatar: reader.result as string });
      toast.success("Photo de profil mise à jour");
    };
    reader.readAsDataURL(f);
  };

  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

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
          <button
            onClick={() => fileRef.current?.click()}
            className="group relative h-[72px] w-[72px] overflow-hidden rounded-3xl bg-white/20 ring-2 ring-white/30 backdrop-blur-md transition active:scale-95"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-black">{initials}</span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition group-hover:opacity-100">
              <Camera size={20} />
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-primary shadow-glow">
              <BadgeCheck size={14} strokeWidth={3} />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
          <div className="flex-1">
            <p className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{user.name}</p>
            <p className="text-xs opacity-90">{user.email}</p>
            <span className="mt-1.5 inline-block rounded-full bg-white/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 py-2 text-xs font-bold backdrop-blur-md transition hover:bg-white/25"
        >
          <Camera size={14} /> Changer la photo
        </button>
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

      <h3 className="mt-7 mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Administration</h3>
      <div className="overflow-hidden rounded-2xl gradient-card shadow-soft ring-1 ring-border/50">
        <Item icon={Users} label="Rôles & permissions" right="Gérer" onClick={() => setRolesOpen(true)} last />
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

      <RolesSheet open={rolesOpen} onClose={() => setRolesOpen(false)} />
    </AppShell>
  );
};

const RolesSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { users, user, updateUserRole, updateUserPermissions } = useStore();
  const [selectedId, setSelectedId] = useState<string>(users[0]?.id ?? "");
  const selected = users.find((u) => u.id === selectedId) ?? users[0];

  const togglePerm = (p: Permission) => {
    if (!selected) return;
    if (selected.id === user.id && selected.role === "Admin" && p === "profil") {
      // garde-fou minimal
    }
    const has = selected.permissions.includes(p);
    const next = has ? selected.permissions.filter((x) => x !== p) : [...selected.permissions, p];
    updateUserPermissions(selected.id, next);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-md">
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[32px] bg-card p-5 shadow-pop max-h-[85vh] overflow-y-auto"
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Rôles & permissions</h2>
                <p className="text-xs text-muted-foreground">Gérez l'accès de chaque utilisateur</p>
              </div>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><X size={16} /></button>
            </div>

            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Utilisateurs</h3>
            <div className="mb-4 space-y-2">
              {users.map((u) => (
                <button
                  key={u.id} onClick={() => setSelectedId(u.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ring-1 ${selectedId === u.id ? "bg-primary/10 ring-primary" : "bg-secondary ring-transparent"}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-mesh text-xs font-black text-primary-foreground">
                    {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-bold">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-primary ring-1 ring-border">{u.role}</span>
                </button>
              ))}
            </div>

            {selected && (
              <>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Rôle de {selected.name}</h3>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => updateUserRole(selected.id, r)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${selected.role === r ? "gradient-mesh text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"}`}>
                      {r}
                    </button>
                  ))}
                </div>

                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Permissions</h3>
                <div className="space-y-2">
                  {ALL_PERMS.map((p) => {
                    const active = selected.permissions.includes(p.v);
                    return (
                      <button key={p.v} onClick={() => togglePerm(p.v)}
                        className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ring-1 ${active ? "bg-primary/10 ring-primary/50" : "bg-secondary ring-transparent"}`}>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "gradient-mesh text-primary-foreground" : "bg-card text-muted-foreground"}`}>
                          {active ? <Check size={16} strokeWidth={3} /> : <X size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">{p.label}</p>
                          <p className="text-[11px] text-muted-foreground">{active ? "Accès autorisé" : "Accès refusé"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }} onClick={onClose}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow"
            >
              <Check size={16} strokeWidth={3} /> Terminer
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
