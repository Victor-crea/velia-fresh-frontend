# Diagnóstico

Las llamadas a `/rest/v1/products` fallan con `Failed to fetch` y el login no responde porque **la base de datos de Lovable Cloud está vacía**: no existen las tablas `products`, `profiles`, `user_roles`, `orders`, `order_items`, ni el enum `app_role` / `product_category` / `order_status`, ni la función `has_role` ni el trigger `handle_new_user`.

El archivo `src/integrations/supabase/types.ts` declara que existen, pero nunca se aplicó la migración base. Solo existe `backend/migrations/001_new_tables.sql`, que asume que ya están creadas.

## Plan

Aplicar **una sola migración** que cree todo el esquema base que el frontend espera:

1. **Enums**
   - `app_role` (`admin`, `cliente`)
   - `product_category` (`Res`, `Cerdo`, `Pollo`, `Cordero`, `Embutidos`)
   - `order_status` (`pendiente`, `preparando`, `entregado`, `cancelado`)

2. **Tablas** (con GRANT + RLS + políticas)
   - `profiles` (user_id → auth.users, full_name, email, phone, address) — lectura/escritura solo del dueño
   - `user_roles` (user_id, role) — lectura solo del dueño; admin gestiona
   - `products` (name, description, price, category, image, stock, featured, badge, unit) — lectura pública (`anon`+`authenticated`); admin escribe
   - `orders` (user_id, status, total, shipping_address, notes) — dueño lee/crea; admin gestiona
   - `order_items` (order_id, product_id, product_name, price, quantity) — mismo acceso que `orders`

3. **Función SECURITY DEFINER `has_role(_user_id, _role)`** para evitar recursión en RLS.

4. **Trigger `handle_new_user`** en `auth.users` → crea `profiles` + asigna rol `cliente` por defecto al registrarse.

5. **Trigger `update_updated_at_column`** en tablas con `updated_at`.

6. **Seed de productos** (8–10 cortes de las 5 categorías con stock e imagen placeholder) para que el catálogo se vea poblado de inmediato.

## Notas técnicas

- `products` recibirá `GRANT SELECT TO anon, authenticated` (catálogo público) + `GRANT ALL TO service_role`.
- `profiles`, `user_roles`, `orders`, `order_items` solo `authenticated` + `service_role` (sin `anon`).
- Todas las políticas que comprueben rol admin usarán `public.has_role(auth.uid(), 'admin')`.
- Se mantendrá compatible con `backend/migrations/001_new_tables.sql` (que ya referencia `products`, `profiles`, `orders`, `has_role`).
- No se tocará `src/integrations/supabase/types.ts` — coincidirá automáticamente tras aplicar la migración.

## Resultado esperado

- `GET /rest/v1/products` devuelve la lista sembrada → catálogo se muestra.
- Registro/login en `/auth` funcionan; el trigger crea perfil y rol `cliente`.
- Rutas protegidas y panel admin operan según rol.
