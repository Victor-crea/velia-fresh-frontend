import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

const Cart = () => {
  const { items, updateQty, removeItem, subtotal, clear } = useCart();
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-secondary grid place-items-center mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold">Tu carrito está vacío</h1>
          <p className="mt-3 text-muted-foreground">Empieza a llenarlo con nuestros mejores cortes.</p>
          <Link to="/catalogo" className="inline-block mt-8">
            <Button variant="hero" size="lg">Explorar catálogo <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container py-12">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Carrito</span>
            <h1 className="font-display text-4xl font-bold mt-1">Tu pedido</h1>
          </div>
          <Button variant="ghost" onClick={clear} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" /> Vaciar carrito
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-4 p-4 bg-card rounded-xl border border-border/60 shadow-soft animate-fade-in">
                <img src={product.image} alt={product.name} loading="lazy" className="h-24 w-24 sm:h-28 sm:w-28 rounded-lg object-cover" />
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-display text-lg font-semibold leading-tight">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">{product.category} · ${product.price}/{product.unit}</p>
                    </div>
                    <button onClick={() => removeItem(product.id)} className="text-muted-foreground hover:text-destructive transition-smooth">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center bg-secondary rounded-full">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => updateQty(product.id, quantity - 0.25)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="px-3 text-sm font-semibold tabular-nums w-16 text-center">{quantity} kg</span>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => updateQty(product.id, quantity + 0.25)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-display text-xl font-bold text-primary">
                      ${(quantity * product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-card rounded-xl border border-border/60 shadow-card p-6">
              <h2 className="font-display text-2xl font-bold mb-5">Resumen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium tabular-nums">{shipping === 0 ? "Gratis" : `$${shipping}`}</span>
                </div>
                {subtotal < 1500 && (
                  <p className="text-xs text-accent">Agrega ${(1500 - subtotal).toFixed(2)} más para envío gratis</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-display font-bold text-primary tabular-nums">${total.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="block mt-6">
                <Button variant="hero" size="lg" className="w-full">
                  Proceder al pago <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/catalogo" className="block text-center text-sm text-muted-foreground mt-4 hover:text-primary transition-smooth">
                ← Seguir comprando
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
};

export default Cart;
