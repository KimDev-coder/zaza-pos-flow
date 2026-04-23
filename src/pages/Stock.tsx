import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF, Category, Product } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, X, Trash2, History, Bell, ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";

const cats: Category[] = ["Féculents", "Viandes", "Légumes", "Boissons", "Autres"];
const emojis = ["🍚", "🍗", "🍟", "🥤", "🥩", "💧", "🥗", "🐟", "🥔", "🌽", "🍌", "🫘", "🥬", "🪨", "🫙", "🍞", "📦"];

const Stock = () => {
  const { products, movements, addProduct, updateProduct, deleteProduct } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Tous");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"stock" | "history">("stock");

  const filtered = products.filter(
    (p) => (cat === "Tous" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  const lowCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <AppShell>
      <PageHeader title="Stock" subtitle={`${products.length} produits • ${lowCount} alerte${lowCount > 1 ? "s" : ""}`} />

      {/* Tabs */}
      <div className="relative mb-4 flex rounded-2xl bg-secondary p-1 ring-1 ring-border/50">
        {([
          { v: "stock", l: "Inventaire" },
          { v: "history", l: "Historique" },
        ] as const).map(({ v, l }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`relative flex-1 rounded-xl py-2.5 text-xs font-bold transition-colors ${tab === v ? "text-primary-foreground" : "text-muted-foreground"}`}>
            {tab === v && (
              <motion.div layoutId="stockTab" className="absolute inset-0 rounded-xl gradient-mesh shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
            <span className="relative z-10">{l}</span>
          </button>
        ))}
      </div>

      {tab === "stock" ? (
        <>
          <div className="relative mb-3">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit..."
              className="w-full rounded-2xl border border-border bg-card py-3 pl-10 pr-3 text-sm shadow-soft outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
            {["Tous", ...cats].map((c) => (
              <motion.button
                key={c} whileTap={{ scale: 0.94 }} onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${cat === c ? "gradient-mesh text-primary-foreground shadow-glow" : "bg-card text-muted-foreground shadow-soft ring-1 ring-border/50"}`}
              >
                {c}
              </motion.button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((p, i) => {
              const ratio = Math.min(1, p.stock / Math.max(p.minStock * 3, 1));
              const low = p.stock <= p.minStock;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 260, damping: 22 }}
                  whileHover={{ x: 3 }}
                  className="group rounded-2xl gradient-card p-3.5 shadow-soft ring-1 ring-border/50 transition-shadow hover:shadow-elegant"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-2xl ring-1 ring-primary/10">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold">{p.name}</p>
                        {low && (
                          <span className="flex items-center gap-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-warning">
                            <Bell size={9} /> Faible
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.category} • <span className="font-semibold gradient-text">{formatBIF(p.price)}</span>
                        <span className="ml-1 text-[10px]">• alerte ≤ {p.minStock}</span>
                      </p>
                    </div>
                    <button onClick={() => { setEditing(p); setShowForm(true); }} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition hover:bg-primary hover:text-primary-foreground active:scale-90">
                      <Pencil size={14} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ratio * 100}%` }}
                        transition={{ delay: i * 0.04 + 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-full rounded-full ${low ? "bg-warning" : "gradient-mesh"}`}
                      />
                    </div>
                    <span className={`text-xs font-extrabold tabular-nums ${low ? "text-warning" : "text-foreground"}`}>{p.stock}</span>
                  </div>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-3xl">📦</div>
                <p className="text-sm font-semibold">Aucun produit</p>
                <p className="mt-1 text-xs text-muted-foreground">Appuyez sur ➕ pour ajouter votre premier produit</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {movements.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-3xl">
                <History size={28} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">Aucun mouvement</p>
              <p className="mt-1 text-xs text-muted-foreground">Les ajouts, ventes et achats apparaîtront ici</p>
            </div>
          )}
          {movements.map((m, i) => {
            const isIn = m.qty > 0;
            const color = m.type === "vente" ? "text-destructive" : m.type === "achat" || m.type === "ajout" ? "text-primary" : m.type === "suppression" ? "text-destructive" : "text-warning";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 10) * 0.03 }}
                className="flex items-center gap-3 rounded-2xl gradient-card p-3 shadow-soft ring-1 ring-border/50"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-accent ${color}`}>
                  {isIn ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold">{m.productName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="capitalize font-semibold">{m.type}</span>
                    {m.note && ` • ${m.note}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-extrabold tabular-nums ${color}`}>{isIn ? "+" : ""}{m.qty}</p>
                  <p className="text-[10px] text-muted-foreground">stock: {m.stockAfter}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "stock" && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-mesh text-primary-foreground shadow-pop"
        >
          <Plus size={26} strokeWidth={2.6} />
        </motion.button>
      )}

      <AnimatePresence>
        {showForm && (
          <ProductForm
            key={editing?.id || "new"}
            product={editing}
            onClose={() => setShowForm(false)}
            onSave={(data: any) => {
              if (editing) {
                updateProduct(editing.id, data);
                toast.success("Produit modifié");
              } else {
                addProduct(data);
                toast.success("Produit ajouté");
              }
              setShowForm(false);
            }}
            onDelete={(id: string) => {
              deleteProduct(id);
              toast.success("Produit supprimé");
              setShowForm(false);
            }}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
};

const ProductForm = ({ product, onClose, onSave, onDelete }: any) => {
  const [name, setName] = useState<string>(product?.name ?? "");
  const [price, setPrice] = useState<string>(product?.price != null ? String(product.price) : "");
  const [cost, setCost] = useState<string>(product?.cost != null ? String(product.cost) : "");
  const [stock, setStock] = useState<string>(product?.stock != null ? String(product.stock) : "");
  const [minStock, setMinStock] = useState<string>(product?.minStock != null ? String(product.minStock) : "");
  const [category, setCategory] = useState<Category>(product?.category || "Autres");
  const [emoji, setEmoji] = useState(product?.emoji || "📦");

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-[32px] bg-card p-5 shadow-pop max-h-[90vh] overflow-y-auto"
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
            {product ? "Modifier" : "Nouveau produit"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <Field label="Nom du produit (ex: Riz, Huile)">
            <input value={name} placeholder="Nom du produit" onChange={(e) => setName(e.target.value)} className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Prix vente (BIF)">
              <input type="number" inputMode="numeric" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} className="input" />
            </Field>
            <Field label="Coût (BIF)">
              <input type="number" inputMode="numeric" placeholder="0" value={cost} onChange={(e) => setCost(e.target.value)} className="input" />
            </Field>
            <Field label="Stock initial (ex: 30)">
              <input type="number" inputMode="numeric" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value)} className="input" />
            </Field>
            <Field label="Alerte si ≤ (ex: 5)">
              <input type="number" inputMode="numeric" placeholder="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} className="input" />
            </Field>
          </div>

          <Field label="Catégorie">
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${category === c ? "gradient-mesh text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground"}`}>{c}</button>
              ))}
            </div>
          </Field>

          <Field label="Icône">
            <div className="flex flex-wrap gap-1.5">
              {emojis.map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl text-xl transition ${emoji === e ? "bg-primary/15 ring-2 ring-primary scale-110" : "bg-secondary"}`}>{e}</button>
              ))}
            </div>
          </Field>
        </div>

        <div className="mt-5 flex gap-2">
          {product && (
            <button onClick={() => onDelete(product.id)} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 size={18} />
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (!name.trim()) return toast.error("Nom requis");
              onSave({
                name: name.trim(),
                price: Number(price) || 0,
                cost: Number(cost) || 0,
                stock: Number(stock) || 0,
                minStock: Number(minStock) || 0,
                category,
                emoji,
              });
            }}
            className="flex-1 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow"
          >
            Enregistrer
          </motion.button>
        </div>
      </motion.div>
      <style>{`.input{width:100%;border-radius:0.875rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.75rem 0.875rem;font-size:0.875rem;outline:none;transition:all 0.2s}.input:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary) / 0.15)}`}</style>
    </motion.div>
  );
};

const Field = ({ label, children }: any) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Stock;
