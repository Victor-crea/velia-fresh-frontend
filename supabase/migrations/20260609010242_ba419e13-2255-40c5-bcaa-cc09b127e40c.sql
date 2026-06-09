
-- GRANTS (faltaban)
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

-- Asegurar RLS y has_role
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

-- Policies (idempotentes)
DROP POLICY IF EXISTS "Anyone views products" ON public.products;
CREATE POLICY "Anyone views products" ON public.products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins manage products" ON public.products;
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "Users create own orders" ON public.orders;
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins update orders" ON public.orders;
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND (o.user_id=auth.uid() OR public.has_role(auth.uid(),'admin'))));
DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;
CREATE POLICY "Users insert own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=auth.uid()));

-- Trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'cliente')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed productos si está vacío
INSERT INTO public.products (name, description, price, category, stock, featured, badge, unit, image)
SELECT * FROM (VALUES
 ('Ribeye Premium','Corte jugoso y marmoleado, ideal para asar.',459.00,'Res'::public.product_category,25::numeric,true,'Best Seller','kg','/placeholder.svg'),
 ('Arrachera Marinada','Arrachera suave marinada en casa.',329.00,'Res'::public.product_category,30::numeric,true,NULL,'kg','/placeholder.svg'),
 ('Tomahawk','Corte espectacular con hueso largo.',699.00,'Res'::public.product_category,8::numeric,true,'Premium','kg','/placeholder.svg'),
 ('Costilla de Cerdo','Costilla cargada, perfecta para BBQ.',249.00,'Cerdo'::public.product_category,40::numeric,false,NULL,'kg','/placeholder.svg'),
 ('Lomo de Cerdo','Lomo magro y tierno.',189.00,'Cerdo'::public.product_category,35::numeric,false,NULL,'kg','/placeholder.svg'),
 ('Pechuga de Pollo','Pechuga fresca sin hueso.',149.00,'Pollo'::public.product_category,60::numeric,true,NULL,'kg','/placeholder.svg'),
 ('Pollo Entero','Pollo de granja, fresco del día.',129.00,'Pollo'::public.product_category,25::numeric,false,NULL,'kg','/placeholder.svg'),
 ('Costillar de Cordero','Costillar selecto de cordero.',589.00,'Cordero'::public.product_category,10::numeric,false,'Nuevo','kg','/placeholder.svg'),
 ('Chorizo Artesanal','Chorizo casero estilo norteño.',179.00,'Embutidos'::public.product_category,50::numeric,true,NULL,'kg','/placeholder.svg'),
 ('Jamón Serrano','Jamón curado en seco.',389.00,'Embutidos'::public.product_category,15::numeric,false,NULL,'kg','/placeholder.svg')
) AS v(name,description,price,category,stock,featured,badge,unit,image)
WHERE NOT EXISTS (SELECT 1 FROM public.products);
