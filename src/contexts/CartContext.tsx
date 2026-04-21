import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "@/data/mockData";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number; // en kg, paso 0.25
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

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, qty = 0.5) => {
    setItems((curr) => {
      const existing = curr.find((i) => i.product.id === product.id);
      if (existing) {
        return curr.map((i) =>
          i.product.id === product.id ? { ...i, quantity: +(i.quantity + qty).toFixed(2) } : i
        );
      }
      return [...curr, { product, quantity: qty }];
    });
    toast.success(`${product.name} agregado al carrito`, {
      description: `${qty} ${product.unit}`,
    });
  };

  const removeItem = (id: string) => {
    setItems((curr) => curr.filter((i) => i.product.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((curr) =>
      curr.map((i) => (i.product.id === id ? { ...i, quantity: +qty.toFixed(2) } : i))
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
