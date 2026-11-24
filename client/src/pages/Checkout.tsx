import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { PaymentMethod, Product } from "../types";
import { getProduct } from "../services/api";
import { createCartOrder, createOrder } from "../services/orders";
import { ShieldCheck } from "lucide-react";
import { formatPrice } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ProductImage from "../components/ProductImage";
import Spinner from "../components/Spinner";
import nequiLogo from "../Assets/logo-nequi.svg";

type NequiFormState = {
  nequiPhone: string;
};

type PseFormState = {
  pseBank: string;
  psePersonType: "natural" | "juridica" | "";
  pseId: string;
};

type CardFormState = {
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

export default function Checkout() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { items: cartItems, subtotal: cartSubtotal, clearCart } = useCart();

  const isCartCheckout = !productId && cartItems.length > 0;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(isCartCheckout ? false : true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [buyerName, setBuyerName] = useState(user?.name ?? "");
  const [buyerEmail, setBuyerEmail] = useState(user?.email ?? "");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerCity, setBuyerCity] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [nequiForm, setNequiForm] = useState<NequiFormState>({ nequiPhone: "" });
  const [pseForm, setPseForm] = useState<PseFormState>({
    pseBank: "",
    psePersonType: "",
    pseId: "",
  });
  const [cardForm, setCardForm] = useState<CardFormState>({
    cardHolder: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [validatingCard, setValidatingCard] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isCartCheckout) {
      setLoading(false);
      return;
    }
    if (!productId) {
      setLoading(false);
      setError("No hay productos para pagar.");
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);

    getProduct(productId)
      .then((result) => {
        if (active) {
          setProduct(result);
          if (result.stock === 0) {
            setError("Este producto no tiene stock disponible.");
          }
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "No se pudo cargar el producto.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId, isCartCheckout]);

  useEffect(() => {
    if (user) {
      setBuyerName((prev) => prev || user.name);
      setBuyerEmail((prev) => prev || user.email);
    }
  }, [user]);

  const maxQuantity = product?.stock ?? 1;
  const unitPrice = product?.price ?? 0;
  const total = useMemo(() => {
    if (isCartCheckout) return cartSubtotal;
    return unitPrice * quantity;
  }, [isCartCheckout, cartSubtotal, unitPrice, quantity]);

  const canIncrease = quantity < maxQuantity;
  const canDecrease = quantity > 1;

  function increaseQty() {
    if (canIncrease) setQuantity((q) => q + 1);
  }

  function decreaseQty() {
    if (canDecrease) setQuantity((q) => q - 1);
  }

  if (loading) {
    return <Spinner label="Cargando checkout…" />;
  }

  if (!isAuthenticated) {
    const redirect = productId ? `/checkout/${productId}` : "/checkout";
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="animate-fade-in mx-auto max-w-md rounded-2xl border border-(--border) bg-(image:--surface) p-6 text-center shadow-(--card-shadow)">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text-primary)">
            Debes iniciar sesión
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
            Para realizar una compra es necesario tener una cuenta y estar logueado.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              to={`/auth?redirect=${encodeURIComponent(redirect)}`}
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Iniciar sesión / Registrarse
            </Link>
            <Link
              to={productId ? `/product/${productId}` : "/"}
              className="inline-flex items-center justify-center rounded-full border border-(--border) px-6 py-2.5 text-sm font-medium text-(--text-primary)"
            >
              Volver
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCartCheckout) {
    if (cartItems.length === 0) {
      return (
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="animate-fade-in mx-auto max-w-md rounded-2xl border border-(--border) bg-(image:--surface) p-6 text-center shadow-(--card-shadow)">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text-primary)">Carrito vacío</h1>
            <p className="mt-2 text-sm text-(--text-secondary)">Agrega productos para continuar con la compra.</p>
            <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white">
              Ir al catálogo
            </Link>
          </div>
        </div>
      );
    }
  } else if (error || !product) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="animate-fade-in mx-auto max-w-md rounded-2xl border border-(--border) bg-(image:--surface) p-6 text-center shadow-(--card-shadow)">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text-primary)">
            No podemos continuar
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
            {error ?? "Producto no disponible."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (isCartCheckout) {
      if (cartItems.length === 0) {
        setFormError("Carrito vacío.");
        return;
      }
      for (const item of cartItems) {
        if (item.quantity < 1 || item.quantity > item.stock) {
          setFormError("Hay productos con cantidad inválida según stock.");
          return;
        }
      }
    } else {
      const prod = product;
      if (!prod) {
        setFormError("Producto no disponible.");
        return;
      }
      if (prod.stock === 0) {
        setFormError("Este producto no tiene stock disponible.");
        return;
      }
      if (quantity < 1 || quantity > prod.stock) {
        setFormError("Cantidad inválida según stock disponible.");
        return;
      }
    }
    if (!paymentMethod) {
      setFormError("Selecciona un método de pago.");
      return;
    }

    const payload: any = {
      productId: isCartCheckout ? cartItems[0].productId : product?.id,
      quantity: isCartCheckout ? cartItems[0].quantity : quantity,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerAddress,
      buyerCity,
      paymentMethod,
    };

    if (paymentMethod === "card") {
      const holder = cardForm.cardHolder.trim();
      const number = cardForm.cardNumber.replace(/\s+/g, "");
      const expiry = cardForm.cardExpiry.trim();
      const cvv = cardForm.cardCvv.trim();
      const nextErrors: Record<string, string> = {};
      if (holder.length < 3) nextErrors.cardHolder = "Nombre del titular requerido";
      if (!/^\d{13,19}$/.test(number)) nextErrors.cardNumber = "Número de tarjeta inválido";
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiry)) nextErrors.cardExpiry = "Vencimiento inválido (MM/AA)";
      if (!/^\d{3,4}$/.test(cvv)) nextErrors.cardCvv = "CVV inválido";
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors((prev) => ({ ...prev, ...nextErrors }));
        setFormError("Revisa los datos de la tarjeta.");
        return;
      }
      payload.cardHolder = holder;
      payload.cardNumber = number;
      payload.cardExpiry = expiry;
      payload.cardCvv = cvv;
    }

    if (paymentMethod === "nequi") {
      if (!/^\d{10}$/.test(nequiForm.nequiPhone.trim())) {
        setFieldErrors((prev) => ({ ...prev, nequiPhone: "Teléfono Nequi debe tener 10 dígitos" }));
        setFormError("Revisa los datos de Nequi.");
        return;
      }
      payload.nequiPhone = nequiForm.nequiPhone;
    }

    if (paymentMethod === "pse") {
      if (!pseForm.pseBank.trim()) {
        setFieldErrors((prev) => ({ ...prev, pseBank: "Selecciona o indica tu banco" }));
        setFormError("Revisa los datos de PSE.");
        return;
      }
      if (!pseForm.psePersonType) {
        setFieldErrors((prev) => ({ ...prev, psePersonType: "Selecciona tipo de persona" }));
        setFormError("Revisa los datos de PSE.");
        return;
      }
      if (!pseForm.pseId.trim() || pseForm.pseId.trim().length < 5) {
        setFieldErrors((prev) => ({ ...prev, pseId: "Identificación requerida" }));
        setFormError("Revisa los datos de PSE.");
        return;
      }
      payload.pseBank = pseForm.pseBank;
      payload.psePersonType = pseForm.psePersonType;
      payload.pseId = pseForm.pseId;
    }

    setSubmitting(true);
    setValidatingCard(false);

    try {
      if (isCartCheckout) {
        await createCartOrder({
          items: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          buyerName,
          buyerEmail,
          buyerPhone,
          buyerAddress,
          buyerCity,
          paymentMethod,
          ...(paymentMethod === "nequi" ? { nequiPhone: nequiForm.nequiPhone } : {}),
          ...(paymentMethod === "pse"
            ? { pseBank: pseForm.pseBank, psePersonType: pseForm.psePersonType as "natural" | "juridica", pseId: pseForm.pseId }
            : {}),
          ...(paymentMethod === "card"
            ? {
                cardHolder: cardForm.cardHolder.trim(),
                cardNumber: cardForm.cardNumber.replace(/\s+/g, ""),
                cardExpiry: cardForm.cardExpiry.trim(),
                cardCvv: cardForm.cardCvv.trim(),
              }
            : {}),
        });
        clearCart();
      } else {
        await createOrder(payload);
      }
      navigate("/mis-pedidos", { replace: true });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "No se pudo procesar la compra.");
    } finally {
      setSubmitting(false);
      setValidatingCard(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <nav className="text-sm text-(--text-secondary)">
        {isCartCheckout ? (
          <>
            <Link to="/" className="transition-colors hover:text-(--text-primary)">
              Volver al catálogo
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-(--text-primary)">Checkout</span>
          </>
        ) : product ? (
          <>
            <Link to={`/product/${product.id}`} className="transition-colors hover:text-(--text-primary)">
              Volver al producto
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-(--text-primary)">Checkout</span>
          </>
        ) : (
          <span className="text-(--text-primary)">Checkout</span>
        )}
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="animate-fade-in-up space-y-6">
          {isCartCheckout && (
            <section className="rounded-[1.75rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
              <header className="px-6 pt-6 sm:px-8">
                <h2 className="font-display text-lg font-semibold tracking-tight text-(--text-primary)">Productos en carrito</h2>
                <p className="text-sm text-(--text-secondary)">Revisa tu pedido antes de confirmar</p>
              </header>
              <div className="space-y-4 px-6 pb-6 pt-4 sm:px-8">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 rounded-2xl border border-(--border) p-4">
                    <div className="h-20 w-20 overflow-hidden rounded-xl border border-(--border)">
                      <ProductImage src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <p className="text-sm font-medium text-(--text-primary)">{item.name}</p>
                      <p className="text-xs text-(--text-secondary)">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="tnum text-sm font-medium text-(--text-primary)">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-(--border) pt-4">
                  <p className="text-sm text-(--text-secondary)">Subtotal</p>
                  <p className="tnum text-lg font-semibold text-(--text-primary)">{formatPrice(cartSubtotal)}</p>
                </div>
              </div>
            </section>
          )}
          {!isCartCheckout && product && (
            <section className="rounded-[1.75rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:p-8">
                <div className="w-full overflow-hidden rounded-2xl border border-(--border) sm:w-56">
                  <ProductImage src={product.imageUrl} alt={product.name} className="aspect-4/5 w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-(--border) px-2.5 py-1 text-xs text-(--text-secondary)">
                      {product.category.name}
                    </span>
                    {product.brand && product.brand !== "Sin marca" && (
                      <span className="inline-flex items-center rounded-full border border-(--border) px-2.5 py-1 text-xs text-(--text-secondary)">
                        {product.brand}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight text-(--text-primary) sm:text-3xl">
                    {product.name}
                  </h1>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-(--text-secondary)">
                    {product.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-baseline gap-3">
                    <p className="tnum text-2xl font-semibold text-(--text-primary)">{formatPrice(unitPrice)}</p>
                    <p className="text-sm text-(--text-secondary)">Stock disponible: {product.stock}</p>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-(--border) px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">Cantidad</p>
                      <p className="text-xs text-(--text-secondary)">Ajusta según disponibilidad</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={decreaseQty}
                        disabled={!canDecrease}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) text-(--text-primary) disabled:opacity-40"
                      >
                        -
                      </button>
                      <span className="tnum w-10 text-center text-sm font-medium text-(--text-primary)">{quantity}</span>
                      <button
                        type="button"
                        onClick={increaseQty}
                        disabled={!canIncrease}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border) text-(--text-primary) disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-(--text-secondary)">Total</p>
                    <p className="tnum text-xl font-semibold text-(--text-primary)">{formatPrice(total)}</p>
                  </div>
                  {product.stock === 0 && (
                    <p className="mt-3 text-sm text-danger">No hay stock disponible</p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <form onSubmit={handleSubmit} className="animate-fade-in-up animate-delay-100 space-y-6">
          <section className="rounded-[1.75rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
            <header className="flex items-center justify-between px-6 pt-6 sm:px-8">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-(--text-primary)">Datos del comprador</h2>
                <p className="text-sm text-(--text-secondary)">Todos los campos son obligatorios</p>
              </div>
            </header>
            <div className="grid gap-4 px-6 pb-6 pt-4 sm:grid-cols-2 sm:px-8">
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-(--text-primary) mb-1 block">Nombre completo</span>
                <input
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-(--text-primary) mb-1 block">Correo electrónico</span>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                  className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  required
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="text-(--text-primary) mb-1 block">Teléfono</span>
                <input
                  inputMode="numeric"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="3001234567"
                  className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  required
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-(--text-primary) mb-1 block">Dirección</span>
                <input
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  required
                />
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="text-(--text-primary)">Ciudad</span>
                <input
                  value={buyerCity}
                  onChange={(e) => setBuyerCity(e.target.value)}
                  className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  required
                />
              </label>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow)">
            <header className="px-6 pt-6 sm:px-8">
              <h2 className="font-display text-lg font-semibold tracking-tight text-(--text-primary)">Método de pago</h2>
              <p className="text-sm text-(--text-secondary)">Selecciona cómo deseas pagar</p>
            </header>
            <div className="grid gap-3 px-6 pt-4 sm:grid-cols-3 sm:px-8 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex h-full min-h-21 items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-all duration-300 sm:px-5 ${
                  paymentMethod === "card"
                    ? "border-(--accent) bg-(--accent-soft)"
                    : "border-(--border)"
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col justify-center ">
                  <div className="flex justify-center items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-10" viewBox="0 0 256 83"><defs><linearGradient id="SVGSdd43daQ" x1="45.974%" x2="54.877%" y1="-2.006%" y2="100%"><stop offset="0%" stop-color="#222357"/><stop offset="100%" stop-color="#254aa5"/></linearGradient></defs><path fill="url(#SVGSdd43daQ)" d="M132.397 56.24c-.146-11.516 10.263-17.942 18.104-21.763c8.056-3.92 10.762-6.434 10.73-9.94c-.06-5.365-6.426-7.733-12.383-7.825c-10.393-.161-16.436 2.806-21.24 5.05l-3.744-17.519c4.82-2.221 13.745-4.158 23-4.243c21.725 0 35.938 10.724 36.015 27.351c.085 21.102-29.188 22.27-28.988 31.702c.069 2.86 2.798 5.912 8.778 6.688c2.96.392 11.131.692 20.395-3.574l3.636 16.95c-4.982 1.814-11.385 3.551-19.357 3.551c-20.448 0-34.83-10.87-34.946-26.428m89.241 24.968c-3.967 0-7.31-2.314-8.802-5.865L181.803 1.245h21.709l4.32 11.939h26.528l2.506-11.939H256l-16.697 79.963zm3.037-21.601l6.265-30.027h-17.158zm-118.599 21.6L88.964 1.246h20.687l17.104 79.963zm-30.603 0L53.941 26.782l-8.71 46.277c-1.022 5.166-5.058 8.149-9.54 8.149H.493L0 78.886c7.226-1.568 15.436-4.097 20.41-6.803c3.044-1.653 3.912-3.098 4.912-7.026L41.819 1.245H63.68l33.516 79.963z" transform="matrix(1 0 0 -1 0 82.668)"/></svg>
                    /
                  <svg xmlns="http://www.w3.org/2000/svg" className="size-10" viewBox="0 0 256 199"><path d="M46.54 198.011V184.84c0-5.05-3.074-8.342-8.343-8.342c-2.634 0-5.488.878-7.464 3.732c-1.536-2.415-3.731-3.732-7.024-3.732c-2.196 0-4.39.658-6.147 3.073v-2.634h-4.61v21.074h4.61v-11.635c0-3.731 1.976-5.488 5.05-5.488c3.072 0 4.61 1.976 4.61 5.488v11.635h4.61v-11.635c0-3.731 2.194-5.488 5.048-5.488c3.074 0 4.61 1.976 4.61 5.488v11.635zm68.271-21.074h-7.463v-6.366h-4.61v6.366h-4.171v4.17h4.17v9.66c0 4.83 1.976 7.683 7.245 7.683c1.976 0 4.17-.658 5.708-1.536l-1.318-3.952c-1.317.878-2.853 1.098-3.951 1.098c-2.195 0-3.073-1.317-3.073-3.513v-9.44h7.463zm39.076-.44c-2.634 0-4.39 1.318-5.488 3.074v-2.634h-4.61v21.074h4.61v-11.854c0-3.512 1.536-5.488 4.39-5.488c.878 0 1.976.22 2.854.439l1.317-4.39c-.878-.22-2.195-.22-3.073-.22m-59.052 2.196c-2.196-1.537-5.269-2.195-8.562-2.195c-5.268 0-8.78 2.634-8.78 6.805c0 3.513 2.634 5.488 7.244 6.147l2.195.22c2.415.438 3.732 1.097 3.732 2.195c0 1.536-1.756 2.634-4.83 2.634s-5.488-1.098-7.025-2.195l-2.195 3.512c2.415 1.756 5.708 2.634 9 2.634c6.147 0 9.66-2.853 9.66-6.805c0-3.732-2.854-5.708-7.245-6.366l-2.195-.22c-1.976-.22-3.512-.658-3.512-1.975c0-1.537 1.536-2.415 3.951-2.415c2.635 0 5.269 1.097 6.586 1.756zm122.495-2.195c-2.635 0-4.391 1.317-5.489 3.073v-2.634h-4.61v21.074h4.61v-11.854c0-3.512 1.537-5.488 4.39-5.488c.879 0 1.977.22 2.855.439l1.317-4.39c-.878-.22-2.195-.22-3.073-.22m-58.833 10.976c0 6.366 4.39 10.976 11.196 10.976c3.073 0 5.268-.658 7.463-2.414l-2.195-3.732c-1.756 1.317-3.512 1.975-5.488 1.975c-3.732 0-6.366-2.634-6.366-6.805c0-3.951 2.634-6.586 6.366-6.805c1.976 0 3.732.658 5.488 1.976l2.195-3.732c-2.195-1.757-4.39-2.415-7.463-2.415c-6.806 0-11.196 4.61-11.196 10.976m42.588 0v-10.537h-4.61v2.634c-1.537-1.975-3.732-3.073-6.586-3.073c-5.927 0-10.537 4.61-10.537 10.976s4.61 10.976 10.537 10.976c3.073 0 5.269-1.097 6.586-3.073v2.634h4.61zm-16.904 0c0-3.732 2.415-6.805 6.366-6.805c3.732 0 6.367 2.854 6.367 6.805c0 3.732-2.635 6.805-6.367 6.805c-3.951-.22-6.366-3.073-6.366-6.805m-55.1-10.976c-6.147 0-10.538 4.39-10.538 10.976s4.39 10.976 10.757 10.976c3.073 0 6.147-.878 8.562-2.853l-2.196-3.293c-1.756 1.317-3.951 2.195-6.146 2.195c-2.854 0-5.708-1.317-6.367-5.05h15.587v-1.755c.22-6.806-3.732-11.196-9.66-11.196m0 3.951c2.853 0 4.83 1.757 5.268 5.05h-10.976c.439-2.854 2.415-5.05 5.708-5.05m114.372 7.025v-18.879h-4.61v10.976c-1.537-1.975-3.732-3.073-6.586-3.073c-5.927 0-10.537 4.61-10.537 10.976s4.61 10.976 10.537 10.976c3.074 0 5.269-1.097 6.586-3.073v2.634h4.61zm-16.903 0c0-3.732 2.414-6.805 6.366-6.805c3.732 0 6.366 2.854 6.366 6.805c0 3.732-2.634 6.805-6.366 6.805c-3.952-.22-6.366-3.073-6.366-6.805m-154.107 0v-10.537h-4.61v2.634c-1.537-1.975-3.732-3.073-6.586-3.073c-5.927 0-10.537 4.61-10.537 10.976s4.61 10.976 10.537 10.976c3.074 0 5.269-1.097 6.586-3.073v2.634h4.61zm-17.123 0c0-3.732 2.415-6.805 6.366-6.805c3.732 0 6.367 2.854 6.367 6.805c0 3.732-2.635 6.805-6.367 6.805c-3.951-.22-6.366-3.073-6.366-6.805"/><path fill="#ff5f00" d="M93.298 16.903h69.15v124.251h-69.15z"/><path fill="#eb001b" d="M97.689 79.029c0-25.245 11.854-47.637 30.074-62.126C114.373 6.366 97.47 0 79.03 0C35.343 0 0 35.343 0 79.029s35.343 79.029 79.029 79.029c18.44 0 35.343-6.366 48.734-16.904c-18.22-14.269-30.074-36.88-30.074-62.125"/><path fill="#f79e1b" d="M255.746 79.029c0 43.685-35.343 79.029-79.029 79.029c-18.44 0-35.343-6.366-48.734-16.904c18.44-14.488 30.075-36.88 30.075-62.125s-11.855-47.637-30.075-62.126C141.373 6.366 158.277 0 176.717 0c43.686 0 79.03 35.563 79.03 79.029"/></svg>
                  </div>
                  <p className="text-xs leading-tight text-(--text-secondary)">Tarjeta Visa / Mastercard</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("nequi")}
                className={`group relative flex h-full min-h-21 items-center gap-3 overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 sm:px-5 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_12px_40px_-14px_rgba(223,0,125,0.5)] hover:brightness-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/40 ${
                  paymentMethod === "nequi"
                    ? "border-(--accent) bg-(--accent-soft) shadow-[0_10px_36px_-14px_rgba(223,0,125,0.4)]"
                    : "border-(--border) hover:border-(--accent)/60"
                }`}
              >
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/6 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
                <div className="relative flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-(--text-primary)">Nequi</span>
                    <img src={nequiLogo} alt="Nequi" className="h-10 w-10 max-h-10 max-w-10 shrink-0 object-contain" />
                  </div>
                  <p className="mt-0.5 text-xs leading-tight text-(--text-secondary)">Pago inmediato</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("pse")}
                className={`group relative flex h-full min-h-21 items-center gap-3 overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 sm:px-5 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-sky-400 hover:brightness-[1.0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/40 ${
                  paymentMethod === "pse"
                    ? "border-(--accent) bg-(--accent-soft) shadow-[0_10px_36px_-14px_rgba(15,61,86,0.45)]"
                    : "border-(--border) hover:border-(--accent)/60"
                }`}
              >
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/6 to-transparent transition-transform duration-700 group-hover:translate-x-full" aria-hidden="true" />
                <div className="relative flex min-w-0 flex-1 flex-col justify-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-(--text-primary)">PSE</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto max-h-10 shrink-0 object-contain" viewBox="0 0 200 80" fill="none"><rect width="200" height="80" rx="12" fill="#0F3D56"/><text x="100" y="50" fill="white" fontSize="28" fontWeight="700" textAnchor="middle">PSE</text></svg>
                  </div>
                  <p className="mt-0.5 text-xs leading-tight text-(--text-secondary)">Débito bancario</p>
                </div>
              </button>
            </div>

            {paymentMethod === "card" && (
              <div className="animate-fade-in-down animate-duration-200 grid gap-4 px-6 pb-6 pt-4 sm:grid-cols-2 sm:px-8">
                <label className="space-y-2 text-sm sm:col-span-2">
                  <span className="text-(--text-primary)">Nombre del titular</span>
                  <input
                    value={cardForm.cardHolder}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, cardHolder: e.target.value }))}
                    placeholder="Como aparece en la tarjeta"
                    className="mt-2 w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.cardHolder && <p className="animate-fade-in text-xs text-danger">{fieldErrors.cardHolder}</p>}
                </label>
                <label className="space-y-2 text-sm sm:col-span-2">
                  <span className="text-(--text-primary)">Número de tarjeta</span>
                  <input
                    inputMode="numeric"
                    value={cardForm.cardNumber}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                      setCardForm((prev) => ({ ...prev, cardNumber: formatted }));
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="mt-2 w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.cardNumber && <p className="animate-fade-in text-xs text-danger">{fieldErrors.cardNumber}</p>}
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-(--text-primary)">Vencimiento</span>
                  <input
                    inputMode="numeric"
                    value={cardForm.cardExpiry}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                      const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                      setCardForm((prev) => ({ ...prev, cardExpiry: formatted }));
                    }}
                    placeholder="MM/AA"
                    className="mt-2 w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.cardExpiry && <p className="animate-fade-in text-xs text-danger">{fieldErrors.cardExpiry}</p>}
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-(--text-primary)">CVV</span>
                  <input
                    inputMode="numeric"
                    value={cardForm.cardCvv}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, cardCvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                    placeholder="123"
                    className="mt-2 w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.cardCvv && <p className="animate-fade-in text-xs text-danger">{fieldErrors.cardCvv}</p>}
                </label>
                <p className="sm:col-span-2 flex items-center gap-2 text-xs text-(--text-secondary)">
                  <ShieldCheck className="h-4 w-4 text-(--accent)" />
                  <span>Pago de demostración: no se realiza ningún cobro real.</span>
                </p>
              </div>
            )}

            {paymentMethod === "nequi" && (
              <div className="animate-fade-in-down animate-duration-200 px-6 pb-6 pt-4 sm:px-8">
                <label className="space-y-2 text-sm">
                  <span className="text-(--text-primary)">Teléfono Nequi</span>
                  <input
                    inputMode="numeric"
                    value={nequiForm.nequiPhone}
                    onChange={(e) => setNequiForm({ nequiPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    placeholder="3001234567"
                    className="w-full rounded-xl border border-(--border) bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.nequiPhone && <p className="animate-fade-in text-xs text-danger">{fieldErrors.nequiPhone}</p>}
                </label>
              </div>
            )}

            {paymentMethod === "pse" && (
              <div className="animate-fade-in-down animate-duration-200 grid gap-4 px-6 pb-6 pt-4 sm:grid-cols-2 sm:px-8">
                <label className="space-y-2 text-sm sm:col-span-2">
                  <span className="text-(--text-primary)">Banco</span>
                  <input
                    value={pseForm.pseBank}
                    onChange={(e) => setPseForm((prev) => ({ ...prev, pseBank: e.target.value }))}
                    placeholder="Nombre del banco"
                    className="w-full rounded-xl border border-(--border) mt-2 bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.pseBank && <p className="animate-fade-in text-xs text-danger">{fieldErrors.pseBank}</p>}
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-(--text-primary)">Tipo de persona</span>
                  <select
                    value={pseForm.psePersonType}
                    onChange={(e) => setPseForm((prev) => ({ ...prev, psePersonType: e.target.value as "natural" | "juridica" }))}
                    className="w-full rounded-xl border border-(--border) mt-2 bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) dark:bg-[#0b1a33] dark:[&>option]:bg-[#0b1a33] dark:[&>option]:text-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="natural">Natural</option>
                    <option value="juridica">Jurídica</option>
                  </select>
                  {fieldErrors.psePersonType && <p className="animate-fade-in text-xs text-danger">{fieldErrors.psePersonType}</p>}
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-(--text-primary)">Identificación</span>
                  <input
                    value={pseForm.pseId}
                    onChange={(e) => setPseForm((prev) => ({ ...prev, pseId: e.target.value.replace(/\D/g, "") }))}
                    className="w-full rounded-xl border border-(--border) mt-2 bg-transparent px-3 py-2 text-(--text-primary) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)"
                  />
                  {fieldErrors.pseId && <p className="animate-fade-in text-xs text-danger">{fieldErrors.pseId}</p>}
                </label>
              </div>
            )}
          </section>

          {formError && (
            <div
              key={formError}
              role="alert"
              className="animate-shake rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
            >
              {formError}
            </div>
          )}

          {validatingCard && (
            <div className="rounded-2xl border border-(--border) bg-(image:--surface) px-4 py-3 text-sm text-(--text-primary)">
              Procesando...
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={submitting || (!isCartCheckout && product?.stock === 0)}
              aria-busy={submitting}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-8 py-3 text-sm font-medium text-white shadow-[0_30px_70px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
                />
              )}
              {submitting ? (validatingCard ? "Validando tarjeta..." : "Procesando...") : "Confirmar compra"}
            </button>
            <Link
              to={isCartCheckout ? "/" : product ? `/product/${product.id}` : "/"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-6 py-2.5 text-sm font-medium text-(--text-primary)"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
