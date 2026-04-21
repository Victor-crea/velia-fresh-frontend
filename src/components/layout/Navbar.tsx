import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Beef } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/perfil", label: "Mi cuenta" },
  { to: "/admin", label: "Admin" },
];

export const Navbar = () => {
  const { totalItems } = useCart();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary shadow-soft group-hover:shadow-glow transition-smooth">
            <Beef className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">Carnicería Evelia</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tradición & Calidad</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-smooth hover:text-primary",
                pathname === item.to ? "text-primary" : "text-foreground/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
              <span className="hidden lg:inline">Ingresar</span>
            </Button>
          </Link>
          <Link to="/carrito">
            <Button variant="default" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Carrito</span>
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 min-w-5 px-1 bg-accent text-accent-foreground border-2 border-background animate-scale-in">
                  {totalItems.toFixed(1).replace(/\.0$/, "")}
                </Badge>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container flex flex-col py-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-3 text-sm font-medium rounded-md",
                  pathname === item.to ? "bg-secondary text-primary" : "text-foreground/80"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-3 text-sm font-medium text-foreground/80">
              Ingresar / Registrarse
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
