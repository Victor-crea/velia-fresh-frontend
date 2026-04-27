import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Truck, Leaf, Clock, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import heroImg from "@/assets/hero-meat.jpg";

const features = [
  { icon: Award, title: "Calidad premium", desc: "Cortes seleccionados a mano por expertos." },
  { icon: Leaf, title: "100% natural", desc: "Sin hormonas ni conservadores." },
  { icon: Truck, title: "Envío refrigerado", desc: "Llega fresco a tu puerta el mismo día." },
  { icon: Clock, title: "30 años de tradición", desc: "Recetas y cortes que pasan generaciones." },
];

const Index = () => {
  const { products, loading } = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="" width={1920} height={1080} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="container relative z-10 grid min-h-[88vh] place-items-center py-24 text-center">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-block px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-primary-foreground/90 border border-primary-foreground/30 rounded-full mb-6">
              Desde 1993 · Tradición artesanal
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground text-balance leading-[1.05]">
              Cortes <span className="italic text-primary-glow">excepcionales</span>,
              <br />directo a tu mesa.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto text-balance">
              En Carnicería Evelia seleccionamos cada pieza con el cuidado de toda una vida dedicada al oficio.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/catalogo">
                <Button variant="hero" size="xl">
                  Ver catálogo <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/catalogo">
                <Button variant="outlineLight" size="xl">Promociones</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-3 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap text-sm font-medium tracking-wide">
          <div className="container flex justify-around">
            <span>🔥 Envío gratis en compras +$1,500</span>
            <span className="hidden md:inline">⭐ 15% off en tu primera compra</span>
            <span>🥩 Carne fresca diariamente</span>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="text-center p-6 rounded-xl bg-card shadow-soft hover:shadow-card transition-smooth border border-border/50">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-primary grid place-items-center mb-4 shadow-soft">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-warm py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-accent font-semibold">Destacados</span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">Nuestros favoritos</h2>
            </div>
            <Link to="/catalogo">
              <Button variant="outline">Ver todo el catálogo <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid place-items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      <section className="container py-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-10 md:p-16 text-charcoal-foreground shadow-elegant">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-3xl md:text-5xl font-bold leading-tight">
              ¿Listo para una <span className="text-primary-glow italic">parrilla inolvidable</span>?
            </h2>
            <p className="mt-4 text-charcoal-foreground/75 text-lg">
              Arma tu pedido en minutos y recibe los mejores cortes en tu hogar.
            </p>
            <Link to="/catalogo" className="inline-block mt-8">
              <Button variant="hero" size="xl">Empezar a comprar <ArrowRight className="h-5 w-5" /></Button>
            </Link>
          </div>
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl" />
        </div>
      </section>
    </Layout>
  );
};

export default Index;
