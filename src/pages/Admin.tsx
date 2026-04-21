import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { products, mockOrders, mockUsers } from "@/data/mockData";
import { Package, ShoppingBag, Users, TrendingUp, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "products", label: "Productos", icon: Package },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "users", label: "Usuarios", icon: Users },
] as const;

type TabId = typeof tabs[number]["id"];

const statusColor: Record<string, string> = {
  Entregado: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Preparando: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Pendiente: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  Cancelado: "bg-destructive/15 text-destructive border-destructive/30",
};

const stats = [
  { label: "Ingresos hoy", value: "$12,840", trend: "+18%", icon: TrendingUp },
  { label: "Pedidos", value: "23", trend: "+5", icon: ShoppingBag },
  { label: "Productos", value: "8", trend: "Activos", icon: Package },
  { label: "Clientes", value: "142", trend: "+12 nuevos", icon: Users },
];

const Admin = () => {
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <Layout>
      <section className="bg-charcoal text-charcoal-foreground border-b border-charcoal-foreground/10">
        <div className="container py-10">
          <span className="text-xs uppercase tracking-[0.25em] text-primary-glow font-semibold">Panel</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mt-1">Administración</h1>
          <p className="text-charcoal-foreground/60 mt-2">Gestiona productos, pedidos y clientes.</p>
        </div>
      </section>

      <section className="container py-8">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-smooth whitespace-nowrap",
                tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <div className="animate-fade-in space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card rounded-xl border border-border/60 p-5 shadow-soft">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-display text-3xl font-bold mt-2">{s.value}</p>
                  <p className="text-xs text-emerald-600 mt-1">{s.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border/60 p-6 shadow-soft">
                <h3 className="font-display text-lg font-bold mb-4">Pedidos recientes</h3>
                <div className="space-y-3">
                  {mockOrders.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <div>
                        <p className="font-mono text-sm font-semibold">{o.id}</p>
                        <p className="text-xs text-muted-foreground">{o.customer}</p>
                      </div>
                      <Badge variant="outline" className={statusColor[o.status]}>{o.status}</Badge>
                      <span className="font-semibold tabular-nums">${o.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-dark text-charcoal-foreground rounded-xl p-6 shadow-elegant">
                <h3 className="font-display text-lg font-bold mb-4">Productos top</h3>
                <div className="space-y-4">
                  {products.filter(p => p.featured).slice(0, 4).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-primary-glow font-display font-bold w-5">{i + 1}</span>
                      <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-charcoal-foreground/50">{p.stock} kg en stock</p>
                      </div>
                      <span className="font-semibold tabular-nums">${p.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="animate-fade-in">
            <div className="flex justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">Productos</h2>
              <Button variant="hero"><Plus className="h-4 w-4" /> Nuevo producto</Button>
            </div>
            <div className="bg-card rounded-xl border border-border/60 overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Producto</th>
                      <th className="px-4 py-3 font-semibold">Categoría</th>
                      <th className="px-4 py-3 font-semibold">Precio</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="outline">{p.category}</Badge></td>
                        <td className="px-4 py-3 tabular-nums font-semibold">${p.price}/{p.unit}</td>
                        <td className="px-4 py-3 tabular-nums">{p.stock} kg</td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-4">Pedidos</h2>
            <div className="bg-card rounded-xl border border-border/60 overflow-hidden shadow-soft">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-left">
                    <tr>
                      <th className="px-4 py-3 font-semibold">ID</th>
                      <th className="px-4 py-3 font-semibold">Fecha</th>
                      <th className="px-4 py-3 font-semibold">Cliente</th>
                      <th className="px-4 py-3 font-semibold">Items</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockOrders.map((o) => (
                      <tr key={o.id} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono font-semibold text-primary">{o.id}</td>
                        <td className="px-4 py-3">{o.date}</td>
                        <td className="px-4 py-3">{o.customer}</td>
                        <td className="px-4 py-3">{o.items}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold">${o.total}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className={statusColor[o.status]}>{o.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-4">Usuarios</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mockUsers.map((u) => (
                <div key={u.id} className="bg-card rounded-xl border border-border/60 p-5 shadow-soft hover:shadow-card transition-smooth">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-display font-bold">
                      {u.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {u.role === "Admin" && <Badge className="bg-accent text-accent-foreground">Admin</Badge>}
                  </div>
                  <div className="flex justify-between mt-4 pt-4 border-t border-border/50 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Pedidos</p>
                      <p className="font-display text-lg font-bold">{u.orders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Desde</p>
                      <p className="text-sm font-medium">{u.joined}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Admin;
