import { Product } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart } from "lucide-react";

export const ProductCard = ({ product }: { product: Product }) => {
  const { addItem } = useCart();
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-soft hover:shadow-elegant transition-smooth border border-border/50">
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />
        {product.badge && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground border-0 shadow-soft">
            {product.badge}
          </Badge>
        )}
        <Badge variant="outline" className="absolute top-3 right-3 bg-background/90 backdrop-blur border-0 text-xs">
          {product.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 flex-1">{product.description}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="font-display text-2xl font-bold text-primary">${product.price}</span>
            <span className="text-sm text-muted-foreground">/{product.unit}</span>
          </div>
          <Button size="sm" onClick={() => addItem(product)}>
            <ShoppingCart className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>
    </article>
  );
};
