-- Restrict execution of SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Seed products
INSERT INTO public.products (name, description, price, category, image, stock, featured, badge, unit) VALUES
('Ribeye Premium', 'Corte jugoso con marmoleo perfecto, ideal para asar a la parrilla.', 380, 'Res', '/src/assets/product-ribeye.jpg', 24, true, 'Top venta', 'kg'),
('Picaña Selecta', 'El corte estrella brasileño, suave y lleno de sabor.', 340, 'Res', '/src/assets/product-picanha.jpg', 18, true, 'Premium', 'kg'),
('Carne Molida Especial', 'Molida fresca diariamente, 80% carne / 20% grasa.', 180, 'Res', '/src/assets/product-ground-beef.jpg', 40, false, NULL, 'kg'),
('Costillas de Cerdo', 'Costillar tierno perfecto para hornear o ahumar.', 220, 'Cerdo', '/src/assets/product-pork-ribs.jpg', 15, true, NULL, 'kg'),
('Tocino Ahumado', 'Ahumado lentamente con madera de manzano. Sabor inigualable.', 260, 'Cerdo', '/src/assets/product-bacon.jpg', 22, false, 'Artesanal', 'kg'),
('Pechuga de Pollo', 'Pollo de granja, sin hormonas. Pechuga deshuesada.', 140, 'Pollo', '/src/assets/product-chicken.jpg', 50, false, NULL, 'kg'),
('Chuletas de Cordero', 'Cortes finos de cordero lechal. Suavidad excepcional.', 460, 'Cordero', '/src/assets/product-lamb.jpg', 8, false, 'Edición limitada', 'kg'),
('Chorizo Argentino', 'Receta tradicional con especias seleccionadas.', 200, 'Embutidos', '/src/assets/product-chorizo.jpg', 35, true, NULL, 'kg');