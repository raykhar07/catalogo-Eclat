import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/format";
import ProductImage from "./ProductImage";

export default function CartDrawer() {
  const { items, isOpen, closeCart, increaseItem, decreaseItem, removeItem, subtotal, totalItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60">
      <div className="animate-fade-in animate-duration-200 absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCart} />
      <aside className="animate-slide-in-right animate-duration-300 animate-slide-distance-[100%] absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-(--border) bg-(--surface) shadow-[0_60px_120px_-80px_rgba(30,79,216,0.9)]">
        <header className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-(--text-primary)">Tu carrito</p>
            <p className="text-sm text-(--text-secondary)">
              {totalItems === 0 ? "Sin productos" : `${totalItems} ${totalItems === 1 ? "producto" : "productos"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) text-(--text-primary) transition-all duration-300 hover:-translate-y-0.5"
            aria-label="Cerrar carrito"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-full border border-(--border)">
              <svg xmlns="http://www.w3.org/2000/svg" className="size-6.5" viewBox="0 0 24 24"><path fill="currentColor" d="M11 9V6H8V4h3V1h2v3h3v2h-3v3zM5.588 21.413Q5 20.825 5 20t.588-1.412T7 18t1.413.588T9 20t-.587 1.413T7 22t-1.412-.587m10 0Q15 20.825 15 20t.588-1.412T17 18t1.413.588T19 20t-.587 1.413T17 22t-1.412-.587M1 4V2h3.275l4.25 9h7l3.9-7H21.7l-4.975 9H8.1L7 15h12v2H3.625L6.6 11.6L3 4z"/></svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-(--text-primary)">Tu carrito está vacío</p>
              <p className="mt-1 text-sm text-(--text-secondary)">Agrega productos para empezar tu compra</p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white"
            >
              Explorar catálogo
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 rounded-2xl border border-(--border) p-4">
                    <Link to={`/product/${item.productId}`} onClick={closeCart} className="h-24 w-20 overflow-hidden rounded-xl border border-(--border)">
                      <ProductImage src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/product/${item.productId}`} onClick={closeCart} className="text-sm font-medium text-(--text-primary)">
                            {item.name}
                          </Link>
                          {item.brand && item.brand !== "Sin marca" && (
                            <p className="text-xs text-(--text-secondary)">{item.brand}</p>
                          )}
                        </div>
                        <button type="button" onClick={() => removeItem(item.productId)} className="text-xs text-(--text-secondary) hover:text-(--text-primary)">
                          Eliminar
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="tnum text-sm font-medium text-(--text-primary)">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => decreaseItem(item.productId)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border) text-(--text-primary)"
                          >
                            -
                          </button>
                          <span className="tnum w-6 text-center text-sm text-(--text-primary)">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseItem(item.productId)}
                            disabled={item.quantity >= item.stock}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border) text-(--text-primary) disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {item.quantity >= item.stock && (
                        <p className="mt-2 text-xs text-warning">Solo hay {item.stock} unidades disponibles</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-(--border) px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-(--text-secondary)">Subtotal</p>
                <p className="tnum text-lg font-semibold text-(--text-primary)">{formatPrice(subtotal)}</p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)]"
                >
                  Continuar al pago
                </Link>
                <button
                  type="button"
                  onClick={closeCart}
                  className="inline-flex items-center justify-center rounded-full border border-(--border) px-6 py-2.5 text-sm font-medium text-(--text-primary)"
                >
                  Seguir comprando
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
