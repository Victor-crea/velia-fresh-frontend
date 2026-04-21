import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { userOrderHistory } from "@/data/mockData";
import { User, Mail, Phone, MapPin, Package } from "lucide-react";
import { Link } from "react-router-dom";

const statusColor: Record<string, string> = {
  Entregado: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Preparando: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Pendiente: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  Cancelado: "bg-destructive/15 text-destructive border-destructive/30",
};

const Profile = () => (
  <Layout>
    <section className="bg-gradient-warm border-b border-border">
      <div className="container py-12">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="h-20 w-20 rounded-full bg-gradient-primary grid place-items-center shadow-elegant">
            <User className="h-9 w-9 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Cliente desde 2024</span>
            <h1 className="font-display text-3xl md:text-4xl font-bold">María García</h1>
            <p className="text-muted-foreground text-sm mt-1">Cliente VIP · 12 pedidos realizados</p>
          </div>
          <Link to="/login"><Button variant="outline">Cerrar sesión</Button></Link>
        </div>
      </div>
    </section>

    <section className="container py-10 grid lg:grid-cols-3 gap-8">
      <aside className="lg:col-span-1 space-y-4">
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold mb-4">Información</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-muted-foreground" /> maria@example.com</div>
            <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-muted-foreground" /> +52 55 1234 5678</div>
            <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" /> Av. Reforma 1245, CDMX</div>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-5">Editar perfil</Button>
        </div>

        <div className="bg-gradient-dark text-charcoal-foreground rounded-xl p-6 shadow-elegant">
          <span className="text-xs uppercase tracking-[0.2em] text-primary-glow">Programa VIP</span>
          <p className="font-display text-2xl font-bold mt-1">2,450 pts</p>
          <p className="text-xs text-charcoal-foreground/60 mt-1">Te faltan 550 pts para tu próximo descuento</p>
          <div className="mt-4 h-2 bg-charcoal-foreground/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full" style={{ width: "82%" }} />
          </div>
        </div>
      </aside>

      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold">Historial de pedidos</h2>
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-3">
          {userOrderHistory.map((o) => (
            <div key={o.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-soft hover:shadow-card transition-smooth flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-primary">{o.id}</span>
                  <Badge variant="outline" className={statusColor[o.status]}>{o.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{o.date} · {o.items} productos</p>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold tabular-nums">${o.total.toFixed(2)}</p>
                <button className="text-xs text-primary hover:underline">Ver detalle →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Profile;
