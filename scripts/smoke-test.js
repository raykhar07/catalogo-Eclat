/**
 * Smoke test de la API. No requiere framework: usa fetch nativo de Node 18+.
 *
 * 1. Levanta el servidor compilado (dist/server/index.js) en un puerto libre.
 * 2. Recorre los endpoints y verifica status + contenido.
 * 3. Limpia los registros que crea. Sale con código != 0 si algo falla.
 *
 * Uso:  npm test          (exige haber ejecutado `npm run build` antes)
 *       node scripts/smoke-test.js
 */
const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.TEST_PORT) || 3111;
const BASE = `http://localhost:${PORT}`;

const results = [];
let currentGroup = "";

function group(name) {
  currentGroup = name;
}

function check(label, condition, extra) {
  results.push({ group: currentGroup, label, ok: Boolean(condition), extra });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(pathname, options) {
  const res = await fetch(BASE + pathname, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

function json(method, data) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

const VALID_PRODUCT = {
  name: "Producto smoke test",
  description: "Producto temporal creado por el smoke test para verificar el endpoint.",
  price: 42.5,
  stock: 7,
  imageUrl: "https://picsum.photos/seed/smoke/600/400",
};

async function waitForServer(child) {
  for (let i = 0; i < 60; i++) {
    if (child.exitCode !== null) return false;
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch {
      /* aún no levanta */
    }
    await wait(250);
  }
  return false;
}

async function run() {
  let child;
  try {
    child = spawn(process.execPath, ["dist/server/index.js"], {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT) },
      stdio: ["ignore", "pipe", "pipe"],
    });

    const up = await waitForServer(child);
    if (!up) {
      console.error(
        "No se pudo arrancar dist/server/index.js. Ejecuta `npm run build` antes de los tests."
      );
      child.kill();
      process.exit(1);
    }

    const createdIds = [];
    let categoryId = null;
    const uniqueSlug = `smoke-${Date.now()}`;

    // --- Categorías -------------------------------------------------------
    group("categorías");
    const cats = await api("/api/categories");
    check("GET /api/categories responde 200", cats.status === 200, cats.status);
    check("devuelve un array", Array.isArray(cats.body));

    const catCreated = await api("/api/categories", json("POST", { name: "Smoke Cat", slug: uniqueSlug }));
    check("POST categoría válida devuelve 201", catCreated.status === 201, catCreated.status);
    check("la categoría tiene id", typeof catCreated.body?.id === "number");
    categoryId = catCreated.body?.id ?? null;

    const catDup = await api("/api/categories", json("POST", { name: "Smoke Cat 2", slug: uniqueSlug }));
    check("POST slug duplicado devuelve 409", catDup.status === 409, catDup.status);
    check("el error 409 tiene mensaje", Boolean(catDup.body?.error));

    const catInvalid = await api("/api/categories", json("POST", { name: "X", slug: "NO valido!" }));
    check("POST slug inválido devuelve 400", catInvalid.status === 400, catInvalid.status);
    check("el error 400 detalla el campo", Array.isArray(catInvalid.body?.details));

    // --- Productos: CRUD --------------------------------------------------
    group("productos · CRUD");
    const created = await api("/api/products", json("POST", { ...VALID_PRODUCT, categoryId }));
    check("POST producto válido devuelve 201", created.status === 201, created.status);
    check("el precio se serializa como number", typeof created.body?.price === "number");
    check("trae la categoría embebida", created.body?.category?.slug === uniqueSlug);
    const pid = created.body?.id;
    if (pid) createdIds.push(pid);

    const createdInvalid = await api("/api/products", json("POST", { name: "x", categoryId }));
    check("POST producto inválido devuelve 400", createdInvalid.status === 400, createdInvalid.status);
    check("el error 400 menciona el nombre", (createdInvalid.body?.details ?? []).some((d) => d.campo === "name"));

    const createdBadCat = await api("/api/products", json("POST", { ...VALID_PRODUCT, categoryId: 999999 }));
    check("POST categoría inexistente devuelve 400", createdBadCat.status === 400, createdBadCat.status);

    if (pid) {
      const updated = await api(`/api/products/${pid}`, json("PUT", { price: 99.9, stock: 0 }));
      check("PUT devuelve 200", updated.status === 200, updated.status);
      check("aplica los cambios", updated.body?.price === 99.9 && updated.body?.stock === 0);

      const notFound = await api("/api/products/999999");
      check("GET id inexistente devuelve 404", notFound.status === 404, notFound.status);

      const badId = await api("/api/products/abc");
      check("GET id no numérico devuelve 400", badId.status === 400, badId.status);
    }

    // --- Productos: listado y filtros -------------------------------------
    group("productos · listado");
    const list = await api("/api/products?limit=5");
    check("GET lista responde 200", list.status === 200, list.status);
    check("respeta el limit", (list.body?.products ?? []).length <= 5);
    check("devuelve total y paginación", Number.isInteger(list.body?.total) && Number.isInteger(list.body?.totalPages));

    const search = await api("/api/products?search=laptop");
    check("búsqueda filtra", search.body?.total >= 0 && (search.body?.products ?? []).every((p) => /laptop/i.test(p.name + p.description)));

    const byCat = await api(`/api/products?category=${uniqueSlug}`);
    check("filtro por slug devuelve los creados", byCat.body?.total === 1, byCat.body?.total);

    const sorted = await api("/api/products?sort=price_asc&limit=50");
    const prices = (sorted.body?.products ?? []).map((p) => p.price);
    check("orden price_asc es ascendente", prices.every((v, i) => i === 0 || prices[i - 1] <= v));

    const emptyRange = await api("/api/products?minPrice=900&maxPrice=10");
    check("rango de precio imposible devuelve 0", emptyRange.body?.total === 0, emptyRange.body?.total);

    const badSort = await api("/api/products?sort=loco");
    check("sort inválido devuelve 400", badSort.status === 400, badSort.status);

    // --- Protección de categorías -----------------------------------------
    group("categorías · protección");
    if (categoryId) {
      const blocked = await api(`/api/categories/${categoryId}`, { method: "DELETE" });
      check("DELETE categoría con productos devuelve 400", blocked.status === 400, blocked.status);
    }

    // --- Limpieza ---------------------------------------------------------
    group("limpieza");
    for (const id of createdIds) {
      const del = await api(`/api/products/${id}`, { method: "DELETE" });
      check(`DELETE producto ${id}`, del.status === 200, del.status);
    }
    if (categoryId) {
      const delCat = await api(`/api/categories/${categoryId}`, { method: "DELETE" });
      check("DELETE categoría propia", delCat.status === 200, delCat.status);
    }
  } finally {
    if (child) child.kill();
  }

  // --- Reporte ------------------------------------------------------------
  const failed = results.filter((r) => !r.ok);
  let lastGroup = "";
  for (const r of results) {
    if (r.group !== lastGroup) {
      console.log(`\n${r.group}`);
      lastGroup = r.group;
    }
    const detail = r.ok || r.extra === undefined ? "" : `  (obtuve: ${JSON.stringify(r.extra)})`;
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.label}${detail}`);
  }

  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones correctas.`);

  if (failed.length > 0) {
    console.error(`\n${failed.length} comprobaciones fallaron.`);
    process.exit(1);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Error inesperado en el smoke test:", err);
  process.exit(1);
});
