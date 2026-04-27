import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Beef, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(100),
});
const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Nombre muy corto").max(100),
});

const Auth = () => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate(role === "admin" ? "/admin" : "/perfil", { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "login") {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
      } else {
        const parsed = registerSchema.safeParse({ email, password, fullName });
        if (!parsed.success) {
          toast.error(parsed.error.errors[0].message);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada!");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="container py-16 grid place-items-center min-h-[80vh]">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="flex items-center gap-2 justify-center mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-glow">
              <Beef className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="font-display text-3xl font-bold text-center">
            {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </h1>
          <p className="text-center text-muted-foreground mt-2">
            {tab === "login" ? "Ingresa para continuar comprando" : "Únete a la familia Evelia"}
          </p>

          <div className="grid grid-cols-2 mt-8 p-1 bg-secondary rounded-lg">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "py-2.5 text-sm font-medium rounded-md transition-smooth",
                  tab === t ? "bg-background shadow-soft text-primary" : "text-muted-foreground"
                )}
              >
                {t === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 bg-card border border-border/60 rounded-xl p-6 shadow-card">
            {tab === "register" && (
              <div>
                <Label>Nombre completo</Label>
                <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="María García" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</> : (tab === "login" ? "Ingresar" : "Crear cuenta")}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Al continuar aceptas nuestros términos y política de privacidad.
            </p>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
