import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/mockData";

interface Row {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Product["category"];
  image: string | null;
  stock: number;
  featured: boolean;
  badge: string | null;
  unit: string;
}

const toProduct = (r: Row): Product => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: Number(r.price),
  category: r.category,
  image: r.image ?? "",
  stock: Number(r.stock),
  featured: r.featured,
  badge: r.badge,
  unit: r.unit,
});

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) setError(error.message);
    else setProducts((data as Row[]).map(toProduct));
    setLoading(false);
  };

  useEffect(() => { refetch(); }, []);

  return { products, loading, error, refetch };
};
