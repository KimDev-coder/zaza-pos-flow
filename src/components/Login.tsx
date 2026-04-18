import { motion } from "framer-motion";
import { useState } from "react";
import { ChefHat, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

interface LoginProps {
  onSuccess: () => void;
}

export const Login = ({ onSuccess }: LoginProps) => {
  const { users, loginAs } = useStore();
  const [email, setEmail] = useState("zazafood@gmail.com");
  const [password, setPassword] = useState("1234");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const found = users.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase() && u.password === password
      );
      if (!found) {
        setLoading(false);
        toast.error("Email ou mot de passe incorrect");
        return;
      }
      loginAs(found.id);
      toast.success(`Karibu ${found.name.split(" ")[0]} 👋`);
      onSuccess();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[90] flex flex-col bg-background"
    >
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 aurora-bg opacity-70" />
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full opacity-50 blur-3xl"
           style={{ background: "radial-gradient(circle, hsl(var(--primary-glow) / 0.4), transparent 70%)" }} />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-96 w-96 rounded-full opacity-40 blur-3xl"
           style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.35), transparent 70%)" }} />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-7 py-10">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl gradient-mesh shadow-pop"
        >
          <ChefHat size={30} className="text-primary-foreground" strokeWidth={2.4} />
        </motion.div>

        {/* Floating welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto max-w-[320px] rounded-[24px] gradient-mesh px-5 py-3.5 text-center shadow-pop"
          >
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -inset-px rounded-[24px] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-md"
            />
            <p className="relative text-sm font-extrabold tracking-tight text-primary-foreground" style={{ fontFamily: "Sora, sans-serif" }}>
              ✨ Assalam Aleykum
            </p>
            <p className="relative mt-0.5 text-xs font-semibold text-primary-foreground/95">
              Karibu sana Mabuja 🌿
            </p>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-extrabold tracking-tight text-center"
          style={{ fontFamily: "Sora, sans-serif" }}
        >
          Se connecter
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-1.5 text-center text-sm text-muted-foreground"
        >
          Accédez à votre tableau de bord Zaza Food
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={submit}
          className="mt-7 space-y-3"
        >
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-2xl bg-card pl-11 pr-4 py-3.5 text-sm font-semibold ring-1 ring-border outline-none transition focus:ring-primary"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPwd ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full rounded-2xl bg-card pl-11 pr-11 py-3.5 text-sm font-semibold ring-1 ring-border outline-none transition focus:ring-primary"
            />
            <button type="button" onClick={() => setShowPwd((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary">
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gradient-mesh py-4 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow transition hover:shadow-pop disabled:opacity-60"
          >
            {loading ? "Connexion..." : <>Se connecter <ArrowRight size={16} strokeWidth={3} /></>}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 rounded-2xl bg-secondary/60 p-3 text-center text-[11px] text-muted-foreground ring-1 ring-border/60"
        >
          <span className="font-bold text-foreground">Compte démo :</span> zazafood@gmail.com / 1234
        </motion.div>
      </div>
    </motion.div>
  );
};
