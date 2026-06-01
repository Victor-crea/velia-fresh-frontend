import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/data/mockData";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "evelia_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, qty = 0.5) => {
    let blocked = false;
    setItems((curr) => {
      const existing = curr.find((i) => i.product.id === product.id);
      const currentQty = existing?.quantity ?? 0;
      const maxStock = product.stock ?? 0;
      if (maxStock <= 0) {
        blocked = true;
        toast.error(`${product.name} está agotado`);
        return curr;
      }
      const newQty = +(currentQty + qty).toFixed(2);
      if (newQty > maxStock) {
        blocked = true;
        toast.error(`Stock máximo disponible: ${maxStock} ${product.unit}`);
        return curr;
      }
      if (existing) {
        return curr.map((i) =>
          i.product.id === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [...curr, { product, quantity: qty }];
    });
    if (!blocked) {
      toast.success(`${product.name} agregado al carrito`, {
        description: `${qty} ${product.unit}`,
      });
    }
  };

  const removeItem = (id: string) => {
    setItems((curr) => curr.filter((i) => i.product.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((curr) =>
      curr.map((i) => {
        if (i.product.id !== id) return i;
        const max = i.product.stock ?? 0;
        if (qty > max) {
          toast.error(`Stock máximo disponible: ${max} ${i.product.unit}`);
          return { ...i, quantity: +max.toFixed(2) };
        }
        return { ...i, quantity: +qty.toFixed(2) };
      })
    );
  };

  const clear = () => setItems([]);

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.quantity * i.product.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
