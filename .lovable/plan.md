Agregar un endpoint raíz informativo al backend para que `GET /` no devuelva 404 y sirva como índice del API.

Pasos
1. Editar `backend/src/index.ts` y agregar `app.get("/", ...)` antes del catch-all 404.
2. El endpoint debe devolver un objeto JSON con:
   - `name` (nombre del proyecto/API)
   - `version` (leer de `package.json`)
   - `status` ("ok")
   - `healthUrl` (`/health`)
   - `endpoints` (lista de rutas base disponibles: `/api/auth`, `/api/products`, `/api/orders`, etc., y `/api/testing` cuando `ENABLE_TEST_ENDPOINTS=true`)
3. Mantener el handler 404 final para rutas no definidas.

Detalles técnicos
- Se importa `package.json` con `fs` o `readFileSync` para leer la versión de forma síncrona al inicio (evita cálculo por request).
- El endpoint no requiere autenticación y es de solo lectura.
- No se modifica el frontend ni las rutas existentes; solo se añade una ruta `GET /`.
- Se verifica con `curl http://localhost:4000/` que devuelve JSON 200 en lugar de 404.

Nota: `GET /favicon.ico` seguirá devolviendo 404 porque no hay un favicon configurado; esto es normal y no se toca en este plan.