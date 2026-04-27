import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/ProductCard";
import { categories, Category } from "@/data/mockData";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Search, PackageOpen, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Catalog = () => {
  const [active, setActive] = useState<Category | "Todos">("Todos");
  const [query, setQuery] = useState("");
  const { products, loading, error } = useProducts();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = active === "Todos" || p.category === active;
      const matchQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [active, query, products]);

  return (
    <Layout>
      <section className="bg-gradient-warm border-b border-border">
        <div className="container py-14 text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Catálogo</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Nuestros cortes</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Selección artesanal de las mejores carnes, listas para tu cocina.
          </p>

          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cortes..."
              className="pl-11 h-12 bg-background border-border"
            />
          </div>
        </div>
      </section>

      <section className="container py-10">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-4 px-4">
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setActive(c.name)}
              className={cn(
                "shrink-0 px-5 py-2.5 rounded-full text-sm font-medium border transition-smooth",
                active === c.name
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card border-border hover:border-primary/40 hover:text-primary"
              )}
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 grid place-items-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="py-24 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <PackageOpen className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-display text-2xl font-semibold">Sin resultados</h3>
            <p className="text-muted-foreground mt-2">Intenta con otra búsqueda o categoría.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Catalog;
