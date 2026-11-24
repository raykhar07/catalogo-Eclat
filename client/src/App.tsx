import { Link, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Promociones from "./pages/Promociones";
import Marcas from "./pages/Marcas";
import Contacto from "./pages/Contacto";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import CartDrawer from "./components/CartDrawer";
import { RequireAdmin } from "./components/RequireAdmin";
import FAQ from "./pages/attention/FAQ";
import EnviosDevoluciones from "./pages/attention/EnviosDevoluciones";
import AvisoLegal from "./pages/attention/AvisoLegal";
import PoliticaPrivacidad from "./pages/attention/PoliticaPrivacidad";
import TerminosCondiciones from "./pages/attention/TerminosCondiciones";

function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-(--border) bg-(image:--surface) p-8 text-center shadow-(--card-shadow)">
        <p className="text-sm font-medium uppercase tracking-[0.4em] text-(--accent)">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-(--text-primary) sm:text-3xl">
          Esa página no existe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-(--text-secondary)">
          Puede que el enlace esté mal escrito o que la página se haya movido.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-linear-to-r from-cobalt to-cobalt-deep px-6 py-2.5 text-sm font-medium text-white shadow-[0_25px_60px_-30px_var(--accent-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-28px_var(--accent-glow)] focus-visible:-translate-y-0.5"
        >
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-105 bg-(--hero-glow)" />
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout/:productId" element={<Checkout />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/mis-pedidos" element={<MyOrders />} />
          <Route path="/promociones" element={<Promociones />} />
          <Route path="/marcas" element={<Marcas />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/preguntas-frecuentes" element={<FAQ />} />
          <Route path="/envios-y-devoluciones" element={<EnviosDevoluciones />} />
          <Route path="/aviso-legal" element={<AvisoLegal />} />
          <Route path="/politica-de-privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos-y-condiciones" element={<TerminosCondiciones />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <CartDrawer />
      <footer className="mt-auto border-t border-(--border) bg-(--surface-subtle)">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-linear-to-br from-cobalt to-cobalt-deep text-sm font-semibold text-white shadow-[0_20px_50px_-30px_var(--accent-glow)]">
                  É
                </div>
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight text-(--text-primary)">
                    Éclat Studio
                  </p>
                  <p className="text-xs uppercase tracking-[0.32em] text-(--text-secondary)">
                    Catálogo de productos
                  </p>
                </div>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-(--text-secondary)">
                Electrónica, hogar, deportes, moda y libros. Busca, filtra y compra; el catálogo ya está ordenado.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-(--text-primary)">Explorar</p>
              <ul className="space-y-2 text-sm text-(--text-secondary)">
                <li>
                  <Link to="/" className="transition-colors hover:text-(--text-primary)">
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link to="/promociones" className="transition-colors hover:text-(--text-primary)">
                    Promociones
                  </Link>
                </li>
                <li>
                  <Link to="/marcas" className="transition-colors hover:text-(--text-primary)">
                    Marcas
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-(--text-primary)">Atención</p>
              <ul className="space-y-2 text-sm text-(--text-secondary)">
                <li>
                  <Link to="/contacto" className="transition-colors hover:text-(--text-primary)">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link to="/preguntas-frecuentes" className="transition-colors hover:text-(--text-primary)">
                    Preguntas frecuentes
                  </Link>
                </li>
                <li>
                  <Link to="/envios-y-devoluciones" className="transition-colors hover:text-(--text-primary)">
                    Envíos y devoluciones
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-(--text-primary)">Legal</p>
              <ul className="space-y-2 text-sm text-(--text-secondary)">
                <li>
                  <Link to="/aviso-legal" className="transition-colors hover:text-(--text-primary)">
                    Aviso legal
                  </Link>
                </li>
                <li>
                  <Link to="/politica-de-privacidad" className="transition-colors hover:text-(--text-primary)">
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terminos-y-condiciones" className="transition-colors hover:text-(--text-primary)">
                    Términos y condiciones
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-(--border) pt-6 text-sm text-(--text-secondary) sm:flex-row">
            <p>© {new Date().getFullYear()} Éclat Studio. Todos los derechos reservados.</p>
            <p className="text-center sm:text-right">Productos por categoría y marca. Los adjetivos corren por tu cuenta.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
