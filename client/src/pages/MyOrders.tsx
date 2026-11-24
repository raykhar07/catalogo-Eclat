import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { OrderListItem } from "../types";
import { getMyOrders } from "../services/orders";
import { formatPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import ProductImage from "../components/ProductImage";
import Spinner from "../components/Spinner";

function addBusinessDays(date: Date, days: number) {
  const result = new Date(date);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }
  return result;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status: string) {
  if (status === "CONFIRMED") return { label: "Confirmado", className: "bg-emerald-500/10 text-emerald-500" };
  if (status === "PENDING") return { label: "Pendiente", className: "bg-amber-500/10 text-amber-500" };
  if (status === "CANCELLED") return { label: "Cancelado", className: "bg-danger/10 text-danger" };
  if (status === "FAILED") return { label: "Fallido", className: "bg-danger/10 text-danger" };
  return { label: status, className: "bg-(--accent-soft) text-(--text-primary)" };
}

export default function MyOrders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);

    getMyOrders()
      .then((res) => {
        if (active) setOrders(res.orders);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "No se pudieron cargar los pedidos.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const items = useMemo(() => orders, [orders]);

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-(--border) bg-(image:--surface) p-6 text-center shadow-(--card-shadow)">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text-primary)">Inicia sesión para ver tus pedidos</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">Necesitas una cuenta para acceder al historial de compras.</p>
          <Link to="/auth" className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Spinner label="Cargando tus pedidos…" />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-(--text-secondary)">Historial</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--text-primary) sm:text-4xl">Mis pedidos</h1>
          <p className="mt-2 text-sm text-(--text-secondary)">Revisa el estado, método de pago y fecha estimada de entrega.</p>
        </div>
        <Link to="/" className="inline-flex items-center justify-center rounded-full border border-(--border) px-5 py-2 text-sm font-medium text-(--text-primary)">
          Seguir comprando
        </Link>
      </header>

      {error && (
        <div className="mt-6 rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</div>
      )}

      {items.length === 0 && !error ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-[1.75rem] border border-(--border) bg-(image:--surface) p-10 text-center shadow-(--card-shadow)">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-(--border)">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-(--text-secondary)">
              <path
                d="M6.5 7.5h11l-1.2 9a1 1 0 0 1-.99.8H8.69a1 1 0 0 1-.99-.8L6.5 7.5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M9 10v5M12 10v5M15 10v5M4.5 7.5h15M9.5 5a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-(--text-primary)">Aún no has realizado ningún pedido</p>
            <p className="mt-1 text-sm text-(--text-secondary)">Explora el catálogo y realiza tu primera compra</p>
          </div>
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((order) => {
            const status = getStatusInfo(order.status);
            const estimated = addBusinessDays(new Date(order.createdAt), 20);
            const paymentLabel =
              order.paymentMethod === "card"
                ? `Tarjeta${order.cardLast4 ? ` •••• ${order.cardLast4}` : ""}`
                : order.paymentMethod === "nequi"
                ? "Nequi"
                : order.paymentMethod === "pse"
                ? "PSE"
                : order.paymentMethod;
            return (
              <article key={order.id} className="rounded-[1.75rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
                <header className="flex flex-col gap-2 border-b border-(--border) px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div>
                    <p className="text-sm font-medium text-(--text-primary)">Pedido {order.orderNumber}</p>
                    <p className="text-xs text-(--text-secondary)">Realizado el {formatDateTime(order.createdAt)}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                </header>
                <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:px-8">
                  <Link to={`/product/${order.product.id}`} className="h-24 w-20 overflow-hidden rounded-2xl border border-(--border)">
                    <ProductImage src={order.product.imageUrl} alt={order.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link to={`/product/${order.product.id}`} className="font-medium text-(--text-primary)">
                          {order.product.name}
                        </Link>
                        {order.product.brand && order.product.brand !== "Sin marca" && (
                          <p className="text-sm text-(--text-secondary)">{order.product.brand}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="tnum text-lg font-semibold text-(--text-primary)">{formatPrice(Number(order.total))}</p>
                        <p className="text-xs text-(--text-secondary)">Cantidad: {order.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-(--text-secondary)">
                      <p>Método de pago: {paymentLabel}</p>
                      <p>Entrega estimada: {formatDate(estimated.toISOString())} (20 días hábiles)</p>
                    </div>
                  </div>
                </div>
                <footer className="flex flex-col gap-2 border-t border-(--border) px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <p className="text-sm text-(--text-secondary)">Fecha de pedido: {formatDate(order.createdAt)}</p>
                  <Link to={`/product/${order.product.id}`} className="inline-flex items-center justify-center rounded-full border border-(--border) px-5 py-2 text-sm font-medium text-(--text-primary)">
                    Ver producto
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
