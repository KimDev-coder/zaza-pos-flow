import { useMemo } from "react";
import { useStore, formatBIF } from "@/store/useStore";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, Flame } from "lucide-react";
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
    { h: "10h", v: 0 }, { h: "12h", v: 8000 }, { h: "14h", v: 15000 },
    { h: "16h", v: 12000 }, { h: "18h", v: 22000 }, { h: "20h", v: totalSales },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Bonjour, Aïcha 👋"
        subtitle="Voici votre activité du jour"
      />

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-5 text-primary-foreground shadow-elegant"
      >
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <p className="text-xs font-medium uppercase tracking-wider opacity-80">Ventes du jour</p>
        <p className="mt-1 text-3xl font-bold">{formatBIF(totalSales)}</p>
        <div className="mt-4 -mx-5 h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="white" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="white" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip contentStyle={{ display: "none" }} />
              <XAxis dataKey="h" hide />
              <Area type="monotone" dataKey="v" stroke="white" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatCard icon={TrendingDown} label="Dépenses" value={formatBIF(totalExpenses + totalPurchases)} tone="warning" delay={0.05} />
        <StatCard icon={Wallet} label="Bénéfice" value={formatBIF(profit)} tone={profit >= 0 ? "success" : "destructive"} delay={0.1} />
      </div>

      {/* Top products */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Top produits</h2>
          <Flame size={16} className="text-primary" />
        </div>
        <div className="space-y-2">
          {topProducts.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground shadow-soft">Aucune vente pour le moment.</p>
          )}
          {topProducts.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-2xl">{p.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.qty} vendus</p>
              </div>
              <p className="text-sm font-semibold text-primary">{formatBIF(p.revenue)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <h2 className="text-base font-semibold">Alertes stock</h2>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-xl">{p.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-warning">Reste {p.stock} (min. {p.minStock})</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
};

const StatCard = ({ icon: Icon, label, value, tone, delay }: any) => {
  const toneClass = {
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    destructive: "text-destructive bg-destructive/10",
    primary: "text-primary bg-primary/10",
  }[tone as string];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl bg-card p-4 shadow-soft"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-bold tracking-tight">{value}</p>
    </motion.div>
  );
};

export default Dashboard;
