export default function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-16 text-sm text-ink-soft"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-line border-t-cobalt motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}
