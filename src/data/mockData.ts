export type Category = "Res" | "Cerdo" | "Pollo" | "Cordero" | "Embutidos";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  unit: string;
  description: string;
  image: string;
  featured?: boolean;
  badge?: string | null;
  stock: number;
}

export const categories: { name: Category | "Todos"; emoji: string }[] = [
  { name: "Todos", emoji: "🥩" },
  { name: "Res", emoji: "🐄" },
  { name: "Cerdo", emoji: "🐖" },
  { name: "Pollo", emoji: "🐓" },
  { name: "Cordero", emoji: "🐑" },
  { name: "Embutidos", emoji: "🌭" },
];
