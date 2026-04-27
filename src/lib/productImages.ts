import ribeye from "@/assets/product-ribeye.jpg";
import chicken from "@/assets/product-chicken.jpg";
import porkRibs from "@/assets/product-pork-ribs.jpg";
import chorizo from "@/assets/product-chorizo.jpg";
import groundBeef from "@/assets/product-ground-beef.jpg";
import lamb from "@/assets/product-lamb.jpg";
import picanha from "@/assets/product-picanha.jpg";
import bacon from "@/assets/product-bacon.jpg";
import placeholder from "/placeholder.svg";

const map: Record<string, string> = {
  "Ribeye Premium": ribeye,
  "Picaña Selecta": picanha,
  "Carne Molida Especial": groundBeef,
  "Costillas de Cerdo": porkRibs,
  "Tocino Ahumado": bacon,
  "Pechuga de Pollo": chicken,
  "Chuletas de Cordero": lamb,
  "Chorizo Argentino": chorizo,
};

export const getProductImage = (name: string, image?: string | null): string => {
  if (image && image.startsWith("http")) return image;
  return map[name] ?? placeholder;
};
