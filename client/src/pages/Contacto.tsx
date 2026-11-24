import { useState } from "react";
import { lazy, Suspense } from "react";


const ContactMap = lazy(() => import("../components/ContactMap"));

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export default function Contacto() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "El nombre es obligatorio";
    if (!form.email.trim()) {
      nextErrors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Correo electrónico inválido";
    }
    if (!form.subject.trim()) nextErrors.subject = "El asunto es obligatorio";
    if (!form.message.trim()) nextErrors.message = "El mensaje es obligatorio";
    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitting(false);
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-11/12 px-4 pb-16 pt-10 sm:px-6">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(image:--surface) px-6 py-10 shadow-(--card-shadow) sm:px-10 lg:px-14">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18),transparent)] blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.16),transparent)] blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-xs uppercase tracking-[0.6em] text-(--accent)">Contacto</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-(--text-primary) sm:text-5xl lg:text-6xl">
            ¿Hablamos?
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-(--text-secondary)">
            Consultas, colaboraciones o ideas. Estamos en Barranquilla, Colombia, listos para conversar.
          </p>
        </div>
      </section>

      <section className="relative z-0 mt-10 ">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-4xl border border-(--border) bg-(--surface-subtle) sm:h-105 lg:h-130" />}>
          <ContactMap />
        </Suspense>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <article className="relative rounded-4xl border border-(--border) bg-(image:--surface) p-6 shadow-(--card-shadow) sm:p-8">
            <div className="absolute -right-16 top-0 overflow-hidden h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.14),transparent)] blur-3xl" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.5em] text-(--accent)">Métodos de contacto</p>
              <h2 className="mt-3 font-display text-2xl font-semibold text-(--text-primary)">Conecta directo</h2>
              <p className="mt-2 text-sm text-(--text-secondary)">Elige el canal que prefieras para responderte más rápido.</p>
              <div className="mt-6 grid gap-3">
                <a
                  href="https://wa.me/573024614943"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-(--border) px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-green-600 hover:drop-shadow-[0_0_10px_rgba(22,163,74,0.45)] hover:shadow-[0_0_12px_rgba(22,163,74,0.45)] dark:hover:border-green-500 dark:hover:drop-shadow-[0_0_10px_rgba(0,255,0,0.5)] dark:hover:shadow-[0_0_10px_rgba(0,255,0,0.5)]"
                >
                  <div className="flex items-center gap-4 transition-all duration-300">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-green-500 bg-green-500 text-white">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                        <path d="M12 2a10 10 0 0 0-8.66 15l-1.2 4.4 4.52-1.18A10 10 0 1 0 12 2Zm5.48 14.12c-.23.65-1.34 1.24-1.86 1.32-.48.07-1.08.1-1.74-.11-.4-.13-.91-.3-1.57-.58-2.76-1.19-4.56-3.97-4.7-4.15-.14-.18-1.12-1.49-1.12-2.84s.71-2.02.96-2.29c.25-.27.55-.34.73-.34h.53c.17 0 .4-.07.63.48.23.56.78 1.9.85 2.04.07.14.12.3.02.48-.09.18-.14.3-.28.46-.14.16-.3.36-.43.48-.14.14-.29.29-.12.57.17.28.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.14.46.12.63-.07.17-.19.73-.85.93-1.14.19-.29.38-.24.63-.14.26.09 1.63.77 1.91.91.28.14.46.21.53.33.07.12.07.7-.16 1.35Z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">WhatsApp</p>
                      <p className="text-sm text-(--text-secondary)">+57 302 461 4943</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-(--text-secondary) transition-transform duration-300 group-hover:translate-x-1 group-hover:text-green-500">
                    <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="mailto:raykhararrieta01@gmail.com"
                  className="group flex items-center justify-between rounded-2xl border border-(--border) px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-cobalt hover:drop-shadow-[0px_0px_3px_rgba(30,79,216,0.4)] hover:shadow-[0_0_6px_rgba(30,79,216,0.4)] dark:hover:border-(--text-primary) dark:hover:drop-shadow-[0px_0px_2px_var(--text-primary)] dark:hover:shadow-[0_0_4px_var(--text-primary)]"
                >
                  <div className="flex items-center gap-4 drop-shadow-[0px_0px_4px_var(--accent-glow)] transition-all duration-300">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-black/50 bg-white">
                      <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        className="size-5 text-red-500" viewBox="0 0 512.000000 512.000000"
                        preserveAspectRatio="xMidYMid meet">
                      <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                        fill="currentColor" stroke="none">
                      <path d="M167 4494 c-31 -10 -64 -30 -92 -59 -81 -80 -75 66 -75 -1875 0
                      -1941 -6 -1795 75 -1875 64 -65 110 -75 332 -75 l183 0 2 1480 3 1480 980
                      -714 c539 -394 982 -715 985 -715 3 0 443 319 978 709 535 391 977 710 983
                      710 5 0 9 -563 9 -1476 l0 -1476 208 4 c189 3 211 5 247 25 47 25 85 64 111
                      113 18 34 19 99 22 1784 3 1969 8 1820 -73 1901 -53 54 -118 75 -225 75 l-76
                      0 -690 -503 c-379 -276 -870 -634 -1091 -795 l-403 -294 -1091 796 -1092 796
                      -81 -1 c-45 0 -103 -7 -129 -15z"/>
                      </g>
                  </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">Correo electrónico</p>
                      <p className="text-sm text-(--text-secondary)">raykhararrieta01@gmail.com</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 20 20" className="h-4 w-4 text-(--text-secondary) transition-transform duration-300 group-hover:translate-x-1 group-hover:text-(--text-primary) ">
                    <path d="M7.5 4.5 13 10l-5.5 5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <div className="flex items-center justify-between rounded-2xl border border-(--border) px-5 py-4">
                  <div className="flex items-center gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-black/80 bg-white text-black">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 " fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M12 21s-6-4.35-6-9.75A6 6 0 0 1 12 5a6 6 0 0 1 6 6.25C18 16.65 12 21 12 21Z" />
                        <circle cx="12" cy="11.25" r="2" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-medium text-(--text-primary)">Ubicación</p>
                      <p className="text-sm text-(--text-secondary)">Barranquilla, Colombia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
        <article className="relative overflow-hidden rounded-4xl border border-(--border) bg-(image:--surface) p-6 shadow-(--card-shadow) sm:p-8">
          <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.14),transparent)] blur-3xl" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.5em] text-(--accent)">Formulario</p>
            <h2 className="mt-3 font-display text-2xl font-semibold text-(--text-primary)">Envíanos un mensaje</h2>
            <p className="mt-2 text-sm text-(--text-secondary)">Te responderemos lo antes posible.</p>
            {sent ? (
              <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-6 py-8 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-emerald-300/60">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-200" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mt-4 font-display text-xl text-(--text-primary)">Mensaje enviado</p>
                <p className="mt-2 text-sm text-(--text-secondary)">Gracias por escribirnos. Te responderemos pronto.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-6 inline-flex items-center justify-center rounded-full border border-(--border) px-6 py-2.5 text-sm text-(--text-primary)">
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <label className="text-(--text-secondary)">Nombre</label>
                    <input
                      value={form.name}
                      onChange={handleChange("name")}
                      className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 ${errors.name ? "border-red-400/70" : "border-(--border) focus:border-(--accent) focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)]"}`}
                    />
                    {errors.name && <p className="text-xs text-red-300">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <label className="text-(--text-secondary)">Correo electrónico</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 ${errors.email ? "border-red-400/70" : "border-(--border) focus:border-(--accent) focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)]"}`}
                    />
                    {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <label className="text-(--text-secondary)">Asunto</label>
                  <input
                    value={form.subject}
                    onChange={handleChange("subject")}
                    className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 ${errors.subject ? "border-red-400/70" : "border-(--border) focus:border-(--accent) focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)]"}`}
                  />
                  {errors.subject && <p className="text-xs text-red-300">{errors.subject}</p>}
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <label className="text-(--text-secondary)">Mensaje</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={handleChange("message")}
                    className={`rounded-xl border bg-transparent px-4 py-2.5 text-(--text-primary) outline-none transition-all duration-300 ${errors.message ? "border-red-400/70" : "border-(--border) focus:border-(--accent) focus:shadow-[0_0_0_4px_rgba(96,165,250,0.12)]"}`}
                  />
                  {errors.message && <p className="text-xs text-red-300">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white drop-shadow-[0px_0px_4px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:drop-shadow-[0px_0px_6px_var(--accent-glow-bright)] disabled:opacity-70 "
                >
                  {submitting ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
