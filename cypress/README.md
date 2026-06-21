# Suite E2E con Cypress

Implementa los 12 puntos del checklist 5.2 (buenas prácticas E2E):

| # | Práctica | Dónde se aplica |
|---|---|---|
| 1 | Selectores `data-testid` | `cy.byTestId()` + atributos en componentes |
| 2 | Custom commands | `cypress/support/commands.ts` |
| 3 | Login vía API en `beforeEach` | `cy.loginAs("cliente" \| "admin")` |
| 4 | Control de red con `cy.intercept` | specs de catálogo, checkout, auth, admin |
| 5 | Fixtures | `cypress/fixtures/{users,products,orders}.json` |
| 6 | Tests independientes | `cy.resetDb()` + `cy.loginAs()` por test |
| 7 | Limpieza de BD entre tests | `POST /api/testing/reset` (backend) |
| 8 | Screenshots y videos | `cypress.config.ts` (`video: true`, `screenshotOnRunFailure: true`) |
| 9 | Retry máx. 2 | `retries.runMode: 2` |
| 10 | Agrupación por módulo | `cypress/e2e/{auth,catalogo,carrito,checkout,admin}` |
| 11 | Page Object Model | `cypress/support/pages/*` |
| 12 | A11y básico (cypress-axe) | `cy.a11y()` en specs críticos |

## Variables de entorno necesarias

Antes de correr, exporta:

```bash
export VITE_SUPABASE_URL="https://<project-ref>.supabase.co"
export VITE_SUPABASE_PUBLISHABLE_KEY="<anon-key>"
export TEST_USER_EMAIL="cliente.e2e@example.com"
export TEST_USER_PASSWORD="Cypress123!"
export TEST_ADMIN_EMAIL="admin.e2e@example.com"
export TEST_ADMIN_PASSWORD="Cypress123!"
export BACKEND_URL="http://localhost:4000"        # opcional, sólo si usas reset/seed
export TESTING_RESET_TOKEN="<token-secreto>"      # opcional
```

> Los usuarios `cliente.e2e@…` y `admin.e2e@…` deben existir en Lovable Cloud
> (al admin asígnale el rol `admin` en la tabla `user_roles`).

## Comandos

```bash
# UI interactiva
bun run cy:open

# Headless (usa el dev server ya levantado)
bun run cy:run

# Levanta el dev server + corre la suite (CI)
bun run test:e2e
```

## Endpoint de reset (backend)

El backend expone `POST /api/testing/reset` SOLO cuando
`ENABLE_TEST_ENDPOINTS=true`. Recibe header `x-testing-token` y borra todos
los pedidos + productos con prefijo `E2E ` para dejar la BD lista para el
siguiente test. Está deshabilitado por defecto en producción.
