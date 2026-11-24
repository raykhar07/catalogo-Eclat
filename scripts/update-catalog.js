const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function norm(s) {
  return (s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectBrand(product) {
  const name = product.name || "";
  const n = norm(name);
  const cat = product.categorySlug;

  if (cat === "libros") {
    // Autores/artistas específicos (no marcas/editoriales en flujo de marcas)
    const authors = [
      ["paul auster", "Paul Auster"],
      ["auster", "Paul Auster"],
      ["vargas llosa", "Mario Vargas Llosa"],
      ["llosa", "Mario Vargas Llosa"],
      ["harari", "Yuval Noah Harari"],
      ["buchholz", "Quint Buchholz"],
      ["sabino", "Fernando Sabino"],
      ["saramago", "José Saramago"],
      ["allende", "Isabel Allende"],
      ["garcia marquez", "Gabriel García Márquez"],
      ["borges", "Jorge Luis Borges"],
      ["coelho", "Paulo Coelho"],
      ["stephen king", "Stephen King"],
      ["rowling", "J. K. Rowling"],
      ["tolkien", "J. R. R. Tolkien"],
      ["murakami", "Haruki Murakami"],
      ["cortazar", "Julio Cortázar"],
      ["neruda", "Pablo Neruda"],
      ["edgar allan poe", "Edgar Allan Poe"],
      ["poe", "Edgar Allan Poe"],
      ["bram stoker", "Bram Stoker"],
      ["stoker", "Bram Stoker"],
      ["homero", "Homero"],
      ["dante", "Dante Alighieri"],
      ["shakespeare", "William Shakespeare"],
    ];
    for (const [key, label] of authors) {
      if (n.includes(key)) return label;
    }
    // Heurísticas por título conocido
    if (n.includes("dracula")) return "Bram Stoker";
    if (n.includes("sapiens")) return "Yuval Noah Harari";
    if (n.includes("tunel")) return "Ernesto Sabato";
    if (n.includes("jefes")) return "Mario Vargas Llosa";
    if (n.includes("salto de mata")) return "Paul Auster";
    if (n.includes("libro de los libros")) return "Quint Buchholz";
    if (n.includes("matematicas") || n.includes("matemática")) return "Santillana Educación";
    if (n.includes("erase una vez")) return "Varios autores";
    if (n.includes("pow")) return "Varios autores";
    if (n.includes("alchemised")) return "SenLinYu";
    if (n.includes("energy oracle")) return "Sandra Anne Taylor";
    if (n.includes("dulce basura")) return "Alba Cardona";
    if (n.includes("moriria per tu")) return "Varios autores";
    if (n.includes("seduccion")) return "Varios autores";
    if (n.includes("hoy seix")) return "Varios autores";
    if (n.includes("actas norma") || n.includes("libro norma")) return "Norma";
    if (n.includes("diccionario")) return "Norma";
    if (n.includes("bolsillo")) return "Varios autores";
    return "Varios autores";
  }

  const brandRules = [
    // Electrónica (orden importa: específicos antes)
    ["attack shark", "Attack Shark"],
    ["asus rog", "ASUS"],
    ["vivobook", "ASUS"],
    ["asus", "ASUS"],
    ["acer", "Acer"],
    ["logitech", "Logitech"],
    ["razer", "Razer"],
    ["sony", "Sony"],
    ["samsung", "Samsung"],
    ["xiaomi", "Xiaomi"],
    ["redmi", "Xiaomi"],
    ["iphone", "Apple"],
    ["apple", "Apple"],
    ["jbl", "JBL"],
    ["lenovo", "Lenovo"],
    ["anker", "Anker"],
    ["motorola", "Motorola"],
    ["moto ", "Motorola"],
    ["hp ", "HP"],
    ["portatil hp", "HP"],
    ["lg ", "LG"],
    ["monitor lg", "LG"],
    ["belkin", "Belkin"],
    ["aula", "AULA"],
    ["hyperx", "HyperX"],
    ["steelseries", "SteelSeries"],
    ["corsair", "Corsair"],
    ["keychron", "Keychron"],
    ["canon", "Canon"],
    ["epson", "Epson"],

    // Deportes
    ["nike", "Nike"],
    ["adidas", "Adidas"],
    ["puma", "Puma"],
    ["reebok", "Reebok"],
    ["under armour", "Under Armour"],
    ["new balance", "New Balance"],
    ["skechers", "Skechers"],
    ["fila", "Fila"],
    ["salomon", "Salomon"],
    ["wilson", "Wilson"],
    ["lotto", "Lotto"],
    ["umbro", "Umbro"],
    ["gounod", "Gounod"],
    ["wargo", "Wargo"],
    ["asics", "Asics"],
    ["mizuno", "Mizuno"],
    ["brooks", "Brooks"],
    ["columbia", "Columbia"],
    ["head", "Head"],
    ["spalding", "Spalding"],
    ["gymreapers", "Gymreapers"],
    ["rogue", "Rogue"],
    ["eleiko", "Eleiko"],
    ["harbinger", "Harbinger"],

    // Hogar
    ["oster", "Oster"],
    ["imusa", "Imusa"],
    ["tramontina", "Tramontina"],
    ["tefal", "Tefal"],
    ["t-fal", "Tefal"],
    ["moulinex", "Moulinex"],
    ["electrolux", "Electrolux"],
    ["whirlpool", "Whirlpool"],
    ["whirpool", "Whirlpool"],
    ["haceb", "Haceb"],
    ["corona", "Corona"],
    ["royal prestige", "Royal Prestige"],
    ["magefesa", "Magefesa"],
    ["pyrex", "Pyrex"],
    ["kalley", "Kalley"],
    ["kitchenaid", "KitchenAid"],
    ["black+decker", "Black+Decker"],
    ["black & decker", "Black+Decker"],
    ["oxo", "OXO"],
    ["le creuset", "Le Creuset"],
    ["samurai", "Samurai"],
    ["record", "Record"],
    ["rubbermaid", "Rubbermaid"],
    ["ibili", "Ibili"],
    ["hudson", "Hudson"],

    // Moda
    ["levi", "Levi's"],
    ["wrangler", "Wrangler"],
    ["lec lee", "Lee"],
    ["lee ", "Lee"],
    [" lee", "Lee"],
    ["chevignon", "Chevignon"],
    ["americanino", "Americanino"],
    ["gef", "GEF"],
    ["totto", "Totto"],
    ["diesel", "Diesel"],
    ["tommy hilfiger", "Tommy Hilfiger"],
    ["calvin klein", "Calvin Klein"],
    ["lacoste", "Lacoste"],
    ["zara", "Zara"],
    ["h&m", "H&M"],
    ["carhartt", "Carhartt"],
    ["converse", "Converse"],
    ["vans", "Vans"],
    ["studio f", "Studio F"],
    ["bosi", "Bosi"],
    ["tennis", "Tennis"],
  ];

  for (const [key, label] of brandRules) {
    if (n.includes(key)) return label;
  }
  return "Genérica";
}

function cleanName(name) {
  return (name || "").replace(/\s+/g, " ").trim();
}

function buildDescription(p, brand) {
  const name = cleanName(p.name);
  const cat = p.categorySlug;
  const lower = norm(name);

  if (cat === "electronica") {
    if (lower.includes("iphone") || lower.includes("celular") || lower.includes("smartphone") || lower.includes("galaxy") || lower.includes("redmi") || lower.includes("moto") || lower.includes("note 1")) {
      return `${name}. Smartphone diseñado para ofrecer un rendimiento fluido en el día a día, con buena experiencia en fotografía, conectividad y autonomía. Ideal para comunicación, redes sociales, entretenimiento y trabajo móvil en Colombia.`;
    }
    if (lower.includes("audifono") || lower.includes("auricular") || lower.includes("diadema") || lower.includes("headset") || lower.includes("blackshark") || lower.includes("hammerhead") || lower.includes("wh-ch")) {
      return `${name}. Audífonos con sonido claro y cómodo ajuste para música, llamadas, juegos o estudio. Pensados para uso prolongado, con diseño práctico y buena calidad de audio para tu rutina diaria.`;
    }
    if (lower.includes("monitor")) {
      return `${name}. Monitor con imagen nítida y colores definidos para trabajo, estudio o gaming. Ofrece una experiencia visual cómoda para productividad, entretenimiento y multitarea en tu escritorio.`;
    }
    if (lower.includes("teclado")) {
      return `${name}. Teclado pensado para escritura precisa y sesiones de juego o trabajo. Combina respuesta confiable, diseño funcional y comodidad para mejorar tu experiencia frente al computador.`;
    }
    if (lower.includes("mouse") || lower.includes("raton") || lower.includes("ratón")) {
      return `${name}. Mouse con control preciso y diseño ergonómico para oficina, estudio o gaming. Facilita movimientos ágiles y cómodos durante largas jornadas frente al PC.`;
    }
    if (lower.includes("mousepad") || lower.includes("alfombrilla")) {
      return `${name}. Alfombrilla diseñada para ofrecer una superficie uniforme y buen deslizamiento del mouse. Aporta precisión, comodidad y estabilidad en tu espacio de trabajo o juego.`;
    }
    if (lower.includes("parlante")) {
      return `${name}. Parlante portátil con sonido potente y práctico para llevar tu música a cualquier lugar. Ideal para reuniones, descansos o entretenimiento en casa con conexión sencilla.`;
    }
    if (lower.includes("cargador") || lower.includes("cable")) {
      return `${name}. Accesorio de carga confiable para mantener tus dispositivos listos durante el día. Ofrece compatibilidad práctica y un uso cómodo en casa, oficina o viaje.`;
    }
    if (lower.includes("power bank") || lower.includes("bateria portatil") || lower.includes("batería portátil")) {
      return `${name}. Batería portátil para cargar tus dispositivos cuando lo necesites. Compacta y práctica para viajes, universidad o jornadas largas fuera de casa.`;
    }
    if (lower.includes("webcam") || lower.includes("camara web") || lower.includes("cámara") || lower.includes("dsc")) {
      return `${name}. Cámara pensada para videollamadas, creación de contenido o registro de momentos con buena claridad. Una opción práctica para estudiar, trabajar o compartir en línea.`;
    }
    if (lower.includes("hub")) {
      return `${name}. Hub multipuerto que amplía las conexiones de tu computador o portátil. Facilita conectar periféricos y accesorios para un espacio de trabajo más ordenado y eficiente.`;
    }
    if (lower.includes("case") || lower.includes("funda") || lower.includes("estuche")) {
      return `${name}. Funda protectora diseñada para cuidar tu celular de golpes y rayones cotidianos. Aporta estilo y protección sin sacrificar comodidad en el uso diario.`;
    }
    if (lower.includes("portatil") || lower.includes("portátil") || lower.includes("laptop") || lower.includes("tablet")) {
      return `${name}. Equipo portátil ideal para estudiar, trabajar y consumir contenido multimedia. Combina rendimiento, movilidad y comodidad para tus tareas diarias.`;
    }
    if (lower.includes("microfono") || lower.includes("micrófono")) {
      return `${name}. Micrófono con captura de voz clara para streaming, videollamadas, grabaciones o clases virtuales. Mejora la calidad de tu audio con una configuración sencilla.`;
    }
    return `${name}. Producto de tecnología de la marca ${brand}, seleccionado para complementar tu día a día con funcionalidad, buen desempeño y diseño práctico.`;
  }

  if (cat === "hogar") {
    if (lower.includes("licuadora")) {
      return `${name}. Licuadora práctica para preparar jugos, batidos y salsas en casa. Facilita tus recetas diarias con un uso sencillo y resultados homogéneos.`;
    }
    if (lower.includes("batidora")) {
      return `${name}. Batidora ideal para repostería y preparaciones caseras. Ayuda a mezclar, batir y montar ingredientes con mayor rapidez y comodidad en la cocina.`;
    }
    if (lower.includes("freidora")) {
      return `${name}. Freidora de aire diseñada para cocinar con menos aceite y mantener el sabor de tus comidas favoritas. Práctica para preparar recetas rápidas y más ligeras en casa.`;
    }
    if (lower.includes("olla")) {
      return `${name}. Olla resistente y funcional para cocinar sopas, guisos, arroces y preparaciones del día a día. Aporta buena distribución del calor y comodidad en la cocina.`;
    }
    if (lower.includes("sarten") || lower.includes("sartén") || lower.includes("paellera")) {
      return `${name}. Sartén pensada para cocinar de forma uniforme y con fácil desmolde. Ideal para desayunos, salteados y preparaciones cotidianas con resultados confiables.`;
    }
    if (lower.includes("cafetera")) {
      return `${name}. Cafetera práctica para disfrutar café recién preparado en casa. Perfecta para acompañar tus mañanas con aroma, sabor y facilidad de uso.`;
    }
    if (lower.includes("cuchillo") || lower.includes("utensil")) {
      return `${name}. Utensilio de cocina diseñado para facilitar el corte y la preparación de alimentos. Aporta precisión, comodidad y durabilidad en tus recetas diarias.`;
    }
    if (lower.includes("tabla")) {
      return `${name}. Tabla resistente para picar y preparar alimentos con mayor orden e higiene. Un complemento esencial para la cocina diaria.`;
    }
    if (lower.includes("vajilla") || lower.includes("mug") || lower.includes("vaso") || lower.includes("bowl") || lower.includes("refractaria")) {
      return `${name}. Pieza de vajilla ideal para servir y disfrutar tus comidas con estilo. Práctica para el uso diario en el hogar, con diseño funcional y resistente.`;
    }
    if (lower.includes("horno") || lower.includes("tostador")) {
      return `${name}. Electrodoméstico compacto para tostar, hornear y calentar alimentos de forma práctica. Una ayuda versátil para preparar recetas rápidas en casa.`;
    }
    if (lower.includes("aspiradora")) {
      return `${name}. Aspiradora práctica para mantener tus espacios limpios con menos esfuerzo. Facilita la limpieza diaria de pisos y superficies del hogar.`;
    }
    if (lower.includes("calentador") || lower.includes("calefactor")) {
      return `${name}. Equipo para el hogar que brinda confort y funcionalidad en el uso cotidiano. Diseñado para ofrecer un desempeño confiable según tus necesidades.`;
    }
    if (lower.includes("estufa") || lower.includes("meson") || lower.includes("mesón")) {
      return `${name}. Solución para cocina diseñada para preparar tus alimentos con comodidad y eficiencia. Aporta funcionalidad y buen rendimiento al espacio del hogar.`;
    }
    if (lower.includes("lavadora") || lower.includes("triturador") || lower.includes("filtro") || lower.includes("raspador")) {
      return `${name}. Producto para el hogar que facilita tareas de mantenimiento y cuidado diario. Pensado para ofrecer practicidad, durabilidad y mejor organización en casa.`;
    }
    return `${name}. Artículo para el hogar de ${brand}, útil para mejorar la organización, preparación de alimentos o comodidad en tus espacios diarios.`;
  }

  if (cat === "deportes") {
    if (lower.includes("tenis") || lower.includes("zapatilla") || lower.includes("zapatos") || lower.includes("guayos") || lower.includes("tacos") || lower.includes("botas")) {
      return `${name}. Calzado deportivo diseñado para brindar comodidad, soporte y buen agarre. Ideal para entrenar, jugar o complementar tu estilo activo con confianza.`;
    }
    if (lower.includes("camiseta") || lower.includes("top") || lower.includes("buzo") || lower.includes("chaqueta") || lower.includes("pantalon") || lower.includes("pantalón") || lower.includes("jogger") || lower.includes("sudadera") || lower.includes("licras") || lower.includes("leggins")) {
      return `${name}. Prenda deportiva cómoda y versátil para entrenamientos o uso casual. Favorece la movilidad y te acompaña en rutinas de ejercicio y actividades del día a día.`;
    }
    if (lower.includes("gorra") || lower.includes("medias") || lower.includes("socks")) {
      return `${name}. Accesorio deportivo práctico para complementar tu outfit y entrenamientos. Aporta comodidad y estilo en actividades físicas o uso diario.`;
    }
    if (lower.includes("balon") || lower.includes("balón") || lower.includes("basketball") || lower.includes("futbol") || lower.includes("fútbol")) {
      return `${name}. Balón diseñado para ofrecer buen control y durabilidad en la práctica deportiva. Ideal para entrenamientos, partidos recreativos y diversión con amigos.`;
    }
    if (lower.includes("mochila")) {
      return `${name}. Mochila deportiva resistente para llevar tus elementos de entrenamiento con orden. Cómoda de cargar y útil para gimnasio, viajes cortos o actividades al aire libre.`;
    }
    if (lower.includes("guante")) {
      return `${name}. Guantes deportivos que brindan mejor agarre y protección durante el entrenamiento. Ideales para rutinas de gimnasio y levantamiento con mayor comodidad.`;
    }
    if (lower.includes("correa") || lower.includes("rodillera") || lower.includes("banda") || lower.includes("straps")) {
      return `${name}. Accesorio de entrenamiento diseñado para apoyar tu rendimiento y seguridad en cada rutina. Útil para fortalecer, estabilizar y mejorar la técnica en el ejercicio.`;
    }
    return `${name}. Artículo deportivo de ${brand} pensado para acompañar tu rendimiento y comodidad en entrenamientos, competencias o actividad física recreativa.`;
  }

  if (cat === "moda") {
    if (lower.includes("jean") || lower.includes("vaquero") || lower.includes("pantalon") || lower.includes("pantalón")) {
      return `${name}. Prenda de vestir con diseño versátil para combinar en looks casuales o urbanos. Ofrece comodidad y estilo para el uso diario.`;
    }
    if (lower.includes("camiseta") || lower.includes("polo") || lower.includes("camisa") || lower.includes("buzo") || lower.includes("chaqueta") || lower.includes("abrigo") || lower.includes("overol")) {
      return `${name}. Prenda de moda con acabado atractivo y fácil de combinar. Ideal para renovar tu guardarropa con una opción cómoda y con estilo.`;
    }
    if (lower.includes("tenis") || lower.includes("zapatilla")) {
      return `${name}. Calzado de estilo urbano que combina comodidad y diseño moderno. Perfecto para complementar tus outfits diarios con personalidad.`;
    }
    if (lower.includes("morral") || lower.includes("mochila") || lower.includes("bolso") || lower.includes("billetera") || lower.includes("cinturon") || lower.includes("cinturón") || lower.includes("sombrilla")) {
      return `${name}. Accesorio de ${brand} pensado para acompañarte en tu día a día con funcionalidad y estilo. Práctico, resistente y fácil de combinar.`;
    }
    if (lower.includes("brief") || lower.includes("ropa interior")) {
      return `${name}. Prenda básica diseñada para brindar comodidad y ajuste durante todo el día. Un esencial de guardarropa con materiales pensados para el uso cotidiano.`;
    }
    return `${name}. Producto de moda de ${brand} con diseño actual y versátil, ideal para complementar tu estilo personal en diferentes ocasiones.`;
  }

  if (cat === "libros") {
    const by = brand && brand !== "Varios autores" && brand !== "Norma" && brand !== "Santillana Educación" ? ` de ${brand}` : "";
    if (lower.includes("dracula")) {
      return `Drácula${by} es una novela gótica clásica que narra el enfrentamiento entre el conde Drácula y quienes intentan detener su amenaza. Una lectura imprescindible para amantes del misterio y el terror.`;
    }
    if (lower.includes("sapiens")) {
      return `Sapiens${by} ofrece un recorrido por la historia de la humanidad, desde los primeros Homo sapiens hasta la era moderna. Un libro divulgativo ideal para entender cómo evolucionamos como especie.`;
    }
    if (lower.includes("tunel")) {
      return `El túnel${by} es una novela psicológica intensa que explora la obsesión, la soledad y la mente de su protagonista. Una obra fundamental de la literatura latinoamericana.`;
    }
    if (lower.includes("jefes")) {
      return `Los jefes${by} reúne relatos que retratan personajes, poder y tensiones sociales con gran fuerza narrativa. Una obra representativa para acercarse a su estilo literario.`;
    }
    if (lower.includes("salto de mata")) {
      return `A salto de mata${by} es un texto autobiográfico que recoge reflexiones, vivencias y apuntes personales del autor. Una lectura íntima para conocer su mirada y trayectoria.`;
    }
    if (lower.includes("libro de los libros")) {
      return `El libro de los libros${by} es una obra que celebra la lectura y la imaginación a través del lenguaje visual y narrativo. Ideal para quienes disfrutan los libros como objetos de arte.`;
    }
    if (lower.includes("matematicas") || lower.includes("matemática")) {
      return `${name}. Material educativo enfocado en el aprendizaje y refuerzo de conceptos matemáticos. Útil para estudiantes que buscan practicar, comprender y avanzar en su formación académica.`;
    }
    if (lower.includes("diccionario")) {
      return `${name}. Diccionario práctico pensado como herramienta de consulta para estudiantes y lectores. Facilita la búsqueda de significados y el fortalecimiento del vocabulario.`;
    }
    if (lower.includes("actas") || (lower.includes("libro norma") && lower.includes("folios"))) {
      return `${name}. Libro de actas y registro ideal para oficinas, colegios o reuniones. Permite llevar un control ordenado de anotaciones y documentos administrativos.`;
    }
    return `${name}. Libro recomendado para lectores que buscan una experiencia enriquecedora, con contenido interesante para aprender, imaginar o disfrutar en su tiempo libre.`;
  }

  return `${name}. Producto seleccionado para ofrecer buena calidad y utilidad en su categoría.`;
}

function pickPromotions(products) {
  // ~22% de productos en promoción, con descuentos válidos (10-40%)
  const eligible = products.filter((p) => Number(p.price) > 0);
  const count = Math.max(25, Math.round(eligible.length * 0.22));
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const selected = new Set(shuffled.slice(0, count).map((p) => p.id));
  const updates = new Map();

  for (const p of products) {
    if (selected.has(p.id)) {
      const discount = 10 + Math.floor(Math.random() * 26); // 10..35
      const original = Math.round((p.price / (1 - discount / 100)) / 100) * 100;
      // asegurar que descuento quede en rango y original > price
      let orig = Math.max(original, p.price + 1000);
      let d = Math.floor(((orig - p.price) / orig) * 100);
      if (d < 5) orig = Math.round((p.price / 0.9) / 100) * 100;
      if (d > 75) orig = Math.round((p.price / 0.6) / 100) * 100;
      updates.set(p.id, { isPromoted: true, originalPrice: orig });
    } else {
      updates.set(p.id, { isPromoted: false, originalPrice: null });
    }
  }
  return updates;
}

async function main() {
  const products = await prisma.product.findMany({ include: { category: true } });
  const normalized = products.map((p) => ({
    ...p,
    price: Number(p.price),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    categorySlug: p.category.slug,
  }));

  const promoMap = pickPromotions(normalized);

  let updated = 0;
  for (const p of normalized) {
    const brand = detectBrand(p);
    const description = buildDescription({ ...p, categorySlug: p.categorySlug }, brand);
    const promo = promoMap.get(p.id) || { isPromoted: false, originalPrice: null };

    await prisma.product.update({
      where: { id: p.id },
      data: {
        brand,
        description,
        isPromoted: promo.isPromoted,
        originalPrice: promo.originalPrice,
      },
    });
    updated++;
    if (updated % 25 === 0) console.log(`Actualizados ${updated}/${normalized.length}`);
  }

  const promoted = Array.from(promoMap.values()).filter((x) => x.isPromoted).length;
  console.log(`Listo. ${updated} productos actualizados. Promociones: ${promoted}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
