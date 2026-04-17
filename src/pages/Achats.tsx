import { useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { useStore, formatBIF } from "@/store/useStore";
import { motion } from "framer-motion";
import { Plus, ShoppingBasket, Zap } from "lucide-react";
import { toast } from "sonner";

const Achats = () => {
  const { products, purchases, expenses, addPurchase, addExpense } = useStore();
  const [tab, setTab] = useState<"achats" | "depenses">("achats");

  // Achat form
  const [pid, setPid] = useState(products[0]?.id || "");
  const [pqty, setPqty] = useState(1);
  const [pcost, setPcost] = useState(0);

  // Dépense form
  const [type, setType] = useState("Électricité");
  const [amount, setAmount] = useState(0);
  const [desc, setDesc] = useState("");
  const types = ["Électricité", "Eau", "Transport", "Salaire", "Loyer", "Autre"];

  const submitPurchase = () => {
    if (!pid || pqty <= 0 || pcost <= 0) return toast.error("Champs invalides");
    addPurchase(pid, pqty, pcost);
    toast.success("Achat enregistré");
    setPqty(1); setPcost(0);
  };
  const submitExpense = () => {
    if (amount <= 0) return toast.error("Montant invalide");
    addExpense(type, amount, desc);
    toast.success("Dépense enregistrée");
    setAmount(0); setDesc("");
  };

  return (
    <AppShell>
      <PageHeader title="Achats & Dépenses" />

      <div className="mb-4 flex rounded-2xl bg-secondary p-1">
        {([
          { v: "achats", l: "Achats", icon: ShoppingBasket },
          { v: "depenses", l: "Dépenses", icon: Zap },
        ] as const).map(({ v, l, icon: Icon }) => (
          <button key={v} onClick={() => setTab(v)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition ${tab === v ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
            <Icon size={14} /> {l}
          </button>
        ))}
      </div>

      {tab === "achats" ? (
        <>
          <Card>
            <h3 className="mb-3 text-sm font-bold">Nouvel achat</h3>
            <Field label="Produit">
              <select value={pid} onChange={(e) => setPid(e.target.value)} className="input">
                {products.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </Field>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Quantité"><input type="number" min={1} value={pqty} onChange={(e) => setPqty(+e.target.value)} className="input" /></Field>
              <Field label="Coût unitaire"><input type="number" min={0} value={pcost || ""} onChange={(e) => setPcost(+e.target.value)} className="input" /></Field>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-accent/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">{formatBIF(pqty * pcost)}</span>
            </div>
            <Button onClick={submitPurchase}><Plus size={14} /> Ajouter l'achat</Button>
          </Card>

          <h3 className="mt-6 mb-2 text-sm font-bold">Historique</h3>
          <div className="space-y-2">
            {purchases.length === 0 && <Empty label="Aucun achat enregistré" />}
            {purchases.map((p, i) => (
              <Row key={p.id} delay={i * 0.04}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{p.productName}</p>
                  <p className="text-xs text-muted-foreground">{p.qty} × {formatBIF(p.unitCost)}</p>
                </div>
                <p className="text-sm font-bold text-warning">-{formatBIF(p.total)}</p>
              </Row>
            ))}
          </div>
        </>
      ) : (
        <>
          <Card>
            <h3 className="mb-3 text-sm font-bold">Nouvelle dépense</h3>
            <Field label="Type">
              <div className="flex flex-wrap gap-1.5">
                {types.map((t) => (
                  <button key={t} onClick={() => setType(t)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${type === t ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{t}</button>
                ))}
              </div>
            </Field>
            <div className="mt-3"><Field label="Montant (BIF)"><input type="number" min={0} value={amount || ""} onChange={(e) => setAmount(+e.target.value)} className="input" /></Field></div>
            <div className="mt-3"><Field label="Description"><input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optionnel" className="input" /></Field></div>
            <Button onClick={submitExpense}><Plus size={14} /> Ajouter la dépense</Button>
          </Card>

          <h3 className="mt-6 mb-2 text-sm font-bold">Historique</h3>
          <div className="space-y-2">
            {expenses.length === 0 && <Empty label="Aucune dépense" />}
            {expenses.map((e, i) => (
              <Row key={e.id} delay={i * 0.04}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning"><Zap size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold">{e.type}</p>
                  {e.description && <p className="truncate text-xs text-muted-foreground">{e.description}</p>}
                </div>
                <p className="text-sm font-bold text-warning">-{formatBIF(e.amount)}</p>
              </Row>
            ))}
          </div>
        </>
      )}

      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid hsl(var(--border));background:hsl(var(--background));padding:0.625rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:hsl(var(--primary))}`}</style>
    </AppShell>
  );
};

const Card = ({ children }: any) => <div className="rounded-2xl bg-card p-4 shadow-soft">{children}</div>;
const Field = ({ label, children }: any) => (
  <label className="block"><span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>{children}</label>
);
const Button = ({ children, onClick }: any) => (
  <motion.button whileTap={{ scale: 0.97 }} onClick={onClick}
    className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-2xl gradient-primary py-3 text-sm font-bold text-primary-foreground shadow-glow">
    {children}
  </motion.button>
);
const Row = ({ children, delay }: any) => (
  <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay }}
    className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">{children}</motion.div>
);
const Empty = ({ label }: any) => <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">{label}</p>;

export default Achats;
