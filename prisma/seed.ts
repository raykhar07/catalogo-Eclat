import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { name: "Electrónica", slug: "electronica" },
  { name: "Hogar", slug: "hogar" },
  { name: "Deportes", slug: "deportes" },
  { name: "Moda", slug: "moda" },
  { name: "Libros", slug: "libros" },
];

const gymBrands = ["Rogue", "Eleiko", "CAP", "Gymreapers", "Harbinger"];
const techBrands = ["Logitech", "Razer", "Keychron", "SteelSeries", "HyperX", "Corsair"];
const homeBrands = ["OXO", "KitchenAid", "Le Creuset", "Tefal"];
const fashionBrands = ["Nike", "Adidas", "Puma", "New Balance", "Carhartt"];
const bookBrands = ["Penguin", "HarperCollins", "Planeta", "Alfaguara"];

const img = (keyword: string, id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=80`;

const deportesProducts = [
  { name: "Mancuernas Hexagonales 10kg Par", desc: "Mancuernas hexagonales recubiertas en goma para mayor agarre y protección del piso.", price: 249000, brand: gymBrands, imgId: "1517836357463-d25dfeac3438", keyword: "dumbbells" },
  { name: "Barra Olímpica 20kg", desc: "Barra olímpica de acero cromado con rodamientos, ideal para sentadillas, press y peso muerto.", price: 899000, brand: gymBrands, imgId: "1517964603305-11c0f6f66012", keyword: "barbell" },
  { name: "Discos Olímpicos 20kg (Par)", desc: "Discos de caucho con centro de acero, diseñados para uso en barra olímpica.", price: 749000, brand: gymBrands, imgId: "1583454110551-21f12b7a0a8a", keyword: "weight plates" },
  { name: "Barra Z EZ Curl", desc: "Barra Z para curl de bíceps y extensión de tríceps con mejor ergonomía para las muñecas.", price: 189000, brand: gymBrands, imgId: "1571019613454-1cb2f99b2d8b", keyword: "ez bar" },
  { name: "Bandas de Resistencia Set 5 Niveles", desc: "Set de bandas elásticas con distintos niveles de resistencia. Incluye anclaje y bolsa.", price: 89000, brand: gymBrands, imgId: "1598289431512-b97b0917affc", keyword: "resistance bands" },
  { name: "Straps de Levantamiento Pro", desc: "Straps de algodón reforzado con acolchado para mayor agarre en tirones pesados.", price: 59000, brand: gymBrands, imgId: "1434596922112-19c563067271", keyword: "lifting straps" },
  { name: "Guantes de Entrenamiento con Palma Reforzada", desc: "Guantes transpirables with refuerzo en palma y cierre de velcro.", price: 69000, brand: gymBrands, imgId: "1517838277536-f5f99be501cd", keyword: "gym gloves" },
  { name: "Cinturón de Levantamiento 4\"", desc: "Cinturón de cuero genuino de 4 pulgadas para soporte lumbar en levantamientos pesados.", price: 199000, brand: gymBrands, imgId: "1534438327276-14e5300c3a48", keyword: "lifting belt" },
  { name: "Balón de Fútbol Oficial Talla 5", desc: "Balón de fútbol cosido a máquina with cubierta sintética resistente al desgaste.", price: 149000, brand: ["Adidas", "Nike", "Puma"], imgId: "1553775282-20af80779df7", keyword: "soccer ball" },
  { name: "Balón de Baloncesto Indoor/Outdoor", desc: "Balón de baloncesto with textura grip para mejor control en cancha o exterior.", price: 139000, brand: ["Spalding", "Nike", "Adidas"], imgId: "1546519638-52c411946f30", keyword: "basketball" },
  { name: "Camiseta Deportiva Dri-Fit", desc: "Camiseta deportiva seca-rápido with tecnología de absorción de humedad.", price: 199000, brand: ["Adidas", "Nike"], imgId: "1554068865-44c633bdd8da", keyword: "football jersey" },
  { name: "Medias Deportivas Pack x3", desc: "Pack de 3 pares de medias with refuerzo en talón y punta, ideales para fútbol o running.", price: 59000, brand: fashionBrands, imgId: "1552346154-21d32810aba3", keyword: "sports socks" },
  { name: "Botines de Fútbol Pasto Sintético", desc: "Botines with suela multidireccional para césped artificial with gran tracción.", price: 449000, brand: ["Nike", "Adidas", "Puma"], imgId: "1511886929837-354d827aae26", keyword: "soccer cleats" },
  { name: "Zapatillas Running Neutras", desc: "Zapatillas para running with amortiguación reactiva y malla transpirable.", price: 549000, brand: fashionBrands, imgId: "1460353581641-37baddab0fa2", keyword: "running shoes" },
  { name: "Conjunto Térmico Deportivo", desc: "Conjunto térmico transpirable para entrenamientos en clima frío.", price: 129000, brand: fashionBrands, imgId: "1517838277536-f5f99be501cd", keyword: "thermal wear" },
];

const electronicaProducts = [
  { name: "Teclado Mecánico 75% RGB Hot-Swappable", desc: "Teclado 75% with switches intercambiables en caliente, iluminación RGB por tecla y cable desmontable.", price: 699000, brand: techBrands, imgId: "1541140532154-b024d705b90a", keyword: "mechanical keyboard" },
  { name: "Teclado Mecánico TKL Silencioso", desc: "Formato Tenkeyless with switches silenciosos, ideal para oficina y home office.", price: 549000, brand: techBrands, imgId: "1587829741301-dc798b83add3", keyword: "keyboard" },
  { name: "Teclado Magnético HE 65%", desc: "Teclado with switches magnéticos para mayor precisión en escritura y gaming competitivo.", price: 899000, brand: techBrands, imgId: "1618384887929-56ec8b283890", keyword: "gaming keyboard" },
  { name: "Mouse Inalámbrico Ergonómico", desc: "Mouse inalámbrico with sensor preciso, batería de larga duración y diseño ergonómico.", price: 249000, brand: techBrands, imgId: "1527864550417-7fd91fc51a46", keyword: "wireless mouse" },
  { name: "Mouse Gamer 8 Botones", desc: "Mouse alámbrico with sensor óptico de alta precisión, peso ajustable y RGB.", price: 299000, brand: techBrands, imgId: "1615663245857-ac93d440c6c5", keyword: "gaming mouse" },
  { name: "Mousepad XL Gaming 900x400mm", desc: "Mousepad extendido de tela stitched with base antideslizante para teclado + mouse.", price: 99000, brand: techBrands, imgId: "1605773527852-c546a8584ea3", keyword: "mousepad" },
  { name: "Monitor 27\" IPS 144Hz", desc: "Monitor IPS de 27 pulgadas, 144Hz, 1ms MPRT, ideal para trabajo y gaming.", price: 1499000, brand: techBrands, imgId: "1527443224154-c4a3942d3acf", keyword: "monitor" },
  { name: "Monitor 32\" 4K UHD IPS", desc: "Resolución 4K, colores precisos, ideal para diseño, edición y productividad.", price: 2299000, brand: techBrands, imgId: "1593640408182-31c70c8268f5", keyword: "4k monitor" },
  { name: "Auriculares Inalámbricos ANC", desc: "Auriculares with cancelación activa de ruido, 40h de batería y micrófono claro.", price: 799000, brand: techBrands, imgId: "1505740420928-5e560c06d30e", keyword: "headphones" },
  { name: "Auriculares Gamer 7.1 Surround", desc: "Diadema with micrófono unidireccional, sonido envolvente y almohadillas transpirables.", price: 449000, brand: techBrands, imgId: "1583394838336-acd977736f90", keyword: "gaming headset" },
  { name: "Brazo Articulado para Monitor", desc: "Soporte with brazo articulado, gas spring, giro 360° y gestión de cables.", price: 349000, brand: techBrands, imgId: "1616587894289-86480e8466e1", keyword: "monitor arm" },
  { name: "Hub USB-C 7 en 1", desc: "Hub with HDMI 4K, USB 3.0, lector SD/TF, PD 100W y más.", price: 199000, brand: techBrands, imgId: "1625842268584-8f47d38c8f1b", keyword: "usb hub" },
];

const hogarProducts = [
  { name: "Juego de Platos Cerámicos 12 Piezas", desc: "Juego de vajilla cerámica apto para microondas y lavavajillas.", price: 249000, brand: homeBrands, imgId: "1546554137-f86b9593a222", keyword: "dinnerware" },
  { name: "Juego de Vasos Vidrio Templado 6 Piezas", desc: "Vasos resistentes with grosor ideal para uso diario.", price: 79000, brand: homeBrands, imgId: "1514362545857-3bc16c4c7d1b", keyword: "glassware" },
  { name: "Set de Utensilios de Cocina Acero Inoxidable", desc: "Set completo with espátulas, cucharones y pinzas.", price: 149000, brand: homeBrands, imgId: "1556911220-bff31c812dba", keyword: "kitchen utensils" },
  { name: "Guantes Térmicos para Cocina", desc: "Guantes resistentes al calor hasta 250°C with agarre antideslizante.", price: 49000, brand: homeBrands, imgId: "1555939594-58d7cb561ad1", keyword: "oven mitts" },
  { name: "Tabla de Cortar Bambú Grande", desc: "Tabla de bambú orgánico, reversible, ideal para carnes y vegetales.", price: 69000, brand: homeBrands, imgId: "1547592180-85f173990554", keyword: "cutting board" },
  { name: "Sartén Antiadherente 28cm", desc: "Sartén with recubrimiento antiadherente reforzado, apta para todo tipo de cocina.", price: 129000, brand: homeBrands, imgId: "1555939594-58d7cb561ad1", keyword: "frying pan" },
  { name: "Olla de Acero Inoxidable 5L", desc: "Olla with fondo triple para distribución uniforme del calor.", price: 249000, brand: homeBrands, imgId: "1584263347416-43c799a4e9b8", keyword: "cookware" },
  { name: "Tapete Antideslizante Cocina 60x90cm", desc: "Tapete lavable, resistente a manchas y with base antideslizante.", price: 89000, brand: homeBrands, imgId: "1505692794403-34d4982f88aa", keyword: "kitchen mat" },
  { name: "Organizador de Cajones Ajustable", desc: "Separadores modulares para organizar cubiertos y utensilios.", price: 59000, brand: homeBrands, imgId: "1555041469-a586c61ea9bc", keyword: "drawer organizer" },
];

const modaProducts = [
  { name: "Camiseta Algodón Premium Oversize", desc: "Camiseta oversize en algodón peinado, corte relajado y costuras reforzadas.", price: 129000, brand: fashionBrands, imgId: "1521572267360-ee0c2909d518", keyword: "t-shirt" },
  { name: "Hoodie Unisex con Capucha", desc: "Sudadera with capucha en french terry, bolsillos canguro y interior afelpado.", price: 249000, brand: fashionBrands, imgId: "1556821840-3a63f95609a7", keyword: "hoodie" },
  { name: "Jean Slim Fit Tiro Medio", desc: "Jean elástico with lavado medio, tiro medio y corte slim fit.", price: 279000, brand: fashionBrands, imgId: "1544441893-675973e84285", keyword: "jeans" },
  { name: "Chaqueta Bomber Ligera", desc: "Chaqueta bomber with forro ligero, rib en puños y cuello, ideal entretiempo.", price: 349000, brand: fashionBrands, imgId: "1551028719-00167b16eac5", keyword: "bomber jacket" },
  { name: "Zapatillas Urbanas Clásicas", desc: "Zapatillas urbanas en piel sintética with suela de goma y diseño atemporal.", price: 449000, brand: fashionBrands, imgId: "1525966222134-fcfa99b8ae77", keyword: "sneakers" },
  { name: "Bolso Crossbody Minimalista", desc: "Bolso cruzado compacto en cuero vegano with compartimentos internos.", price: 199000, brand: fashionBrands, imgId: "1553062407-98eeb64c6a62", keyword: "crossbody bag" },
  { name: "Mochila Urbana 20L", desc: "Mochila with compartimento para laptop 15\", bolsillo oculto y correas acolchadas.", price: 279000, brand: fashionBrands, imgId: "1491637639811-f02aa04b5c8a", keyword: "backpack" },
  { name: "Gorra Snapback Bordada", desc: "Gorra with visera plana, cierre snapback y bordado minimalista.", price: 79000, brand: fashionBrands, imgId: "1556306535-0f09a537f0a3", keyword: "snapback" },
  { name: "Cinturón de Cuero Minimalista", desc: "Cinturón en cuero vegano with hebilla metálica mate.", price: 69000, brand: fashionBrands, imgId: "1553062407-98eeb64c6a62", keyword: "belt" },
];

const librosProducts = [
  { name: "El Alquimista - Paulo Coelho", desc: "Clásico de la literatura sobre seguir los sueños y escuchar al corazón.", price: 59000, brand: bookBrands, imgId: "1512820790803-83ca734da794", keyword: "book" },
  { name: "Atomic Habits - James Clear", desc: "Guía práctica para crear buenos hábitos y eliminar los malos con cambios pequeños.", price: 89000, brand: bookBrands, imgId: "1495446815901-a7297e633e8d", keyword: "book" },
  { name: "Hábitos Atómicos", desc: "Una de las lecturas más recomendadas sobre productividad y crecimiento personal.", price: 79000, brand: bookBrands, imgId: "1476275466078-4007374efbbe", keyword: "book" },
  { name: "Sapiens: De Animales a Dioses", desc: "Una breve historia de la humanidad, desde los orígenes hasta la era moderna.", price: 99000, brand: bookBrands, imgId: "1532012197267-da84d127e765", keyword: "book" },
  { name: "El Principito - Antoine de Saint-Exupéry", desc: "Obra maestra universal con reflexiones profundas sobre la vida y la amistad.", price: 49000, brand: bookBrands, imgId: "1524578271569-997dde6c1ef2", keyword: "book" },
  { name: "Padre Rico, Padre Pobre - Robert Kiyosaki", desc: "Fundamentos de educación financiera para cambiar tu mentalidad sobre el dinero.", price: 79000, brand: bookBrands, imgId: "1519681393784-d120267933ba", keyword: "book" },
  { name: "Pensar Rápido, Pensar Despacio - Daniel Kahneman", desc: "Cómo tomamos decisiones y los sesgos que nos afectan a diario.", price: 99000, brand: bookBrands, imgId: "1491841651911-c44c30c34548", keyword: "book" },
  { name: "Diseño para El Mundo Real - Victor Papanek", desc: "Referencia obligada para entender diseño with propósito y responsabilidad.", price: 89000, brand: bookBrands, imgId: "1456513080510-7bf3a84b82f8", keyword: "book" },
];

function pickBrand(brands: string[]) {
  return brands[Math.floor(Math.random() * brands.length)];
}

async function main() {
  console.log("Limpiando datos existentes...");
  await prisma.order.deleteMany().catch(() => {});
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany().catch(() => {});

  console.log("Creando categorías...");
  const categoryMap: Record<string, number> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }

  console.log("Generando catálogo realista con 170 productos...");
  const productsToCreate: any[] = [];

  for (let i = 0; i < 40; i++) {
    const base = deportesProducts[i % deportesProducts.length];
    const brand = Array.isArray(base.brand) ? pickBrand(base.brand) : base.brand;
    const price = Math.round((base.price * (0.9 + Math.random() * 0.25)) / 1000) * 1000;
    const isPromoted = i % 6 === 0;
    const originalPrice = isPromoted ? Math.round(price * (1.18 + Math.random() * 0.22)) : null;
    productsToCreate.push({
      name: base.name,
      description: base.desc,
      price,
      originalPrice,
      stock: Math.floor(Math.random() * 35) + 8,
      imageUrl: img(base.keyword, base.imgId),
      isPromoted,
      brand,
      categoryId: categoryMap["deportes"],
    });
  }

  for (let i = 0; i < 40; i++) {
    const base = electronicaProducts[i % electronicaProducts.length];
    const brand = Array.isArray(base.brand) ? pickBrand(base.brand) : base.brand;
    const price = Math.round((base.price * (0.92 + Math.random() * 0.2)) / 1000) * 1000;
    const isPromoted = i % 7 === 0;
    const originalPrice = isPromoted ? Math.round(price * (1.12 + Math.random() * 0.18)) : null;
    productsToCreate.push({
      name: base.name,
      description: base.desc,
      price,
      originalPrice,
      stock: Math.floor(Math.random() * 28) + 6,
      imageUrl: img(base.keyword, base.imgId),
      isPromoted,
      brand,
      categoryId: categoryMap["electronica"],
    });
  }

  for (let i = 0; i < 35; i++) {
    const base = hogarProducts[i % hogarProducts.length];
    const brand = Array.isArray(base.brand) ? pickBrand(base.brand) : base.brand;
    const price = Math.round((base.price * (0.9 + Math.random() * 0.3)) / 1000) * 1000;
    const isPromoted = i % 5 === 0;
    const originalPrice = isPromoted ? Math.round(price * (1.15 + Math.random() * 0.2)) : null;
    productsToCreate.push({
      name: base.name,
      description: base.desc,
      price,
      originalPrice,
      stock: Math.floor(Math.random() * 42) + 10,
      imageUrl: img(base.keyword, base.imgId),
      isPromoted,
      brand,
      categoryId: categoryMap["hogar"],
    });
  }

  for (let i = 0; i < 35; i++) {
    const base = modaProducts[i % modaProducts.length];
    const brand = Array.isArray(base.brand) ? pickBrand(base.brand) : base.brand;
    const price = Math.round((base.price * (0.9 + Math.random() * 0.25)) / 1000) * 1000;
    const isPromoted = i % 4 === 0;
    const originalPrice = isPromoted ? Math.round(price * (1.16 + Math.random() * 0.24)) : null;
    productsToCreate.push({
      name: base.name,
      description: base.desc,
      price,
      originalPrice,
      stock: Math.floor(Math.random() * 38) + 12,
      imageUrl: img(base.keyword, base.imgId),
      isPromoted,
      brand,
      categoryId: categoryMap["moda"],
    });
  }

  for (let i = 0; i < 20; i++) {
    const base = librosProducts[i % librosProducts.length];
    const brand = Array.isArray(base.brand) ? pickBrand(base.brand) : base.brand;
    const price = Math.round((base.price * (0.95 + Math.random() * 0.15)) / 1000) * 1000;
    const isPromoted = i % 8 === 0;
    const originalPrice = isPromoted ? Math.round(price * (1.12 + Math.random() * 0.16)) : null;
    productsToCreate.push({
      name: base.name,
      description: base.desc,
      price,
      originalPrice,
      stock: Math.floor(Math.random() * 55) + 15,
      imageUrl: img(base.keyword, base.imgId),
      isPromoted,
      brand,
      categoryId: categoryMap["libros"],
    });
  }

  for (const prod of productsToCreate) {
    await prisma.product.create({ data: prod });
  }

  console.log(`¡Seed completado! ${categories.length} categorías, ${productsToCreate.length} productos creados con imágenes y nombres coherentes.`);
}

main()
  .catch((e) => {
    console.error("Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
