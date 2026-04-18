import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF, PaymentMethod } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, Check, Banknote, Smartphone, CreditCard, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";

interface CartLine {
  key: string;          // unique id du panier
  productId?: string;   // si lié au stock
  name: string;
  emoji: string;
  price: number;
  qty: number;
}

const Ventes = () => {
  const { products, catalog, addSale } = useStore();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<PaymentMethod>("Cash");
  const [tab, setTab] = useState<"menu" | "stock">("menu");

  // Modal pour saisir le prix d'un plat du catalogue
  const [picking, setPicking] = useState<{ name: string; emoji: string } | null>(null);
  const [pickPrice, setPickPrice] = useState<number | "">("");

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total = Math.max(0, subtotal - discount);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addCatalogItem = () => {
    if (!picking) return;
    const price = Number(pickPrice);
    if (!price || price <= 0) return toast.error("Entrez un prix valide");
    setCart((c) => [
      ...c,
      { key: Math.random().toString(36).slice(2), name: picking.name, emoji: picking.emoji, price, qty: 1 },
    ]);
    toast.success(`${picking.name} ajouté • ${formatBIF(price)}`);
    setPicking(null);
    setPickPrice("");
  };

  const incStock = (id: string) => {
    const p = products.find((x) => x.id === id)!;
    setCart((c) => {
      const existing = c.find((i) => i.productId === id);
      if (existing) {
        if (existing.qty + 1 > p.stock) {
          toast.error(`Stock insuffisant pour ${p.name}`);
          return c;
        }
        return c.map((i) => (i.productId === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { key: id, productId: id, name: p.name, emoji: p.emoji, price: p.price, qty: 1 }];
    });
  };

  const incLine = (key: string) =>
    setCart((c) => c.map((i) => {
      if (i.key !== key) return i;
      if (i.productId) {
        const p = products.find((x) => x.id === i.productId);
        if (p && i.qty + 1 > p.stock) {
          toast.error(`Stock insuffisant`);
          return i;
        }
      }
      return { ...i, qty: i.qty + 1 };
    }));

  const decLine = (key: string) =>
    setCart((c) => c.flatMap((i) => (i.key === key ? (i.qty - 1 <= 0 ? [] : [{ ...i, qty: i.qty - 1 }]) : [i])));

  const validate = () => {
    if (cart.length === 0) return toast.error("Panier vide");
    const items = cart.map((i) => ({
      productId: i.productId ?? `c_${i.key}`,
      name: i.name,
      price: i.price,
      qty: i.qty,
    }));
    addSale(items, discount, payment);
    setCart([]);
    setDiscount(0);
    toast.success(`Vente validée • ${formatBIF(total)}`);
  };

  return (
    <AppShell>
      <PageHeader title="Point de vente" subtitle="Sélectionnez les produits" />

      {/* Tabs Menu / Stock */}
      <div className="relative mb-4 flex rounded-2xl bg-secondary p-1 ring-1 ring-border/50">
        {([
          { v: "menu", l: "Menu (prix libre)" },
          { v: "stock", l: "Stock" },
        ] as const).map(({ v, l }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${tab === v ? "text-primary-foreground" : "text-muted-foreground"}`}>
            {tab === v && (
              <motion.div layoutId="venteTab" className="absolute inset-0 rounded-xl gradient-mesh shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
            <span className="relative z-10">{l}</span>
          </button>
        ))}
      </div>

      {tab === "menu" ? (
        <div className="grid grid-cols-2 gap-3">
          {catalog.map((p, idx) => (
            <motion.button
              key={p.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.025, type: "spring", stiffness: 260, damping: 22 }}
              whileTap={{ scale: 0.95 }}
              whileHover={{ y: -3 }}
              onClick={() => { setPicking(p); setPickPrice(""); }}
              className="relative overflow-hidden rounded-2xl gradient-card p-3 text-left shadow-soft ring-1 ring-border/50 transition-all hover:shadow-elegant hover:ring-primary/30"
            >
              <div className="relative flex h-20 items-center justify-center rounded-xl bg-accent text-4xl">
                <div className="absolute inset-0 rounded-xl opacity-50"
                     style={{ background: "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.15), transparent 70%)" }} />
                <span className="relative">{p.emoji}</span>
              </div>
              <p className="mt-2.5 line-clamp-2 text-sm font-semibold leading-tight">{p.name}</p>
              <p className="mt-1 text-[10px] font-medium text-muted-foreground">Prix à définir</p>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p, idx) => {
            const out = p.stock === 0;
            const inCart = cart.find((i) => i.productId === p.id)?.qty || 0;
            return (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, type: "spring", stiffness: 260, damping: 22 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -3 }}
                onClick={() => !out && incStock(p.id)}
                disabled={out}
                className={`relative overflow-hidden rounded-2xl gradient-card p-3 text-left shadow-soft ring-1 ring-border/50 transition-all ${out ? "opacity-50" : "hover:shadow-elegant hover:ring-primary/30"}`}
              >
                <div className="relative flex h-20 items-center justify-center rounded-xl bg-accent text-4xl">
                  <span className="relative">{p.emoji}</span>
                </div>
                <p className="mt-2.5 line-clamp-1 text-sm font-semibold">{p.name}</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm font-extrabold gradient-text">{formatBIF(p.price)}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">stock {p.stock}</p>
                </div>
                <AnimatePresence>
                  {inCart > 0 && (
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full gradient-mesh px-1.5 text-xs font-extrabold text-primary-foreground shadow-glow"
                    >{inCart}</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Modal saisie prix */}
      <AnimatePresence>
        {picking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPicking(null)}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-md">
            <motion.div
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-[32px] bg-card p-5 shadow-pop"
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-3xl">{picking.emoji}</div>
                <div className="flex-1">
                  <h2 className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{picking.name}</h2>
                  <p className="text-xs text-muted-foreground">Définir le prix de vente</p>
                </div>
                <button onClick={() => setPicking(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><X size={16} /></button>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Prix (BIF)</span>
                <input
                  autoFocus type="number" inputMode="numeric" min={0} value={pickPrice}
                  onChange={(e) => setPickPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && addCatalogItem()}
                  placeholder="Ex: 5000"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-base font-bold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <motion.button
                whileTap={{ scale: 0.97 }} onClick={addCatalogItem}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow"
              >
                <Plus size={16} strokeWidth={3} /> Ajouter au panier
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-24 left-0 right-0 z-40 px-4"
          >
            <div className="mx-auto max-w-md">
              <CartSheet
                items={cart} subtotal={subtotal} discount={discount} setDiscount={setDiscount}
                payment={payment} setPayment={setPayment} total={total} cartCount={cartCount}
                inc={incLine} dec={decLine} validate={validate} clear={() => setCart([])}
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
          <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-warning px-1 text-[10px] font-extrabold text-warning-foreground"
          >{cartCount}</motion.span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{cartCount} article{cartCount > 1 ? "s" : ""}</p>
          <p className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>{formatBIF(total)}</p>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} className="text-primary"><ChevronUp size={18} /></motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-3 space-y-2 border-t border-border/50 pt-3 max-h-48 overflow-y-auto">
              {items.map((i: CartLine) => (
                <div key={i.key} className="flex items-center gap-2">
                  <span className="text-lg">{i.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBIF(i.price)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-secondary p-1">
                    <button onClick={() => dec(i.key)} className="flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-soft active:scale-90 transition"><Minus size={12} /></button>
                    <span className="min-w-5 text-center text-xs font-extrabold">{i.qty}</span>
                    <button onClick={() => inc(i.key)} className="flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-soft active:scale-90 transition"><Plus size={12} /></button>
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
                <motion.button key={v} whileTap={{ scale: 0.94 }} onClick={() => setPayment(v)}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2.5 text-[11px] font-bold transition-all ${payment === v ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-secondary text-muted-foreground"}`}
                >
                  <Icon size={16} /> {v}
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

      <motion.button whileTap={{ scale: 0.97 }} onClick={validate}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow transition hover:shadow-pop"
      >
        <Check size={16} strokeWidth={3} /> Valider la vente
      </motion.button>
    </motion.div>
  );
};

export default Ventes;
