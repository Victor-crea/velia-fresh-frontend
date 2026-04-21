import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Beef, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(tab === "login" ? "¡Bienvenida de vuelta!" : "¡Cuenta creada!");
      navigate("/perfil");
    }, 1200);
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
                <Input required placeholder="María García" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input required type="email" placeholder="tu@email.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input required type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
            {tab === "login" && (
              <div className="text-right">
                <a href="#" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
            )}
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
