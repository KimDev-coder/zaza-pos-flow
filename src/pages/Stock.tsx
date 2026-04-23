import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF, Category, Product } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const cats: Category[] = ["Féculents", "Viandes", "Légumes", "Boissons", "Autres"];
const emojis = ["🍚", "🍗", "🍟", "🥤", "🥩", "💧", "🥗", "🐟", "🥔", "🌽", "🍌", "🫘", "🥬", "🪨", "🫙", "🍞"];

const Stock = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("Tous");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = products.filter(
    (p) => (cat === "Tous" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell>
      <PageHeader title="Stock" subtitle={`${products.length} produits • ${products.filter(p => p.stock <= p.minStock).length} alertes`} />

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
                    {low && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-warning">Faible</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.category} • <span className="font-semibold gradient-text">{formatBIF(p.price)}</span></p>
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
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Aucun produit trouvé</p>}
      </div>

      <motion.button
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-mesh text-primary-foreground shadow-pop"
      >
        <Plus size={26} strokeWidth={2.6} />
      </motion.button>

      <ProductForm
        open={showForm}
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
    </AppShell>
  );
};

const ProductForm = ({ open, product, onClose, onSave, onDelete }: any) => {
  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState<number | "">(product?.price ?? "");
  const [cost, setCost] = useState<number | "">(product?.cost ?? "");
  const [stock, setStock] = useState<number | "">(product?.stock ?? "");
  const [minStock, setMinStock] = useState<number | "">(product?.minStock ?? "");
  const [category, setCategory] = useState<Category>(product?.category || "Autres");
  const [emoji, setEmoji] = useState(product?.emoji || "📦");

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-t-[32px] bg-card p-5 shadow-pop"
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>
              {product ? "Modifier" : "Nouveau produit"}
            </h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><X size={16} /></button>
          </div>

          <div className="space-y-3">
            <Field label="Nom"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix vente (BIF)"><input type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : +e.target.value)} className="input" /></Field>
              <Field label="Coût (BIF)"><input type="number" placeholder="0" value={cost} onChange={(e) => setCost(e.target.value === "" ? "" : +e.target.value)} className="input" /></Field>
              <Field label="Stock (ex: 30)"><input type="number" placeholder="0" value={stock} onChange={(e) => setStock(e.target.value === "" ? "" : +e.target.value)} className="input" /></Field>
              <Field label="Alerte min (ex: 5)"><input type="number" placeholder="0" value={minStock} onChange={(e) => setMinStock(e.target.value === "" ? "" : +e.target.value)} className="input" /></Field>
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
                onSave({ name, price: +price || 0, cost: +cost || 0, stock: +stock || 0, minStock: +minStock || 0, category, emoji });
              }}
              className="flex-1 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow"
            >
              Enregistrer
            </motion.button>
          </div>
        </motion.div>
        <style>{`.input{width:100%;border-radius:0.875rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.75rem 0.875rem;font-size:0.875rem;outline:none;transition:all 0.2s}.input:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary) / 0.15)}`}</style>
      </motion.div>
    </AnimatePresence>
  );
};

const Field = ({ label, children }: any) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Stock;
