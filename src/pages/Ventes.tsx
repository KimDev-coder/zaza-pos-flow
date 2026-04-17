import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF, PaymentMethod } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Check, Banknote, Smartphone, CreditCard, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const Ventes = () => {
  const { products, addSale } = useStore();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [activeCat, setActiveCat] = useState<string>("Tous");

  const cats = ["Tous", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = activeCat === "Tous" ? products : products.filter((p) => p.category === activeCat);

  const items = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => {
          const p = products.find((x) => x.id === id)!;
          return p && qty > 0 ? { productId: id, name: p.name, price: p.price, qty } : null;
        })
        .filter(Boolean) as { productId: string; name: string; price: number; qty: number }[],
    [cart, products]
  );

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const cartCount = items.reduce((s, i) => s + i.qty, 0);

  const inc = (id: string) => {
    const p = products.find((x) => x.id === id)!;
    setCart((c) => {
      const next = (c[id] || 0) + 1;
      if (next > p.stock) {
        toast.error(`Stock insuffisant pour ${p.name}`);
        return c;
      }
      return { ...c, [id]: next };
    });
  };
  const dec = (id: string) =>
    setCart((c) => {
      const n = Math.max(0, (c[id] || 0) - 1);
      const { [id]: _, ...rest } = c;
      return n === 0 ? rest : { ...c, [id]: n };
    });

  const validate = () => {
    if (items.length === 0) return toast.error("Panier vide");
    addSale(items, discount, payment);
    setCart({});
    setDiscount(0);
    toast.success(`Vente validée • ${formatBIF(total)}`);
  };

  return (
    <AppShell>
      <PageHeader title="Point de vente" subtitle="Sélectionnez les produits" />

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
        {cats.map((c) => (
          <motion.button
            key={c}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActiveCat(c)}
            className={`relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold tracking-tight transition-all ${
              activeCat === c
                ? "gradient-mesh text-primary-foreground shadow-glow"
                : "bg-card text-muted-foreground shadow-soft ring-1 ring-border/50 hover:text-foreground"
            }`}
          >
            {c}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((p, idx) => {
          const qty = cart[p.id] || 0;
          const out = p.stock === 0;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03, type: "spring", stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -3 }}
              onClick={() => !out && inc(p.id)}
              disabled={out}
              className={`relative overflow-hidden rounded-2xl gradient-card p-3 text-left shadow-soft ring-1 ring-border/50 transition-all ${
                out ? "opacity-50" : "hover:shadow-elegant hover:ring-primary/30"
              }`}
            >
              <div className="relative flex h-20 items-center justify-center rounded-xl bg-accent text-4xl">
                <div className="absolute inset-0 rounded-xl opacity-50"
                     style={{ background: "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.15), transparent 70%)" }} />
                <span className="relative">{p.emoji}</span>
              </div>
              <p className="mt-2.5 line-clamp-1 text-sm font-semibold">{p.name}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm font-extrabold gradient-text">{formatBIF(p.price)}</p>
                <p className="text-[10px] font-medium text-muted-foreground">stock {p.stock}</p>
              </div>
              <AnimatePresence>
                {qty > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full gradient-mesh px-1.5 text-xs font-extrabold text-primary-foreground shadow-glow"
                  >
                    {qty}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 left-0 right-0 z-40 px-4"
          >
            <div className="mx-auto max-w-md">
              <CartSheet
                items={items}
                subtotal={subtotal}
                discount={discount}
                setDiscount={setDiscount}
                payment={payment}
                setPayment={setPayment}
                total={total}
                cartCount={cartCount}
                inc={inc}
                dec={dec}
                validate={validate}
                clear={() => setCart({})}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
};

const CartSheet = ({ items, subtotal, discount, setDiscount, payment, setPayment, total, cartCount, inc, dec, validate, clear }: any) => {
  const [open, setOpen] = useState(false);
  const payOpts: { v: PaymentMethod; icon: any }[] = [
    { v: "Cash", icon: Banknote },
    { v: "Mobile Money", icon: Smartphone },
    { v: "Carte", icon: CreditCard },
  ];

  return (
    <motion.div layout className="glass shadow-pop rounded-[28px] p-4">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl gradient-mesh text-primary-foreground shadow-glow">
          <ShoppingBag size={18} />
          <motion.span
            key={cartCount}
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-extrabold text-warning-foreground"
          >
            {cartCount}
          </motion.span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cartCount} article{cartCount > 1 ? "s" : ""}</p>
          <p className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{formatBIF(total)}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} className="text-primary">
          <ChevronUp size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-2 border-t border-border/50 pt-3 max-h-48 overflow-y-auto">
              {items.map((i: any) => (
                <div key={i.productId} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBIF(i.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-secondary p-1">
                    <button onClick={() => dec(i.productId)} className="flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-soft active:scale-90 transition"><Minus size={12} /></button>
                    <span className="min-w-5 text-center text-xs font-extrabold">{i.qty}</span>
                    <button onClick={() => inc(i.productId)} className="flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-soft active:scale-90 transition"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                type="number" min={0} placeholder="Remise (BIF)" value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button onClick={clear} className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition active:scale-90">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {payOpts.map(({ v, icon: Icon }) => (
                <motion.button
                  key={v} whileTap={{ scale: 0.94 }} onClick={() => setPayment(v)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 text-[11px] font-bold transition-all ${payment === v ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-secondary text-muted-foreground"}`}
                >
                  <Icon size={16} />
                  {v}
                </motion.button>
              ))}
            </div>

            <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Sous-total</span><span>{formatBIF(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-warning"><span>Remise</span><span>-{formatBIF(discount)}</span></div>}
              <div className="flex justify-between font-extrabold"><span>Total</span><span className="gradient-text">{formatBIF(total)}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.97 }} onClick={validate}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow transition hover:shadow-pop"
      >
        <Check size={16} strokeWidth={3} /> Valider la vente
      </motion.button>
    </motion.div>
  );
};

export default Ventes;
