import { create } from "zustand";

export type Category = "Féculents" | "Viandes" | "Légumes" | "Boissons" | "Autres";
export type PaymentMethod = "Cash" | "Mobile Money" | "Carte";
export type Role = "Admin" | "Manager" | "Caissier";
export type Permission = "dashboard" | "ventes" | "stock" | "achats" | "profil";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar?: string;
  permissions: Permission[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category: Category;
  emoji: string;
  cost: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  discount: number;
  payment: PaymentMethod;
  date: string;
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unitCost: number;
  total: number;
  date: string;
}

export interface Expense {
  id: string;
  type: string;
  amount: number;
  description: string;
  date: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: "ajout" | "vente" | "achat" | "ajustement" | "suppression";
  qty: number;        // positif = entrée, négatif = sortie
  stockAfter: number;
  note?: string;
  date: string;
}

interface State {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  movements: StockMovement[];
  user: AppUser;
  users: AppUser[];
  catalog: { name: string; emoji: string }[];
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>, note?: string) => void;
  deleteProduct: (id: string) => void;
  addSale: (items: SaleItem[], discount: number, payment: PaymentMethod) => void;
  addPurchase: (productId: string, qty: number, unitCost: number) => void;
  addExpense: (type: string, amount: number, description: string) => void;
  updateUser: (u: Partial<AppUser>) => void;
  updateUserPermissions: (id: string, perms: Permission[]) => void;
  updateUserRole: (id: string, role: Role) => void;
  loginAs: (id: string) => void;
  changePassword: (currentPwd: string, newPwd: string) => boolean;
}

const today = () => new Date().toISOString();

// Catalogue rapide pour la vente — le vendeur définit le prix au moment de la vente
const catalog = [
  { name: "Ubugari bw'imyumbati", emoji: "🍞" },
  { name: "Ubugari bw'isembe", emoji: "🌽" },
  { name: "Umuceri w'amazi", emoji: "🍚" },
  { name: "Umuceri w'ipilau", emoji: "🍛" },
  { name: "Inyama y'inka", emoji: "🥩" },
  { name: "Inyama y'inkoko", emoji: "🍗" },
  { name: "Inyama y'ibitunguru", emoji: "🧅" },
  { name: "Isombe", emoji: "🥬" },
  { name: "Ikinono", emoji: "🍲" },
  { name: "Ilengalenga", emoji: "🌿" },
  { name: "Amafiriti", emoji: "🍟" },
  { name: "Ibiraya", emoji: "🥔" },
  { name: "Igitoke", emoji: "🍌" },
  { name: "Ibiharage", emoji: "🫘" },
  { name: "Ubushaza", emoji: "🌱" },
];

// Stock vide par défaut — l'utilisateur ajoute manuellement ses produits
const seedProducts: Product[] = [];

const defaultUsers: AppUser[] = [
  { id: "u1", name: "Admin Zaza", email: "zazafood@gmail.com", password: "1234", role: "Admin", permissions: ["dashboard", "ventes", "stock", "achats", "profil"] },
  { id: "u2", name: "Jean Bosco", email: "jean@zazafood.bi", password: "1234", role: "Manager", permissions: ["dashboard", "ventes", "stock", "profil"] },
  { id: "u3", name: "Claudine M.", email: "claudine@zazafood.bi", password: "1234", role: "Caissier", permissions: ["ventes", "profil"] },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>((set) => ({
  products: seedProducts,
  sales: [],
  purchases: [],
  expenses: [],
  movements: [],
  user: defaultUsers[0],
  users: defaultUsers,
  catalog,

  addProduct: (p) =>
    set((s) => {
      const newP: Product = { ...p, id: uid() };
      const mv: StockMovement = {
        id: uid(),
        productId: newP.id,
        productName: newP.name,
        type: "ajout",
        qty: newP.stock,
        stockAfter: newP.stock,
        note: "Création produit",
        date: today(),
      };
      return { products: [...s.products, newP], movements: [mv, ...s.movements] };
    }),
  updateProduct: (id, p, note) =>
    set((s) => {
      const prev = s.products.find((x) => x.id === id);
      const products = s.products.map((x) => (x.id === id ? { ...x, ...p } : x));
      const next = products.find((x) => x.id === id);
      const movements = [...s.movements];
      if (prev && next && p.stock !== undefined && next.stock !== prev.stock) {
        movements.unshift({
          id: uid(),
          productId: id,
          productName: next.name,
          type: "ajustement",
          qty: next.stock - prev.stock,
          stockAfter: next.stock,
          note: note || "Ajustement manuel",
          date: today(),
        });
      }
      return { products, movements };
    }),
  deleteProduct: (id) =>
    set((s) => {
      const prev = s.products.find((x) => x.id === id);
      const movements = prev
        ? [{ id: uid(), productId: id, productName: prev.name, type: "suppression" as const, qty: -prev.stock, stockAfter: 0, note: "Produit supprimé", date: today() }, ...s.movements]
        : s.movements;
      return { products: s.products.filter((x) => x.id !== id), movements };
    }),

  addSale: (items, discount, payment) =>
    set((s) => {
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const total = Math.max(0, subtotal - discount);
      const sale: Sale = { id: uid(), items, total, discount, payment, date: today() };
      const newMoves: StockMovement[] = [];
      const products = s.products.map((p) => {
        const it = items.find((i) => i.productId === p.id);
        if (!it) return p;
        const stockAfter = Math.max(0, p.stock - it.qty);
        newMoves.push({
          id: uid(),
          productId: p.id,
          productName: p.name,
          type: "vente",
          qty: -it.qty,
          stockAfter,
          note: `Vente #${sale.id}`,
          date: sale.date,
        });
        return { ...p, stock: stockAfter };
      });
      return { sales: [sale, ...s.sales], products, movements: [...newMoves, ...s.movements] };
    }),

  addPurchase: (productId, qty, unitCost) =>
    set((s) => {
      const product = s.products.find((p) => p.id === productId);
      if (!product) return s;
      const purchase: Purchase = {
        id: uid(),
        productId,
        productName: product.name,
        qty,
        unitCost,
        total: qty * unitCost,
        date: today(),
      };
      const stockAfter = product.stock + qty;
      const products = s.products.map((p) =>
        p.id === productId ? { ...p, stock: stockAfter } : p
      );
      const mv: StockMovement = {
        id: uid(),
        productId,
        productName: product.name,
        type: "achat",
        qty,
        stockAfter,
        note: `Achat ${formatBIF(qty * unitCost)}`,
        date: purchase.date,
      };
      return { purchases: [purchase, ...s.purchases], products, movements: [mv, ...s.movements] };
    }),

  addExpense: (type, amount, description) =>
    set((s) => ({
      expenses: [{ id: uid(), type, amount, description, date: today() }, ...s.expenses],
    })),

  updateUser: (u) => set((s) => ({ user: { ...s.user, ...u }, users: s.users.map((x) => (x.id === s.user.id ? { ...x, ...u } : x)) })),
  updateUserPermissions: (id, perms) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, permissions: perms } : u)),
      user: s.user.id === id ? { ...s.user, permissions: perms } : s.user,
    })),
  updateUserRole: (id, role) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role } : u)),
      user: s.user.id === id ? { ...s.user, role } : s.user,
    })),
  loginAs: (id) =>
    set((s) => {
      const u = s.users.find((x) => x.id === id);
      return u ? { user: u } : s;
    }),
  changePassword: (currentPwd, newPwd) => {
    let ok = false;
    set((s) => {
      if (s.user.password !== currentPwd) return s;
      ok = true;
      const user = { ...s.user, password: newPwd };
      return { user, users: s.users.map((u) => (u.id === user.id ? user : u)) };
    });
    return ok;
  },
}));

export const formatBIF = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " BIF";
