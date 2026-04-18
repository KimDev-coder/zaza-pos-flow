import { create } from "zustand";

export type Category = "Féculents" | "Viandes" | "Légumes" | "Boissons" | "Autres";
export type PaymentMethod = "Cash" | "Mobile Money" | "Carte";
export type Role = "Admin" | "Manager" | "Caissier";
export type Permission = "dashboard" | "ventes" | "stock" | "achats" | "profil";

export interface AppUser {
  id: string;
  name: string;
  email: string;
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

interface State {
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  expenses: Expense[];
  user: { name: string; role: string; email: string };
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addSale: (items: SaleItem[], discount: number, payment: PaymentMethod) => void;
  addPurchase: (productId: string, qty: number, unitCost: number) => void;
  addExpense: (type: string, amount: number, description: string) => void;
}

const today = () => new Date().toISOString();

const seedProducts: Product[] = [
  { id: "p1", name: "Riz au poulet", price: 5000, cost: 2800, stock: 24, minStock: 5, category: "Plats", emoji: "🍚" },
  { id: "p2", name: "Poulet braisé", price: 8000, cost: 4500, stock: 12, minStock: 4, category: "Grillades", emoji: "🍗" },
  { id: "p3", name: "Frites", price: 2500, cost: 900, stock: 40, minStock: 10, category: "Accompagnements", emoji: "🍟" },
  { id: "p4", name: "Soda 50cl", price: 1500, cost: 700, stock: 3, minStock: 12, category: "Boissons", emoji: "🥤" },
  { id: "p5", name: "Brochettes (x3)", price: 4000, cost: 2000, stock: 18, minStock: 6, category: "Grillades", emoji: "🍢" },
  { id: "p6", name: "Eau minérale", price: 1000, cost: 400, stock: 50, minStock: 15, category: "Boissons", emoji: "💧" },
  { id: "p7", name: "Salade fraîche", price: 3000, cost: 1200, stock: 8, minStock: 5, category: "Accompagnements", emoji: "🥗" },
  { id: "p8", name: "Tilapia grillé", price: 9000, cost: 5000, stock: 6, minStock: 3, category: "Grillades", emoji: "🐟" },
];

const seedSales: Sale[] = [
  {
    id: "s1",
    items: [{ productId: "p1", name: "Riz au poulet", price: 5000, qty: 2 }],
    total: 10000,
    discount: 0,
    payment: "Cash",
    date: today(),
  },
  {
    id: "s2",
    items: [
      { productId: "p2", name: "Poulet braisé", price: 8000, qty: 1 },
      { productId: "p4", name: "Soda 50cl", price: 1500, qty: 2 },
    ],
    total: 11000,
    discount: 0,
    payment: "Mobile Money",
    date: today(),
  },
  {
    id: "s3",
    items: [{ productId: "p5", name: "Brochettes (x3)", price: 4000, qty: 3 }],
    total: 12000,
    discount: 0,
    payment: "Carte",
    date: today(),
  },
];

const seedExpenses: Expense[] = [
  { id: "e1", type: "Électricité", amount: 15000, description: "Facture mensuelle", date: today() },
  { id: "e2", type: "Transport", amount: 5000, description: "Livraison marché", date: today() },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<State>((set) => ({
  products: seedProducts,
  sales: seedSales,
  purchases: [],
  expenses: seedExpenses,
  user: { name: "Aïcha Niyongabo", role: "Admin", email: "aicha@zazafood.bi" },

  addProduct: (p) => set((s) => ({ products: [...s.products, { ...p, id: uid() }] })),
  updateProduct: (id, p) =>
    set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),
  deleteProduct: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

  addSale: (items, discount, payment) =>
    set((s) => {
      const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const total = Math.max(0, subtotal - discount);
      const sale: Sale = { id: uid(), items, total, discount, payment, date: today() };
      const products = s.products.map((p) => {
        const it = items.find((i) => i.productId === p.id);
        return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p;
      });
      return { sales: [sale, ...s.sales], products };
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
      const products = s.products.map((p) =>
        p.id === productId ? { ...p, stock: p.stock + qty } : p
      );
      return { purchases: [purchase, ...s.purchases], products };
    }),

  addExpense: (type, amount, description) =>
    set((s) => ({
      expenses: [{ id: uid(), type, amount, description, date: today() }, ...s.expenses],
    })),
}));

export const formatBIF = (n: number) =>
  new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " BIF";
