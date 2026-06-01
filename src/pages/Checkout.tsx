import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

const Checkout = () => {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [shipping, setShipping] = useState({ full_name: "", phone: "", address: "" });
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const shippingCost = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, phone, address").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setShipping({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "" }); });
  }, [user]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!shipping.full_name.trim()) e.full_name = "Nombre requerido";
    if (!/^\d{10}$/.test(shipping.phone)) e.phone = "Teléfono debe tener 10 dígitos";
    if (!shipping.address.trim()) e.address = "Dirección requerida";

    const cardDigits = card.number.replace(/\s/g, "");
    if (!/^\d{16}$/.test(cardDigits)) e.cardNumber = "Número debe tener 16 dígitos";

    const expMatch = card.expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) e.expiry = "Formato MM/AA";
    else {
      const mm = parseInt(expMatch[1], 10);
      const yy = parseInt(expMatch[2], 10);
      if (mm < 1 || mm > 12) e.expiry = "Mes inválido";
      else {
        const now = new Date();
        const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
        if (expDate < now) e.expiry = "Tarjeta expirada";
      }
    }

    if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = "CVV inválido";
    if (!/^[A-Za-zÀ-ÿ\s]{2,}$/.test(card.name.trim())) e.cardName = "Nombre del titular inválido";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validate()) {
      toast.error("Revisa los campos del formulario");
      return;
    }
    setLoading(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          shipping_address: `${shipping.full_name} · ${shipping.phone} · ${shipping.address}`,
          status: "pendiente",
        })
        .select("id")
        .single();
      if (error) throw error;

      const itemsPayload = items.map((i) => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      }));
      const { error: itErr } = await supabase.from("order_items").insert(itemsPayload);
      if (itErr) throw itErr;

      // Descontar stock del inventario
      await Promise.all(
        items.map((i) =>
          supabase
            .from("products")
            .update({ stock: Math.max(0, +(i.product.stock - i.quantity).toFixed(2)) })
            .eq("id", i.product.id)
        )
      );

      // Update profile if changed
      await supabase.from("profiles").update({
        full_name: shipping.full_name, phone: shipping.phone, address: shipping.address,
      }).eq("user_id", user.id);

      clear();
      setDone(order.id);
      toast.success("¡Pedido confirmado!");
    } catch (err: any) {
      toast.error(err.message ?? "Error al crear pedido");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Layout>
        <div className="container py-24 text-center max-w-lg animate-scale-in mx-auto">
          <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 grid place-items-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold">¡Gracias por tu compra!</h1>
          <p className="mt-3 text-muted-foreground">
            Tu pedido <span className="font-mono text-primary">#{done.slice(0, 8).toUpperCase()}</span> está siendo preparado.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Button onClick={() => navigate("/perfil")} variant="hero">Ver mis pedidos</Button>
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

  const errMsg = (k: string) =>
    errors[k] ? <p className="text-xs text-destructive mt-1">{errors[k]}</p> : null;

  return (
    <Layout>
      <section className="container py-12">
        <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Checkout</span>
        <h1 className="font-display text-4xl font-bold mt-1 mb-8">Finalizar compra</h1>

        <form onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Datos de envío</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Nombre completo</Label>
                  <Input value={shipping.full_name} onChange={(e) => setShipping({ ...shipping, full_name: e.target.value })} className="mt-1.5" />
                  {errMsg("full_name")}
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    className="mt-1.5"
                  />
                  {errMsg("phone")}
                </div>
                <div><Label>Email</Label><Input value={user?.email ?? ""} disabled className="mt-1.5" /></div>
                <div className="sm:col-span-2">
                  <Label>Dirección completa</Label>
                  <Input value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} placeholder="Calle, número, colonia, ciudad" className="mt-1.5" />
                  {errMsg("address")}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
              <div className="flex items-center gap-2 mb-5">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-bold">Pago</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Nombre del titular</Label>
                  <Input
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "") })}
                    placeholder="Como aparece en la tarjeta"
                    className="mt-1.5"
                  />
                  {errMsg("cardName")}
                </div>
                <div className="sm:col-span-2">
                  <Label>Número de tarjeta</Label>
                  <Input
                    inputMode="numeric"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="mt-1.5"
                  />
                  {errMsg("cardNumber")}
                </div>
                <div>
                  <Label>Vencimiento</Label>
                  <Input
                    inputMode="numeric"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/AA"
                    maxLength={5}
                    className="mt-1.5"
                  />
                  {errMsg("expiry")}
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input
                    inputMode="numeric"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                    className="mt-1.5"
                  />
                  {errMsg("cvv")}
                </div>
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
                <div className="flex justify-between"><span className="text-muted-foreground">Envío</span><span className="tabular-nums">{shippingCost === 0 ? "Gratis" : `$${shippingCost}`}</span></div>
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
