import { Beef, Mail, MapPin, Phone, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="bg-charcoal text-charcoal-foreground mt-20">
    <div className="container py-14 grid gap-10 md:grid-cols-4">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary">
            <Beef className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">Carnicería Evelia</span>
        </div>
        <p className="text-charcoal-foreground/70 max-w-md leading-relaxed">
          Más de 30 años seleccionando los mejores cortes para tu mesa. Tradición artesanal,
          calidad premium y atención personalizada en cada compra.
        </p>
      </div>

      <div>
        <h4 className="font-display text-lg mb-4">Contacto</h4>
        <ul className="space-y-3 text-sm text-charcoal-foreground/70">
          <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-glow" /> Av. Reforma 1245, CDMX</li>
          <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary-glow" /> +52 55 1234 5678</li>
          <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary-glow" /> hola@evelia.mx</li>
        </ul>
      </div>

      <div>
        <h4 className="font-display text-lg mb-4">Enlaces</h4>
        <ul className="space-y-2 text-sm text-charcoal-foreground/70">
          <li><Link to="/catalogo" className="hover:text-primary-glow transition-smooth">Catálogo</Link></li>
          <li><Link to="/carrito" className="hover:text-primary-glow transition-smooth">Carrito</Link></li>
          <li><Link to="/perfil" className="hover:text-primary-glow transition-smooth">Mi cuenta</Link></li>
          <li><Link to="/admin" className="hover:text-primary-glow transition-smooth">Panel admin</Link></li>
        </ul>
        <div className="flex gap-3 mt-5">
          <a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-charcoal-foreground/10 hover:bg-primary transition-smooth"><Instagram className="h-4 w-4" /></a>
          <a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-charcoal-foreground/10 hover:bg-primary transition-smooth"><Facebook className="h-4 w-4" /></a>
        </div>
      </div>
    </div>
    <div className="border-t border-charcoal-foreground/10">
      <div className="container py-5 text-center text-xs text-charcoal-foreground/50">
        © {new Date().getFullYear()} Carnicería Evelia. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);
