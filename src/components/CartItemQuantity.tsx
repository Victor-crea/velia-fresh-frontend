import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

type Unit = "kg" | "g" | "$";

interface Props {
  quantityKg: number;
  pricePerKg: number;
  stockKg: number;
  unitLabel: string;
  onChange: (newKg: number) => void;
}

const MIN_KG = 0.25;
const STEP_KG = 0.25;

const toDisplay = (kg: number, unit: Unit, pricePerKg: number): number => {
  if (unit === "kg") return +kg.toFixed(2);
  if (unit === "g") return Math.round(kg * 1000);
  return +(kg * pricePerKg).toFixed(2);
};

const fromDisplay = (val: number, unit: Unit, pricePerKg: number): number => {
  if (unit === "kg") return val;
  if (unit === "g") return val / 1000;
  return val / pricePerKg;
};

export const CartItemQuantity = ({ quantityKg, pricePerKg, stockKg, unitLabel, onChange }: Props) => {
  const [unit, setUnit] = useState<Unit>("kg");
  const [inputValue, setInputValue] = useState<string>(String(toDisplay(quantityKg, "kg", pricePerKg)));

  useEffect(() => {
    setInputValue(String(toDisplay(quantityKg, unit, pricePerKg)));
  }, [quantityKg, unit, pricePerKg]);

  const commitKg = (newKg: number) => {
    if (isNaN(newKg) || newKg < MIN_KG) {
      toast.error(`Cantidad mínima: ${toDisplay(MIN_KG, unit, pricePerKg)} ${unit === "$" ? "" : unit}`);
      setInputValue(String(toDisplay(quantityKg, unit, pricePerKg)));
      return;
    }
    if (newKg > stockKg) {
      const maxDisp = toDisplay(stockKg, unit, pricePerKg);
      toast.error(`Stock máximo disponible: ${maxDisp} ${unit === "$" ? "" : unit}`);
      onChange(stockKg);
      return;
    }
    onChange(+newKg.toFixed(4));
  };

  const handleStep = (dir: 1 | -1) => {
    commitKg(quantityKg + dir * STEP_KG);
  };

  const handleBlur = () => {
    const num = parseFloat(inputValue);
    if (isNaN(num) || num <= 0) {
      setInputValue(String(toDisplay(quantityKg, unit, pricePerKg)));
      return;
    }
    commitKg(fromDisplay(num, unit, pricePerKg));
  };

  const displayVal = toDisplay(quantityKg, unit, pricePerKg);

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center bg-secondary rounded-full">
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => handleStep(-1)}>
          <Minus className="h-3 w-3" />
        </Button>
        <Input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
          className="h-8 w-20 text-center text-sm font-semibold tabular-nums border-0 bg-transparent focus-visible:ring-0 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          step={unit === "g" ? 250 : unit === "$" ? pricePerKg * STEP_KG : STEP_KG}
          min={0}
        />
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => handleStep(1)}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      <Select value={unit} onValueChange={(v) => setUnit(v as Unit)}>
        <SelectTrigger className="h-9 w-[70px] rounded-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="kg">kg</SelectItem>
          <SelectItem value="g">g</SelectItem>
          <SelectItem value="$">$</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
