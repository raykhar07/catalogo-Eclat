import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthApiError } from "../services/auth";

type Mode = "login" | "register";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const redirectFromState = (location.state as { from?: Location } | null)?.from?.pathname;
  const redirectFromSearch = new URLSearchParams(location.search).get("redirect");
  const redirectTo = redirectFromState || redirectFromSearch || "/";
  const oauthRedirect = encodeURIComponent(redirectTo);
  const googleAuthUrl = `/api/auth/google?redirect=${oauthRedirect}`;
  const githubAuthUrl = `/api/auth/github?redirect=${oauthRedirect}`;
  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    setGeneralError(null);
    setSuccessMessage(null);
  };

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);
  };

  const mapDetailsToErrors = (details: Array<{ campo: string; mensaje: string }>) => {
    const errors: FieldErrors = {};
    for (const detail of details) {
      if (detail.campo === "name") errors.name = detail.mensaje;
      if (detail.campo === "email") errors.email = detail.mensaje;
      if (detail.campo === "password") errors.password = detail.mensaje;
    }
    return errors;
  };

  const validateClient = () => {
    const errors: FieldErrors = {};
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    if (!isLogin) {
      const name = form.name.trim();
      if (!name) {
        errors.name = "El nombre es obligatorio";
      } else if (name.length < 3) {
        errors.name = "El nombre debe tener al menos 3 letras";
      } else if (!nameRegex.test(name)) {
        errors.name = "El nombre solo debe contener letras";
      }
    }

    const email = form.email.trim();
    if (!email) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Correo electrónico inválido";
    }

    const password = form.password;
    if (!password) {
      errors.password = "La contraseña es obligatoria";
    } else if (!isLogin && password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setGeneralError(null);
    setSuccessMessage(null);

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email.trim(), form.password);
        navigate(redirectTo, { replace: true });
      } else {
        await register(form.name.trim(), form.email.trim(), form.password);
        setForm((prev) => ({ ...prev, password: "" }));
        setSuccessMessage("Cuenta creada correctamente. Ya puedes iniciar sesión.");
        setMode("login");
      }
    } catch (error) {
      if (error instanceof AuthApiError) {
        const mapped = mapDetailsToErrors(error.details);
        if (Object.keys(mapped).length > 0) {
          setFieldErrors(mapped);
        }
        setGeneralError(error.message);
      } else if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError("Ocurrió un error inesperado");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-[calc(100svh-7rem)] max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="absolute inset-x-0 top-10 -z-10 h-72 bg-(--hero-glow)" />
      <div className="w-full max-w-md overflow-hidden rounded-[1.9rem] border border-(--border) bg-(image:--surface) shadow-(--card-shadow-hover)">
        <div className="relative px-6 pb-6 pt-8 sm:px-10 sm:pt-10">
          <div className="flex flex-col items-center text-center">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.5em] text-(--text-primary) backdrop-blur dark:border-white/15">
              Éclat Studio
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-(--text-primary) sm:text-4xl">
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-(--text-secondary)">
              {isLogin
                ? "Accede a tu espacio para gestionar tu cuenta y seguir explorando el catálogo."
                : "Regístrate para personalizar tu experiencia y guardar lo que más te inspire."}
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 rounded-full border border-(--border) bg-(--surface-subtle) p-1">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-linear-to-r from-cobalt to-cobalt-deep text-white shadow-[0_20px_50px_-28px_var(--accent-glow)]"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-linear-to-r from-cobalt to-cobalt-deep text-white shadow-[0_20px_50px_-28px_var(--accent-glow)]"
                  : "text-(--text-secondary) hover:text-(--text-primary)"
              }`}
            >
              Registrarte
            </button>
          </div>

          {successMessage && (
            <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}
          {generalError && !Object.keys(fieldErrors).length && (
            <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
              {generalError}
            </div>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex flex-col gap-2">
                  <span className="text-(--text-secondary)">Nombre completo</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Tu nombre"
                    className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)] ${
                      fieldErrors.name
                        ? "border-red-400/70 focus:border-red-400"
                        : "border-(--border) focus:border-(--accent)"
                    }`}
                  />
                </label>
                {fieldErrors.name && <p className="text-xs text-red-300">{fieldErrors.name}</p>}
              </div>
            )}
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex flex-col gap-2">
                <span className="text-(--text-secondary)">Correo electrónico</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  placeholder="nombre@correo.com"
                  className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)] ${
                    fieldErrors.email
                      ? "border-red-400/70 focus:border-red-400"
                      : "border-(--border) focus:border-(--accent)"
                  }`}
                />
              </label>
              {fieldErrors.email && <p className="text-xs text-red-300">{fieldErrors.email}</p>}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex flex-col gap-2">
                <span className="text-(--text-secondary)">Contraseña</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  placeholder="••••••••"
                  className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)] ${
                    fieldErrors.password
                      ? "border-red-400/70 focus:border-red-400"
                      : "border-(--border) focus:border-(--accent)"
                  }`}
                />
              </label>
              {fieldErrors.password && <p className="text-xs text-red-300">{fieldErrors.password}</p>}
            </div>

            {generalError && Object.keys(fieldErrors).length > 0 && (
              <div className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">
                {generalError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transform-none"
            >
              {submitting ? "Procesando..." : isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-(--text-secondary)">
            <span className="h-px flex-1 bg-(--border)" />
            <span>o continuar con</span>
            <span className="h-px flex-1 bg-(--border)" />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <a
              href={googleAuthUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-6 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-300 hover:-translate-y-0.5 hover:bg-(--accent-soft) hover:shadow-[0_20px_50px_-30px_var(--accent-glow)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M21.6 12.23c0-.68-.06-1.36-.18-2.02H12v3.83h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 3-4.33 3-7.36Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.52a6.02 6.02 0 0 1-8.96-3.16H3.08v2.6A10 10 0 0 0 12 22Z"
                  fill="#34A853"
                />
                <path
                  d="M6.43 13.88a6 6 0 0 1 0-3.76v-2.6H3.08a10 10 0 0 0 0 8.96l3.35-2.6Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.98a5.42 5.42 0 0 1 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.08 6.52l3.35 2.6A6 6 0 0 1 12 5.98Z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </a>
            <a
              href={githubAuthUrl}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-(--border) px-6 py-2.5 text-sm font-medium text-(--text-primary) transition-all duration-300 hover:-translate-y-0.5 hover:bg-(--accent-soft) hover:shadow-[0_20px_50px_-30px_var(--accent-glow)] active:translate-y-0 active:scale-[0.98] motion-reduce:transform-none"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94a3.87 3.87 0 0 1 1.03-2.68 3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.64a3.87 3.87 0 0 1 1.03 2.68c0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
                  fill="currentColor"
                />
              </svg>
              Continuar con GitHub
            </a>
          </div>

          <p className="mt-6 text-center text-sm text-(--text-secondary)">
            <Link to="/" className="font-medium text-(--accent) transition-colors hover:text-(--accent-strong)">
              Volver al catálogo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
