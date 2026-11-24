import { useId } from "react";

interface Props {
  min: string;
  max: string;
  onChangeMin: (value: string) => void;
  onChangeMax: (value: string) => void;
}

export default function PriceRange({ min, max, onChangeMin, onChangeMax }: Props) {
  const id = useId();
  const invalid = min !== "" && max !== "" && Number(min) > Number(max);

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">Precio</legend>
      <div className="mt-2 flex items-center gap-2">
        <input
          id={`${id}-min`}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={min}
          onChange={(event) => onChangeMin(event.target.value)}
          placeholder="Mínimo"
          aria-label="Precio mínimo"
          aria-invalid={invalid}
          className="w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-cobalt focus:outline-none"
        />
        <span className="text-sm text-ink-soft">a</span>
        <input
          id={`${id}-max`}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={max}
          onChange={(event) => onChangeMax(event.target.value)}
          placeholder="Máximo"
          aria-label="Precio máximo"
          aria-invalid={invalid}
          className="w-full min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-cobalt focus:outline-none"
        />
      </div>
      {invalid && (
        <p className="mt-2 text-xs text-danger">
          El precio mínimo no puede ser mayor que el máximo.
        </p>
      )}
    </fieldset>
  );
}
