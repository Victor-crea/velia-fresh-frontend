-- ============================================================================
-- Carnicería Evelia — Migración 001
-- 4 tablas nuevas: categories, shipping_zones, promotions, product_reviews
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabla 6: categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(50) UNIQUE NOT NULL,
  emoji       VARCHAR(10),
  description TEXT,
  active      BOOLEAN DEFAULT true,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- Tabla 7: shipping_zones
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  municipalities  TEXT[] DEFAULT '{}',
  base_cost       NUMERIC(10,2) NOT NULL,
  free_from       NUMERIC(10,2) DEFAULT 1500,
  estimated_days  INTEGER DEFAULT 1,
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shipping zones"
  ON public.shipping_zones FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage shipping zones"
  ON public.shipping_zones FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- Tabla 8: promotions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promotions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code         VARCHAR(30) UNIQUE NOT NULL,
  description  TEXT,
  type         VARCHAR(10) NOT NULL CHECK (type IN ('percentage','fixed')),
  value        NUMERIC(10,2) NOT NULL,
  min_order    NUMERIC(10,2) DEFAULT 0,
  max_uses     INTEGER,
  uses_count   INTEGER DEFAULT 0,
  valid_from   TIMESTAMPTZ,
  valid_until  TIMESTAMPTZ,
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read active promotions"
  ON public.promotions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins manage promotions"
  ON public.promotions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ----------------------------------------------------------------------------
-- Tabla 9: product_reviews
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(user_id),
  order_id    UUID NOT NULL REFERENCES public.orders(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  approved    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (product_id, user_id, order_id)
);

ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON public.product_reviews FOR SELECT
  USING (approved = true OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own reviews"
  ON public.product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON public.product_reviews FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete reviews"
  ON public.product_reviews FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON public.product_reviews(user_id);

-- ============================================================================
-- SEEDS
-- ============================================================================

INSERT INTO public.categories (name, emoji, description, sort_order) VALUES
  ('Res',       '🥩', 'Cortes premium de res',                  1),
  ('Cerdo',     '🐖', 'Cortes y costillas de cerdo',            2),
  ('Pollo',     '🐔', 'Pollo fresco y piezas',                  3),
  ('Cordero',   '🐑', 'Cortes selectos de cordero',             4),
  ('Embutidos', '🌭', 'Chorizos, jamones y embutidos artesanales', 5)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.shipping_zones (name, municipalities, base_cost, free_from, estimated_days) VALUES
  ('León Centro',         ARRAY['León Centro','Zona Centro','Obregón'], 49.00,  1500, 1),
  ('Zona Metropolitana',  ARRAY['Silao','San Francisco del Rincón','Purísima'], 99.00, 1500, 2)
ON CONFLICT DO NOTHING;
