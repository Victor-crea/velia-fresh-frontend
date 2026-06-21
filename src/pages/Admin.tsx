import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ShoppingBag, Users, TrendingUp, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product, Category } from "@/data/mockData";
import { useProducts } from "@/hooks/useProducts";
import { getProductImage } from "@/lib/productImages";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "products", label: "Productos", icon: Package },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "users", label: "Usuarios", icon: Users },
] as const;
type TabId = typeof tabs[number]["id"];

const statusColor: Record<string, string> = {
  entregado: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  preparando: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  pendiente: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  cancelado: "bg-destructive/15 text-destructive border-destructive/30",
};
const orderStatuses = ["pendiente", "preparando", "entregado", "cancelado"] as const;
const productCats: Category[] = ["Res", "Cerdo", "Pollo", "Cordero", "Embutidos"];

interface OrderRow { id: string; created_at: string; user_id: string; total: number; status: string; shipping_address: string | null; }
interface UserRow { user_id: string; full_name: string | null; email: string | null; created_at: string; role: string; }

const emptyForm: Partial<Product> = { name: "", description: "", price: 0, category: "Res", stock: 0, image: "", featured: false, badge: "", unit: "kg" };

const Admin = () => {
  const [tab, setTab] = useState<TabId>("dashboard");
  const { products, loading, refetch } = useProducts();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders((data ?? []) as OrderRow[]);
  };
  const loadUsers = async () => {
    const { data: profs } = await supabase.from("profiles").select("user_id, full_name, email, created_at");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
    setUsers((profs ?? []).map((p: any) => ({ ...p, role: roleMap.get(p.user_id) ?? "cliente" })));
  };

  useEffect(() => { loadOrders(); loadUsers(); }, []);

  const stats = [
    { label: "Ingresos totales", value: `$${orders.reduce((a, o) => a + Number(o.total), 0).toFixed(0)}`, trend: `${orders.length} pedidos`, icon: TrendingUp },
    { label: "Pedidos pendientes", value: orders.filter(o => o.status === "pendiente").length.toString(), trend: "Por atender", icon: ShoppingBag },
    { label: "Productos", value: products.length.toString(), trend: "En catálogo", icon: Package },
    { label: "Clientes", value: users.length.toString(), trend: "Registrados", icon: Users },
  ];

  const openNew = () => { setEditing(emptyForm); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditing({ ...p }); setDialogOpen(true); };

  const saveProduct = async () => {
    if (!editing.name || !editing.category) { toast.error("Nombre y categoría requeridos"); return; }
    setSaving(true);
    const payload = {
      name: editing.name,
      description: editing.description ?? "",
      price: Number(editing.price ?? 0),
      category: editing.category,
      stock: Number(editing.stock ?? 0),
      image: editing.image || null,
      featured: !!editing.featured,
      badge: editing.badge || null,
      unit: editing.unit ?? "kg",
    };
    let error;
    if (editing.id) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing.id ? "Producto actualizado" : "Producto creado");
    setDialogOpen(false);
    refetch();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Producto eliminado");
    refetch();
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Estado actualizado");
    loadOrders();
  };

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
            <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-smooth whitespace-nowrap",
                tab === t.id ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-secondary")}>
              <t.icon className="h-4 w-4" /> {t.label}
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
                  <p className="text-xs text-muted-foreground mt-1">{s.trend}</p>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-xl border border-border/60 p-6 shadow-soft">
              <h3 className="font-display text-lg font-bold mb-4">Pedidos recientes</h3>
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-mono text-sm font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className={statusColor[o.status]}>{o.status}</Badge>
                  <span className="font-semibold tabular-nums">${Number(o.total).toFixed(2)}</span>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Sin pedidos aún</p>}
            </div>
          </div>
        )}

        {tab === "products" && (
          <div className="animate-fade-in">
            <div className="flex justify-between mb-4">
              <h2 className="font-display text-2xl font-bold">Productos</h2>
              <Button data-testid="admin-new-product" variant="hero" onClick={openNew}><Plus className="h-4 w-4" /> Nuevo producto</Button>
            </div>
            {loading ? <div className="py-12 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
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
                        <tr key={p.id} data-testid="admin-product-row" data-product-id={p.id} className="border-t border-border/50 hover:bg-secondary/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={getProductImage(p.name, p.image)} alt="" className="h-10 w-10 rounded object-cover" />
                              <span className="font-medium">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3"><Badge variant="outline">{p.category}</Badge></td>
                          <td className="px-4 py-3 tabular-nums font-semibold">${p.price}/{p.unit}</td>
                          <td className="px-4 py-3 tabular-nums">{p.stock} kg</td>
                          <td className="px-4 py-3 text-right">
                            <Button data-testid={`admin-edit-${p.id}`} variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                            <Button data-testid={`admin-delete-${p.id}`} variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                      <th className="px-4 py-3 font-semibold">Envío</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-border/50 hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono font-semibold text-primary">#{o.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-4 py-3">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{o.shipping_address}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold">${Number(o.total).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Select value={o.status} onValueChange={(v) => updateOrderStatus(o.id, v)}>
                            <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {orderStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Sin pedidos</td></tr>}
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
              {users.map((u) => (
                <div key={u.user_id} className="bg-card rounded-xl border border-border/60 p-5 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary grid place-items-center text-primary-foreground font-display font-bold">
                      {(u.full_name || u.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{u.full_name || "Sin nombre"}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    {u.role === "admin" && <Badge className="bg-accent text-accent-foreground">Admin</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Desde {new Date(u.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing.id ? "Editar producto" : "Nuevo producto"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nombre</Label><Input data-testid="admin-form-name" value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Descripción</Label><Textarea data-testid="admin-form-description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Precio</Label><Input data-testid="admin-form-price" type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) })} /></div>
              <div><Label>Stock (kg)</Label><Input data-testid="admin-form-stock" type="number" step="0.01" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: parseFloat(e.target.value) })} /></div>
              <div>
                <Label>Categoría</Label>
                <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v as Category })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{productCats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unidad</Label><Input value={editing.unit ?? "kg"} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} /></div>
            </div>
            <div><Label>URL imagen (opcional)</Label><Input value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." /></div>
            <div><Label>Etiqueta (opcional)</Label><Input value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} placeholder="Top venta" /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} />
              Destacado
            </label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button data-testid="admin-form-save" variant="hero" onClick={saveProduct} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Admin;
