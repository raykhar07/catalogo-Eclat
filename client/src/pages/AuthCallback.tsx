import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthApiError, confirmOAuthLink } from "../services/auth";

function sanitizeRedirect(value: string | null) {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

function providerLabel(provider: string | null) {
  if (provider === "google") return "Google";
  if (provider === "github") return "GitHub";
  return "el proveedor";
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { authenticateWithToken, token: sessionToken } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const handled = useRef(false);

  const token = params.get("token");
  const link = params.get("link");
  const email = params.get("email");
  const provider = params.get("provider");
  const redirect = sanitizeRedirect(params.get("redirect"));
  const oauthError = params.get("error");

  useEffect(() => {
    if (!token || handled.current) return;
    handled.current = true;
    (async () => {
      const user = await authenticateWithToken(token);
      if (user) {
        navigate(redirect, { replace: true });
      } else {
        setError("No se pudo iniciar sesión. Intenta de nuevo.");
      }
    })();
  }, [token, authenticateWithToken, navigate, redirect]);

  const handleConfirmLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!link) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await confirmOAuthLink(
        { pendingToken: link, password: password || undefined },
        sessionToken
      );
      const user = await authenticateWithToken(res.token);
      if (user) {
        navigate(sanitizeRedirect(res.redirect || "/"), { replace: true });
      } else {
        setError("No se pudo completar la vinculación. Intenta iniciar sesión.");
      }
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const title = link
    ? "Confirmar cuenta"
    : oauthError
      ? "No se pudo iniciar sesión"
      : "Iniciando sesión...";

  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="absolute inset-x-0 top-10 -z-10 h-72 bg-(--hero-glow)" />
      <div className="w-full max-w-md overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) p-8 shadow-(--card-shadow-hover) sm:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.5em] text-(--text-primary) backdrop-blur dark:border-white/15">
            Éclat Studio
          </span>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-(--text-primary)">
            {title}
          </h1>
        </div>

        {oauthError && !link && (
          <div className="mt-6">
            <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {oauthError}
            </div>
            <Link
              to="/auth"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        )}

        {token && !error && (
          <p className="mt-6 text-center text-sm text-(--text-secondary)">
            Validando tu cuenta...
          </p>
        )}

        {link && (
          <form className="mt-6 flex flex-col gap-4" onSubmit={handleConfirmLink}>
            <p className="text-sm leading-relaxed text-(--text-secondary)">
              Encontramos una cuenta existente con <span className="font-medium text-(--text-primary)">{email}</span>.
              Para confirmar que eres tú y vincular {providerLabel(provider)}, ingresa la contraseña de esa cuenta.
            </p>

            <label className="flex flex-col gap-2 text-sm">
              <span className="text-(--text-secondary)">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-xl border border-(--border) bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 focus:border-(--accent)"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Confirmando..." : "Confirmar y vincular"}
            </button>

            <Link
              to="/auth"
              className="text-center text-sm font-medium text-(--accent) transition-colors hover:text-(--accent-strong)"
            >
              Cancelar y volver
            </Link>
          </form>
        )}

        {!token && !link && !oauthError && (
          <div className="mt-6 text-center text-sm text-(--text-secondary)">
            <p>No se recibió información de autenticación.</p>
            <Link to="/auth" className="mt-4 inline-block font-medium text-(--accent)">
              Volver a iniciar sesión
            </Link>
          </div>
        )}

        {error && token && (
          <div className="mt-6">
            <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
            <Link
              to="/auth"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
