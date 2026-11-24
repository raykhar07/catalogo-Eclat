import { useId } from "react";
import type { ProductSort } from "../types";

interface Props {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
}

export default function SortSelect({ value, onChange }: Props) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        Ordenar por
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as ProductSort)}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-cobalt focus:outline-none"
      >
        <option value="newest">Más recientes</option>
        <option value="price_asc">Precio: menor a mayor</option>
        <option value="price_desc">Precio: mayor a menor</option>
        <option value="name_asc">Nombre: A a Z</option>
      </select>
    </div>
  );
}
