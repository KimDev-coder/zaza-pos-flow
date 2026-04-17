import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF, Category, Product } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Pencil, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const cats: Category[] = ["Plats", "Grillades", "Boissons", "Accompagnements"];
const emojis = ["🍚", "🍗", "🍟", "🥤", "🍢", "💧", "🥗", "🐟", "🍔", "🍕", "🌮", "🍰"];

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
      <PageHeader title="Stock" subtitle={`${products.length} produits`} />

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit..."
          className="w-full rounded-2xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm shadow-soft outline-none focus:border-primary"
        />
      </div>

      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 no-scrollbar">
        {["Tous", ...cats].map((c) => (
          <button
            key={c} onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition ${cat === c ? "gradient-primary text-primary-foreground shadow-glow" : "bg-card text-muted-foreground shadow-soft"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((p, i) => {
          const ratio = Math.min(1, p.stock / Math.max(p.minStock * 3, 1));
          const low = p.stock <= p.minStock;
          return (
            <motion.div
              key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-2xl bg-card p-3 shadow-soft"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-2xl">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    {low && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-bold text-warning">FAIBLE</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.category} • {formatBIF(p.price)}</p>
                </div>
                <button onClick={() => { setEditing(p); setShowForm(true); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <Pencil size={14} />
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all ${low ? "bg-warning" : "bg-success"}`}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${low ? "text-warning" : "text-foreground"}`}>{p.stock}</span>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Aucun produit trouvé</p>}
      </div>

      <motion.button
        whileTap={{ scale: 0.92 }} onClick={() => { setEditing(null); setShowForm(true); }}
        className="fixed bottom-28 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-glow"
      >
        <Plus size={24} />
      </motion.button>

      <ProductForm
        open={showForm}
        product={editing}
        onClose={() => setShowForm(false)}
        onSave={(data) => {
          if (editing) {
            updateProduct(editing.id, data);
            toast.success("Produit modifié");
          } else {
            addProduct(data);
            toast.success("Produit ajouté");
          }
          setShowForm(false);
        }}
        onDelete={(id) => {
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
  const [price, setPrice] = useState(product?.price || 0);
  const [cost, setCost] = useState(product?.cost || 0);
  const [stock, setStock] = useState(product?.stock || 0);
  const [minStock, setMinStock] = useState(product?.minStock || 5);
  const [category, setCategory] = useState<Category>(product?.category || "Plats");
  const [emoji, setEmoji] = useState(product?.emoji || "🍽️");

  // reset on open
  useState(() => {});
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-t-3xl bg-card p-5 shadow-elegant"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{product ? "Modifier" : "Nouveau produit"}</h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"><X size={16} /></button>
          </div>

          <div className="space-y-3">
            <Field label="Nom"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prix vente (BIF)"><input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} className="input" /></Field>
              <Field label="Coût (BIF)"><input type="number" value={cost} onChange={(e) => setCost(+e.target.value)} className="input" /></Field>
              <Field label="Stock"><input type="number" value={stock} onChange={(e) => setStock(+e.target.value)} className="input" /></Field>
              <Field label="Stock min"><input type="number" value={minStock} onChange={(e) => setMinStock(+e.target.value)} className="input" /></Field>
            </div>

            <Field label="Catégorie">
              <div className="flex flex-wrap gap-1.5">
                {cats.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${category === c ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{c}</button>
                ))}
              </div>
            </Field>

            <Field label="Icône">
              <div className="flex flex-wrap gap-1.5">
                {emojis.map((e) => (
                  <button key={e} onClick={() => setEmoji(e)}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${emoji === e ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary"}`}>{e}</button>
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
            <button
              onClick={() => {
                if (!name.trim()) return toast.error("Nom requis");
                onSave({ name, price, cost, stock, minStock, category, emoji });
              }}
              className="flex-1 rounded-2xl gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow"
            >
              Enregistrer
            </button>
          </div>
        </motion.div>
        <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.625rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
      </motion.div>
    </AnimatePresence>
  );
};

const Field = ({ label, children }: any) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </label>
);

export default Stock;
