# Plan: Suite E2E con Cypress aplicando las 12 buenas prácticas

Implementar Cypress en el proyecto con una suite que cumpla los 12 puntos del checklist 5.2, agrupada por módulos de negocio (auth, catálogo, carrito, checkout, admin) y usando los `data-testid` que añadiremos en los componentes clave.

## 1. Instalación y configuración

- Añadir dev-deps: `cypress`, `cypress-axe`, `axe-core`, `@cypress/grep` (para tags), `start-server-and-test`.
- `cypress.config.ts` en la raíz:
  - `baseUrl: http://localhost:8080`
  - `retries: { runMode: 2, openMode: 0 }` → punto 9 (retry máx 2)
  - `video: true`, `screenshotOnRunFailure: true` → punto 8
  - `env`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`.
- Scripts en `package.json`:
  - `cy:open`, `cy:run`, `test:e2e` (usa `start-server-and-test dev http://localhost:8080 cy:run`).

## 2. Estructura de carpetas (agrupada por módulo de negocio → punto 10)

```text
cypress/
  e2e/
    auth/            login.cy.ts, registro.cy.ts
    catalogo/        listado.cy.ts, busqueda-filtros.cy.ts
    carrito/         agregar-quitar.cy.ts
    checkout/        crear-orden.cy.ts
    admin/           gestion-productos.cy.ts
  fixtures/          users.json, products.json, orders.json
  support/
    commands.ts      (custom commands)
    e2e.ts           (imports globales + cypress-axe)
    pages/           HomePage.ts, CatalogPage.ts, CartPage.ts, CheckoutPage.ts, AuthPage.ts, AdminPage.ts
    api/             auth.ts, db.ts
```

## 3. Custom commands (punto 2)

En `cypress/support/commands.ts`:
- `cy.loginAs(role: 'cliente' | 'admin')` → login vía API (punto 3), guarda sesión en `localStorage` con la misma key que usa `@supabase/supabase-js` (`sb-<ref>-auth-token`) para que el `AuthContext` la levante sin pasar por UI.
- `cy.logout()` → limpia sesión.
- `cy.seedProduct(payload)` / `cy.deleteProduct(id)` → usan service-role vía endpoint de test.
- `cy.resetDb()` → llama endpoint de reset (ver punto 7).
- `cy.checkA11y(context?, options?)` → wrapper de `cypress-axe` (punto 12).
- `cy.byTestId(id)` → atajo a `cy.get([data-testid="..."])` para forzar el patrón (punto 1).

## 4. Login vía API en `beforeEach` (punto 3)

`loginAs` hace `POST {SUPABASE_URL}/auth/v1/token?grant_type=password` con `apikey` y credenciales del fixture; del response toma `access_token` + `refresh_token` y los inyecta en `localStorage` antes de `cy.visit`. Cero clicks en UI para autenticarse.

## 5. `cy.intercept()` para red controlada (punto 4)

Ejemplos:
- En `catalogo/listado.cy.ts`: interceptar `GET **/rest/v1/products*` y devolver `fixtures/products.json` para asegurar render determinista; otro test deja la red real para validar integración.
- En `checkout/crear-orden.cy.ts`: interceptar `POST **/rest/v1/orders*` y validar el body; simular error 500 y verificar toast.
- En `auth/login.cy.ts`: interceptar `POST **/auth/v1/token*` para forzar credenciales inválidas y comprobar mensaje.

## 6. Fixtures (punto 5)

- `users.json`: `cliente` y `admin` (emails/passwords de env, no hardcodeados de prod).
- `products.json`: 3 productos consistentes para tests de catálogo/carrito.
- `orders.json`: payloads de orden válidos/ inválidos.

## 7. Tests independientes (punto 6)

- Cada `it` hace su propio `cy.resetDb()` + `cy.loginAs()` en `beforeEach`.
- Prohibido compartir estado entre `it`. Nada de variables globales con datos creados.
- Sin `--spec` order dependency: cualquier archivo corre aislado.

## 8. Limpieza de BD entre tests (punto 7) — requiere trabajo backend

Añadir en `backend/`:
- `backend/src/routes/testing.routes.ts` montado SOLO si `process.env.NODE_ENV !== 'production'` y `process.env.ENABLE_TEST_ENDPOINTS === 'true'`.
- `POST /api/testing/reset` → con `supabaseAdmin`:
  - borra `order_items`, `orders`, productos creados por tests (filtrar por flag `is_test=true` o por prefijo de nombre `E2E_`),
  - borra usuarios de prueba `auth.admin.deleteUser` excepto los del fixture base,
  - re-seedea productos desde `fixtures/products.json`.
- Protegido por header `x-testing-token` comparado con secreto `TESTING_RESET_TOKEN`.
- `cy.resetDb()` envía ese header.

Alternativa más simple si no se quiere endpoint: seeders por test que crean productos con prefijo `E2E_` y un `after` que los elimina vía API REST de Supabase con service-role (no recomendado exponer service-role al runner).

## 9. Page Object Model (punto 11)

Una clase por página en `cypress/support/pages/`. Ejemplo `CatalogPage.ts`:

```ts
export class CatalogPage {
  visit() { cy.visit('/catalogo'); return this; }
  search(term: string) { cy.byTestId('catalog-search').type(term); return this; }
  selectCategory(name: string) { cy.byTestId(`category-${name}`).click(); return this; }
  productCards() { return cy.byTestId('product-card'); }
  addToCart(productId: string) { cy.byTestId(`add-to-cart-${productId}`).click(); return this; }
}
```

Los tests sólo orquestan POMs, nunca tocan selectores directamente.

## 10. Añadir `data-testid` en componentes (punto 1) — cambios en src

Editar (sin tocar estilos ni lógica):
- `Navbar.tsx`: `nav-cart`, `nav-login`, `nav-profile`, `nav-admin`, `nav-logout`.
- `Catalog.tsx`: `catalog-search`, `category-{name}`, `catalog-empty`, `catalog-loading`.
- `ProductCard.tsx`: `product-card`, `product-name`, `product-price`, `add-to-cart-{id}`.
- `Cart.tsx`: `cart-item`, `cart-item-qty-{id}`, `cart-total`, `cart-checkout`.
- `Checkout.tsx`: `checkout-address`, `checkout-notes`, `checkout-submit`.
- `Auth.tsx`: `auth-tab-login`, `auth-tab-register`, `auth-email`, `auth-password`, `auth-fullname`, `auth-submit`.
- `Admin.tsx`: `admin-new-product`, `admin-product-row-{id}`, `admin-edit-{id}`, `admin-delete-{id}`.

## 11. Accesibilidad básica (punto 12)

En tests críticos (`catalogo/listado`, `carrito/agregar-quitar`, `checkout/crear-orden`, `auth/login`):

```ts
beforeEach(() => { cy.injectAxe(); });
it('no a11y violations', () => {
  catalogPage.visit();
  cy.checkA11y(undefined, { includedImpacts: ['critical', 'serious'] });
});
```

## 12. CI: screenshots y videos (punto 8)

- `cypress.config.ts` con `video: true` y `screenshotOnRunFailure: true`.
- Añadir `.github/workflows/e2e.yml` (GitHub Actions):
  - levanta el front con `start-server-and-test`,
  - corre `cypress run`,
  - sube `cypress/videos` y `cypress/screenshots` como artifacts.
- Documentar en `cypress/README.md` cómo correr local y leer reportes.

## 13. Retries (punto 9)

Ya configurado en `cypress.config.ts` (`runMode: 2`). Documentado en README que los flaky tests deben investigarse, no encubrirse subiendo retries.

## Checklist de cobertura del 5.2

| # | Punto | Implementación |
|---|---|---|
| 1 | Selectores `data-testid` | `cy.byTestId` + atributos en componentes |
| 2 | Custom commands | `commands.ts` (loginAs, resetDb, seedProduct…) |
| 3 | Login vía API en beforeEach | `cy.loginAs` inyecta token en localStorage |
| 4 | `cy.intercept()` | Tests de catálogo/checkout/auth |
| 5 | Fixtures | `users.json`, `products.json`, `orders.json` |
| 6 | Tests independientes | reset + login en cada beforeEach |
| 7 | Limpieza BD | endpoint `POST /api/testing/reset` |
| 8 | Screenshots/videos en CI | workflow + config |
| 9 | Retries máx 2 | `retries.runMode = 2` |
| 10 | Agrupación por módulo | carpetas `auth/`, `catalogo/`, `carrito/`, `checkout/`, `admin/` |
| 11 | POM | `support/pages/*` |
| 12 | A11y básico | `cypress-axe` + `cy.checkA11y` en tests críticos |

## Entregables

1. Config + scripts Cypress.
2. `cypress/support/{commands,e2e,pages,api}` completos.
3. Fixtures.
4. Specs E2E por módulo (auth, catálogo, carrito, checkout, admin).
5. Endpoint `POST /api/testing/reset` en backend + variables de entorno.
6. `data-testid` añadidos en componentes listados (sin cambios visuales).
7. Workflow CI y `cypress/README.md`.

## Fuera de alcance

- Migración a Playwright (el checklist menciona ambos; se elige Cypress por simplicidad).
- Tests de carga / performance.
- Cambios de diseño o lógica de negocio.

## Preguntas antes de implementar

1. ¿Creas en Lovable Cloud dos usuarios de prueba dedicados (`cliente.e2e@…` y `admin.e2e@…`) y me pasas sus credenciales como secretos `TEST_USER_*` y `TEST_ADMIN_*`? Sin ellos `loginAs` no puede correr.
2. ¿Apruebas exponer `POST /api/testing/reset` en el backend protegido por `TESTING_RESET_TOKEN` (solo activo cuando `ENABLE_TEST_ENDPOINTS=true`)? Es la forma limpia de cumplir el punto 7.
3. ¿Quieres que añada también el workflow de GitHub Actions, o sólo dejo la config local y tú lo integras en tu CI?
