import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF } from "@/store/useStore";
import { motion } from "framer-motion";
import { Plus, ShoppingBasket, Zap } from "lucide-react";
import { toast } from "sonner";

const Achats = () => {
  const { products, purchases, expenses, addPurchase, addExpense } = useStore();
  const [tab, setTab] = useState<"achats" | "depenses">("achats");

  const [pid, setPid] = useState("");
  const [pqty, setPqty] = useState<number | "">("");
  const [pcost, setPcost] = useState<number | "">("");

  const [type, setType] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [desc, setDesc] = useState("");

  const submitPurchase = () => {
    const q = Number(pqty), c = Number(pcost);
    if (!pid.trim()) return toast.error("Saisissez un produit");
    if (q <= 0 || c <= 0) return toast.error("Champs invalides");
    addPurchase(pid.trim(), q, c);
    toast.success("Achat enregistré");
    setPid(""); setPqty(""); setPcost("");
  };
  const submitExpense = () => {
    const a = Number(amount);
    if (!type.trim()) return toast.error("Type de dépense requis");
    if (a <= 0) return toast.error("Montant invalide");
    addExpense(type.trim(), a, desc);
    toast.success("Dépense enregistrée");
    setType(""); setAmount(""); setDesc("");
  };

  return (
    <AppShell>
      <PageHeader title="Achats & Dépenses" subtitle="Gérez vos approvisionnements" />

      <div className="relative mb-4 flex rounded-2xl bg-secondary p-1 ring-1 ring-border/50">
        {([
          { v: "achats", l: "Achats", icon: ShoppingBasket },
          { v: "depenses", l: "Dépenses", icon: Zap },
        ] as const).map(({ v, l, icon: Icon }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors ${tab === v ? "text-primary-foreground" : "text-muted-foreground"}`}>
            {tab === v && (
              <motion.div layoutId="tabPill" className="absolute inset-0 rounded-xl gradient-mesh shadow-glow"
                transition={{ type: "spring", stiffness: 380, damping: 30 }} />
            )}
            <span className="relative z-10 flex items-center gap-1.5"><Icon size={14} /> {l}</span>
          </button>
        ))}
      </div>

      {tab === "achats" ? (
        <>
          <Card>
            <h3 className="mb-3 text-sm font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Nouvel achat</h3>
            <Field label="Produit">
              <input value={pid} onChange={(e) => setPid(e.target.value)} placeholder="Ex: Riz, Huile, Charbon..." className="input" />
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Quantité"><input type="number" min={1} value={pqty} onChange={(e) => setPqty(e.target.value === "" ? "" : +e.target.value)} placeholder="Ex: 10" className="input" /></Field>
              <Field label="Coût unitaire"><input type="number" min={0} value={pcost} onChange={(e) => setPcost(e.target.value === "" ? "" : +e.target.value)} placeholder="Ex: 5000" className="input" /></Field>
            </div>
            <motion.div
              key={Number(pqty) * Number(pcost)}
              initial={{ scale: 0.95 }} animate={{ scale: 1 }}
              className="mt-3 flex items-center justify-between rounded-2xl bg-accent px-4 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
              <span className="text-lg font-extrabold gradient-text" style={{ fontFamily: "Sora, sans-serif" }}>{formatBIF(Number(pqty) * Number(pcost))}</span>
            </motion.div>
            <Button onClick={submitPurchase}><Plus size={14} strokeWidth={3} /> Ajouter l'achat</Button>
          </Card>

          <h3 className="mt-6 mb-3 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Historique</h3>
          <div className="space-y-2">
            {purchases.length === 0 && <Empty label="Aucun achat enregistré" />}
            {purchases.map((p, i) => (
              <Row key={p.id} delay={i * 0.04}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">{p.qty} × {formatBIF(p.unitCost)}</p>
                </div>
                <p className="text-sm font-extrabold text-warning tabular-nums">-{formatBIF(p.total)}</p>
              </Row>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card>
            <h3 className="mb-3 text-sm font-extrabold tracking-tight" style={{ fontFamily: "Sora, sans-serif" }}>Nouvelle dépense</h3>
            <Field label="Type de dépense"><input value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex: Électricité, transport..." className="input" /></Field>
            <div className="mt-3"><Field label="Montant (BIF)"><input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value === "" ? "" : +e.target.value)} placeholder="Ex: 10000" className="input" /></Field></div>
            <div className="mt-3"><Field label="Description"><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optionnel" className="input" /></Field></div>
            <Button onClick={submitExpense}><Plus size={14} strokeWidth={3} /> Ajouter la dépense</Button>
          </Card>

          <h3 className="mt-6 mb-3 px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Historique</h3>
          <div className="space-y-2">
            {expenses.length === 0 && <Empty label="Aucune dépense" />}
            {expenses.map((e, i) => (
              <Row key={e.id} delay={i * 0.04}>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning/15 text-warning"><Zap size={18} /></div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-bold">{e.type}</p>
                  {e.description && <p className="truncate text-xs text-muted-foreground">{e.description}</p>}
                </div>
                <p className="text-sm font-extrabold text-warning tabular-nums">-{formatBIF(e.amount)}</p>
              </Row>
            ))}
          </div>
        </>
      )}

      <style>{`.input{width:100%;border-radius:0.875rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.75rem 0.875rem;font-size:0.875rem;outline:none;transition:all 0.2s}.input:focus{border-color:hsl(var(--primary));box-shadow:0 0 0 3px hsl(var(--primary) / 0.15)}`}</style>
    </AppShell>
  );
};

const Card = ({ children }: any) => <div className="rounded-3xl gradient-card p-5 shadow-soft ring-1 ring-border/50">{children}</div>;
const Field = ({ label, children }: any) => (
  <label className="block"><span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>{children}</label>
);
const Button = ({ children, onClick }: any) => (
  <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl gradient-mesh py-3.5 text-sm font-extrabold tracking-tight text-primary-foreground shadow-glow transition hover:shadow-pop">
    {children}
  </motion.button>
);
const Row = ({ children, delay }: any) => (
  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay, type: "spring", stiffness: 280, damping: 22 }}
    whileHover={{ x: 3 }}
    className="flex items-center gap-3 rounded-2xl gradient-card p-3.5 shadow-soft ring-1 ring-border/50 transition hover:shadow-elegant">{children}</motion.div>
);
const Empty = ({ label }: any) => <p className="rounded-2xl gradient-card p-6 text-center text-sm text-muted-foreground shadow-soft ring-1 ring-border/50">{label}</p>;

export default Achats;
