import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const statusColor: Record<string, string> = {
  entregado: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  preparando: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  pendiente: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  cancelado: "bg-destructive/15 text-destructive border-destructive/30",
};

interface OrderRow { id: string; created_at: string; total: number; status: string; }

const Profile = () => {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: ords }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("orders").select("id, created_at, total, status").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (prof) setProfile({
        full_name: prof.full_name ?? "",
        email: prof.email ?? user.email ?? "",
        phone: prof.phone ?? "",
        address: prof.address ?? "",
      });
      setOrders((ords ?? []) as OrderRow[]);
      setLoading(false);
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (profile.phone && !/^\d{10}$/.test(profile.phone)) {
      toast.error("El teléfono debe tener exactamente 10 dígitos");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name, phone: profile.phone, address: profile.address,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Perfil actualizado");
  };

  if (loading) {
    return <Layout><div className="container py-24 grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <section className="bg-gradient-warm border-b border-border">
        <div className="container py-12">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="h-20 w-20 rounded-full bg-gradient-primary grid place-items-center shadow-elegant">
              <User className="h-9 w-9 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">
                {role === "admin" ? "Administrador" : "Cliente"}
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold">{profile.full_name || "Mi cuenta"}</h1>
              <p className="text-muted-foreground text-sm mt-1">{orders.length} pedidos realizados</p>
            </div>
            <Button variant="outline" onClick={async () => { await signOut(); navigate("/"); }}>Cerrar sesión</Button>
          </div>
        </div>
      </section>

      <section className="container py-10 grid lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 space-y-4">
          <form onSubmit={save} className="bg-card border border-border/60 rounded-xl p-6 shadow-soft space-y-4">
            <h2 className="font-display text-lg font-bold">Información</h2>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><User className="h-3 w-3" /> Nombre</Label>
              <Input className="mt-1" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><Mail className="h-3 w-3" /> Email</Label>
              <Input className="mt-1" value={profile.email} disabled />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3" /> Teléfono</Label>
              <Input className="mt-1" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Dirección</Label>
              <Input className="mt-1" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>
            <Button type="submit" variant="default" size="sm" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar cambios"}
            </Button>
          </form>
        </aside>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-bold">Historial de pedidos</h2>
            <Package className="h-5 w-5 text-muted-foreground" />
          </div>
          {orders.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border/60 rounded-xl">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Aún no has realizado pedidos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="bg-card border border-border/60 rounded-xl p-5 shadow-soft hover:shadow-card transition-smooth flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-primary">#{o.id.slice(0, 8).toUpperCase()}</span>
                      <Badge variant="outline" className={statusColor[o.status]}>{o.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-bold tabular-nums">${Number(o.total).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Profile;
