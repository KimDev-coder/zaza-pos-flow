import { useMemo } from "react";
import { useStore, formatBIF } from "@/store/useStore";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Flame, ArrowUpRight, Sparkles } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const Dashboard = () => {
  const { sales, expenses, purchases, products } = useStore();

  const totalSales = sales.reduce((s, x) => s + x.total, 0);
  const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0);
  const totalPurchases = purchases.reduce((s, x) => s + x.total, 0);
  const profit = totalSales - totalExpenses - totalPurchases;

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string; qty: number; revenue: number }>();
    sales.forEach((s) =>
      s.items.forEach((i) => {
        const p = products.find((x) => x.id === i.productId);
        const cur = map.get(i.productId) || { name: i.name, emoji: p?.emoji || "🍽️", qty: 0, revenue: 0 };
        cur.qty += i.qty;
        cur.revenue += i.price * i.qty;
        map.set(i.productId, cur);
      })
    );
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, 4);
  }, [sales, products]);

  const chartData = [
    { h: "10h", v: 3000 }, { h: "12h", v: 8000 }, { h: "14h", v: 15000 },
    { h: "16h", v: 12000 }, { h: "18h", v: 22000 }, { h: "20h", v: totalSales || 28000 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Bonjour, Aïcha ✨"
        subtitle="Voici votre activité du jour"
      />

      {/* Hero card — Shopify-style premium */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="relative overflow-hidden rounded-[28px] gradient-mesh p-6 text-primary-foreground shadow-pop"
      >
        {/* Decorative orbs */}
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/15 blur-3xl float" />
        <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute inset-0 opacity-30"
             style={{ background: "radial-gradient(circle at 30% 20%, white, transparent 50%)" }} />

        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex h-6 items-center gap-1 rounded-full bg-white/20 px-2 backdrop-blur-md">
              <Sparkles size={11} />
              <span className="text-[10px] font-bold uppercase tracking-wider">En direct</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] opacity-80">Ventes du jour</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-4xl font-black tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
              {formatBIF(totalSales)}
            </p>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs font-semibold opacity-90">
            <ArrowUpRight size={14} />
            +12.4% vs hier
          </div>

          <div className="mt-4 -mx-6 -mb-6 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="white" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip contentStyle={{ display: "none" }} cursor={false} />
                <XAxis dataKey="h" hide />
                <Area type="monotone" dataKey="v" stroke="white" strokeWidth={2.5} fill="url(#g)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard icon={TrendingDown} label="Dépenses" value={formatBIF(totalExpenses + totalPurchases)} tone="warning" delay={0.05} trend="-3%" />
        <StatCard icon={Wallet} label="Bénéfice" value={formatBIF(profit)} tone={profit >= 0 ? "success" : "destructive"} delay={0.1} trend="+8%" />
      </div>

      {/* Top products */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Top produits</h2>
            <Flame size={15} className="text-primary" />
          </div>
          <button className="text-xs font-semibold text-primary">Voir tout</button>
        </div>
        <div className="space-y-2">
          {topProducts.length === 0 && (
            <p className="rounded-2xl gradient-card p-4 text-sm text-muted-foreground shadow-soft">Aucune vente pour le moment.</p>
          )}
          {topProducts.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 280, damping: 22 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="group flex items-center gap-3 rounded-2xl gradient-card p-3 shadow-soft ring-1 ring-border/50 transition-all hover:shadow-elegant"
            >
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-2xl ring-1 ring-primary/10">
                {p.emoji}
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-glow">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.qty} vendus</p>
              </div>
              <p className="text-sm font-bold gradient-text">{formatBIF(p.revenue)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <section className="mt-7">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-warning" />
            <h2 className="text-base font-bold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Alertes stock</h2>
            <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">{lowStock.length}</span>
          </div>
          <div className="space-y-2">
            {lowStock.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-warning/30 bg-warning/5 p-3 backdrop-blur-sm"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-warning" />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-xl">{p.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-warning">Reste {p.stock} (min. {p.minStock})</p>
                </div>
                <button className="rounded-full bg-warning px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground shadow-soft">
                  Réappro
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
};

const StatCard = ({ icon: Icon, label, value, tone, delay, trend }: any) => {
  const toneClass = {
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    primary: "text-primary bg-primary/10",
  }[tone as string];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 240, damping: 22 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl gradient-card p-4 shadow-soft ring-1 ring-border/50 transition-shadow hover:shadow-elegant"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
          <Icon size={18} strokeWidth={2.4} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold ${tone === "success" ? "text-success" : "text-muted-foreground"}`}>{trend}</span>
        )}
      </div>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{value}</p>
    </motion.div>
  );
};

export default Dashboard;
