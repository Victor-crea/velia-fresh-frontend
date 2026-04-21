import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      clear();
      toast.success("¡Pedido confirmado!", { description: "Recibirás un correo con los detalles." });
    }, 1800);
  };

  if (done) {
    return (
      <Layout>
        <div className="container py-24 text-center max-w-lg animate-scale-in">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 grid place-items-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold">¡Gracias por tu compra!</h1>
          <p className="mt-3 text-muted-foreground">
            Tu pedido <span className="font-mono text-primary">EVE-{Math.floor(1000 + Math.random() * 9000)}</span> está siendo preparado.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Button onClick={() => navigate("/perfil")} variant="hero">Ver mi pedido</Button>
            <Button onClick={() => navigate("/")} variant="outline">Volver al inicio</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-24 text-center">
          <h1 className="font-display text-3xl font-bold">No hay nada en tu carrito</h1>
          <Link to="/catalogo" className="inline-block mt-6">
            <Button variant="hero">Ir al catálogo</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="container py-12">
        <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Checkout</span>
        <h1 className="font-display text-4xl font-bold mt-1 mb-8">Finalizar compra</h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Datos de envío</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Nombre completo</Label><Input required placeholder="María García" className="mt-1.5" /></div>
                <div><Label>Email</Label><Input required type="email" placeholder="tu@email.com" className="mt-1.5" /></div>
                <div><Label>Teléfono</Label><Input required placeholder="55 1234 5678" className="mt-1.5" /></div>
                <div className="sm:col-span-2"><Label>Dirección</Label><Input required placeholder="Calle, número, colonia" className="mt-1.5" /></div>
                <div><Label>Ciudad</Label><Input required placeholder="CDMX" className="mt-1.5" /></div>
                <div><Label>Código postal</Label><Input required placeholder="03100" className="mt-1.5" /></div>
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Pago</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><Label>Número de tarjeta</Label><Input required placeholder="4242 4242 4242 4242" className="mt-1.5" /></div>
                <div><Label>Vencimiento</Label><Input required placeholder="MM/AA" className="mt-1.5" /></div>
                <div><Label>CVV</Label><Input required placeholder="123" className="mt-1.5" /></div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">🔒 Pago simulado. No se procesa ningún cargo real.</p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-card rounded-xl border border-border/60 shadow-card p-6">
              <h2 className="font-display text-xl font-bold mb-4">Tu pedido</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {product.name} <span className="text-xs">×{quantity}kg</span>
                    </span>
                    <span className="tabular-nums font-medium">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border my-4" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className="tabular-nums">{shipping === 0 ? "Gratis" : `$${shipping}`}</span></div>
                <div className="border-t border-border pt-2 flex justify-between text-lg"><span className="font-semibold">Total</span><span className="font-display font-bold text-primary tabular-nums">${total.toFixed(2)}</span></div>
              </div>
              <Button type="submit" disabled={loading} variant="hero" size="lg" className="w-full mt-6">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : "Confirmar pedido"}
              </Button>
            </div>
          </aside>
        </form>
      </section>
    </Layout>
  );
};

export default Checkout;
