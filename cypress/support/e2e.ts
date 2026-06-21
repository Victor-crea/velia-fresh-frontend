// Soporte global de Cypress: se carga antes de cada spec.
import "cypress-axe";
import "./commands";

// Evitar que errores no controlados de la app rompan el test directamente;
// los volveremos a lanzar sólo cuando NO sean ruido conocido de terceros.
Cypress.on("uncaught:exception", (err) => {
  if (/ResizeObserver loop/.test(err.message)) return false;
  return true;
});
