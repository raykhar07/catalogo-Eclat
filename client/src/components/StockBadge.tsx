import { stockInfo } from "../utils/format";

export default function StockBadge({
  stock,
  className = "",
}: {
  stock: number;
  className?: string;
}) {
  const info = stockInfo(stock);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}
      style={{ color: info.color }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full"
        style={{ backgroundColor: info.color }}
      />
      {info.label}
    </span>
  );
}
