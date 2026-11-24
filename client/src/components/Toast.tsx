import { useCallback, useEffect, useState } from "react";

export type ToastKind = "success" | "error";

export interface ToastState {
  message: string;
  kind: ToastKind;
}

/** Estado de avisos con autocierre y API estable para usarlo en efectos. */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, kind: ToastKind = "success") => {
    setToast({ message, kind });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}

export default function Toast({
  toast,
  onClose,
}: {
  toast: ToastState | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  const accent = toast.kind === "success" ? "bg-success" : "bg-danger";

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in-up animate-duration-300 fixed bottom-4 right-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border border-line bg-surface p-3 pr-2 shadow-lg"
    >
      <span
        aria-hidden="true"
        className={`w-1 self-stretch rounded-full ${accent}`}
      />
      <p className="py-0.5 text-sm leading-snug text-ink">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="rounded p-1 text-ink-soft transition-colors hover:text-ink"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="size-4"
        >
          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
