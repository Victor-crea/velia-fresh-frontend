import ribeye from "@/assets/product-ribeye.jpg";
import chicken from "@/assets/product-chicken.jpg";
import porkRibs from "@/assets/product-pork-ribs.jpg";
import chorizo from "@/assets/product-chorizo.jpg";
import groundBeef from "@/assets/product-ground-beef.jpg";
import lamb from "@/assets/product-lamb.jpg";
import picanha from "@/assets/product-picanha.jpg";
import bacon from "@/assets/product-bacon.jpg";

export type Category = "Res" | "Cerdo" | "Pollo" | "Cordero" | "Embutidos";

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number; // por kg
  unit: string;
  description: string;
  image: string;
  featured?: boolean;
  badge?: string;
  stock: number;
}

export const products: Product[] = [
  {
    id: "p1",
    name: "Ribeye Premium",
    category: "Res",
    price: 380,
    unit: "kg",
    description: "Corte jugoso con marmoleo perfecto, ideal para asar a la parrilla.",
    image: ribeye,
    featured: true,
    badge: "Top venta",
    stock: 24,
  },
  {
    id: "p2",
    name: "Picaña Selecta",
    category: "Res",
    price: 340,
    unit: "kg",
    description: "El corte estrella brasileño, suave y lleno de sabor.",
    image: picanha,
    featured: true,
    badge: "Premium",
    stock: 18,
  },
  {
    id: "p3",
    name: "Carne Molida Especial",
    category: "Res",
    price: 180,
    unit: "kg",
    description: "Molida fresca diariamente, 80% carne / 20% grasa.",
    image: groundBeef,
    stock: 40,
  },
  {
    id: "p4",
    name: "Costillas de Cerdo",
    category: "Cerdo",
    price: 220,
    unit: "kg",
    description: "Costillar tierno perfecto para hornear o ahumar.",
    image: porkRibs,
    featured: true,
    stock: 15,
  },
  {
    id: "p5",
    name: "Tocino Ahumado",
    category: "Cerdo",
    price: 260,
    unit: "kg",
    description: "Ahumado lentamente con madera de manzano. Sabor inigualable.",
    image: bacon,
    badge: "Artesanal",
    stock: 22,
  },
  {
    id: "p6",
    name: "Pechuga de Pollo",
    category: "Pollo",
    price: 140,
    unit: "kg",
    description: "Pollo de granja, sin hormonas. Pechuga deshuesada.",
    image: chicken,
    stock: 50,
  },
  {
    id: "p7",
    name: "Chuletas de Cordero",
    category: "Cordero",
    price: 460,
    unit: "kg",
    description: "Cortes finos de cordero lechal. Suavidad excepcional.",
    image: lamb,
    badge: "Edición limitada",
    stock: 8,
  },
  {
    id: "p8",
    name: "Chorizo Argentino",
    category: "Embutidos",
    price: 200,
    unit: "kg",
    description: "Receta tradicional con especias seleccionadas.",
    image: chorizo,
    featured: true,
    stock: 35,
  },
];

export const categories: { name: Category | "Todos"; emoji: string }[] = [
  { name: "Todos", emoji: "🥩" },
  { name: "Res", emoji: "🐄" },
  { name: "Cerdo", emoji: "🐖" },
  { name: "Pollo", emoji: "🐓" },
  { name: "Cordero", emoji: "🐑" },
  { name: "Embutidos", emoji: "🌭" },
];

export interface MockOrder {
  id: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  status: "Pendiente" | "Preparando" | "Entregado" | "Cancelado";
}

export const mockOrders: MockOrder[] = [
  { id: "EVE-1042", date: "2025-04-18", customer: "María García", items: 4, total: 1240, status: "Entregado" },
  { id: "EVE-1043", date: "2025-04-19", customer: "Juan Pérez", items: 2, total: 680, status: "Entregado" },
  { id: "EVE-1044", date: "2025-04-20", customer: "Carla Méndez", items: 6, total: 2150, status: "Preparando" },
  { id: "EVE-1045", date: "2025-04-20", customer: "Roberto Silva", items: 3, total: 940, status: "Pendiente" },
  { id: "EVE-1046", date: "2025-04-21", customer: "Ana López", items: 5, total: 1780, status: "Pendiente" },
  { id: "EVE-1047", date: "2025-04-21", customer: "Luis Hernández", items: 1, total: 380, status: "Cancelado" },
];

export interface MockUser {
  id: string;
  name: string;
  email: string;
  orders: number;
  joined: string;
  role: "Cliente" | "Admin";
}

export const mockUsers: MockUser[] = [
  { id: "u1", name: "María García", email: "maria@example.com", orders: 12, joined: "2024-08-12", role: "Cliente" },
  { id: "u2", name: "Juan Pérez", email: "juan@example.com", orders: 8, joined: "2024-09-04", role: "Cliente" },
  { id: "u3", name: "Carla Méndez", email: "carla@example.com", orders: 23, joined: "2024-05-22", role: "Cliente" },
  { id: "u4", name: "Evelia Ramírez", email: "evelia@carniceria.com", orders: 0, joined: "2024-01-10", role: "Admin" },
  { id: "u5", name: "Roberto Silva", email: "roberto@example.com", orders: 4, joined: "2025-01-18", role: "Cliente" },
];

export const userOrderHistory: MockOrder[] = [
  { id: "EVE-0987", date: "2025-03-12", customer: "Tú", items: 3, total: 920, status: "Entregado" },
  { id: "EVE-1012", date: "2025-03-28", customer: "Tú", items: 5, total: 1640, status: "Entregado" },
  { id: "EVE-1044", date: "2025-04-20", customer: "Tú", items: 6, total: 2150, status: "Preparando" },
];
