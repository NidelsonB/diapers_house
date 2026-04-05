import { BusinessSettings, Category, Order, Product, SiteData } from "@/types/site";

export const seedCategories: Category[] = [
  {
    id: "cat-rn",
    name: "Recién nacido",
    slug: "recien-nacido",
    description: "Pañales suaves para los primeros días del bebé.",
    icon: "👶",
  },
  {
    id: "cat-daily",
    name: "Uso diario",
    slug: "uso-diario",
    description: "Opciones cómodas y absorbentes para cada etapa.",
    icon: "🍼",
  },
  {
    id: "cat-pants",
    name: "Pants entrenamiento",
    slug: "pants-entrenamiento",
    description: "Mayor libertad para bebés activos y en transición.",
    icon: "🌟",
  },
  {
    id: "cat-care",
    name: "Cuidado e higiene",
    slug: "cuidado-e-higiene",
    description: "Toallitas y complementos esenciales para el hogar.",
    icon: "✨",
  },
];

export const seedProducts: Product[] = [
  {
    id: "prod-001",
    slug: "pampers-premium-care-rn",
    name: "Pampers Premium Care RN x36",
    description:
      "Suavidad premium y ajuste delicado para recién nacidos con indicador de humedad.",
    price: 9.5,
    size: "RN",
    brand: "Pampers",
    pack: "36 unidades",
    stock: 18,
    categoryId: "cat-rn",
    image: "/products/premium-care-rn.svg",
    featured: true,
    isNew: true,
    tags: ["suavidad", "recién nacido", "premium"],
  },
  {
    id: "prod-002",
    slug: "huggies-active-sec-m",
    name: "Huggies Active Sec M x50",
    description:
      "Absorción confiable y ajuste anatómico para uso diario en casa o paseo.",
    price: 14.99,
    size: "M",
    brand: "Huggies",
    pack: "50 unidades",
    stock: 27,
    categoryId: "cat-daily",
    image: "/products/active-sec-m.svg",
    featured: true,
    tags: ["uso diario", "absorción", "comodidad"],
  },
  {
    id: "prod-003",
    slug: "babysec-ultra-jumbo-g",
    name: "Babysec Ultra Jumbo G x68",
    description:
      "Pack ahorrador para familias que buscan rendimiento y protección prolongada.",
    price: 18.75,
    originalPrice: 21.5,
    size: "G",
    brand: "Babysec",
    pack: "68 unidades",
    stock: 14,
    categoryId: "cat-daily",
    image: "/products/babysec-jumbo-g.svg",
    onSale: true,
    tags: ["ahorro", "jumbo", "oferta"],
  },
  {
    id: "prod-004",
    slug: "pampers-pants-xxg",
    name: "Pampers Pants XXG x46",
    description:
      "Formato pants ideal para bebés activos; fácil de poner y quitar.",
    price: 20.25,
    size: "XXG",
    brand: "Pampers",
    pack: "46 unidades",
    stock: 20,
    categoryId: "cat-pants",
    image: "/products/pants-xxg.svg",
    featured: true,
    tags: ["pants", "movilidad", "etapa activa"],
  },
  {
    id: "prod-005",
    slug: "toallitas-pure-care-x100",
    name: "Toallitas Pure Care x100",
    description:
      "Toallitas húmedas hipoalergénicas para limpieza suave diaria.",
    price: 3.99,
    size: "Única",
    brand: "Pure Care",
    pack: "100 unidades",
    stock: 42,
    categoryId: "cat-care",
    image: "/products/wipes-pure.svg",
    isNew: true,
    tags: ["toallitas", "higiene", "hipoalergénico"],
  },
  {
    id: "prod-006",
    slug: "huggies-nocturno-xxg",
    name: "Huggies Nocturno XXG x40",
    description:
      "Protección extra durante la noche con absorción reforzada y mayor comodidad.",
    price: 16.75,
    originalPrice: 18.9,
    size: "XXG",
    brand: "Huggies",
    pack: "40 unidades",
    stock: 11,
    categoryId: "cat-daily",
    image: "/products/nocturno-xxg.svg",
    onSale: true,
    tags: ["noche", "extra absorción", "oferta"],
  },
  {
    id: "prod-007",
    slug: "canbebe-economy-pack-xl",
    name: "Canbebe Economy Pack XL x54",
    description:
      "Excelente relación precio-calidad para mantener el stock del hogar.",
    price: 15.4,
    size: "XL",
    brand: "Canbebe",
    pack: "54 unidades",
    stock: 22,
    categoryId: "cat-daily",
    image: "/products/economy-pack-xl.svg",
    tags: ["económico", "pack familiar", "uso diario"],
  },
  {
    id: "prod-008",
    slug: "babysec-training-pants-l",
    name: "Babysec Training Pants L x38",
    description:
      "Pants cómodos para acompañar la etapa de aprendizaje con libertad de movimiento.",
    price: 17.2,
    size: "L",
    brand: "Babysec",
    pack: "38 unidades",
    stock: 16,
    categoryId: "cat-pants",
    image: "/products/training-pants-l.svg",
    featured: true,
    tags: ["training", "pants", "comodidad"],
  },
];

export const seedSettings: BusinessSettings = {
  businessName: "La Casa del Pañal",
  email: "info@lacasadelpañal.com",
  whatsappNumbers: ["7726-4949", "7888-4198"],
  socialLinks: {
    instagram: "https://www.instagram.com/lacasadelpamper/?hl=es",
    facebook: "https://www.facebook.com/lacasadelpampersv?locale=es_LA",
  },
  trustMessages: [
    "Entrega rápida",
    "Precios competitivos",
    "Atención personalizada",
    "Productos originales",
  ],
  heroBanner: {
    title: "Todo lo que tu bebé necesita, en un solo lugar",
    subtitle:
      "Compra pañales y productos esenciales con una experiencia rápida, confiable y pensada para familias modernas en El Salvador.",
    highlight: "Ofertas semanales y atención personalizada",
    ctaText: "Comprar ahora",
  },
  branches: [
    {
      id: "branch-1",
      name: "Sucursal Centro",
      address: "San Salvador, zona centro · ubicación editable desde el panel",
      hours: "Lun-Sáb · 8:00 a.m. - 6:00 p.m.",
      phones: ["7726-4949"],
    },
    {
      id: "branch-2",
      name: "Sucursal Escalón",
      address: "Colonia Escalón · dirección editable para tu presentación",
      hours: "Lun-Dom · 9:00 a.m. - 7:00 p.m.",
      phones: ["7888-4198"],
    },
    {
      id: "branch-3",
      name: "Sucursal Santa Ana",
      address: "Sucursal demostrativa para futuras ubicaciones",
      hours: "Lun-Sáb · 8:30 a.m. - 5:30 p.m.",
      phones: ["7726-4949", "7888-4198"],
    },
  ],
};

export const seedOrders: Order[] = [
  {
    id: "ORD-1001",
    customerName: "María López",
    phone: "7726-4949",
    branch: "Sucursal Centro",
    address: "Residencial Las Flores, San Salvador",
    notes: "Entregar después de las 3:00 p.m.",
    total: 29.48,
    status: "En preparación",
    createdAt: "2026-04-03T10:30:00.000Z",
    items: [
      {
        productId: "prod-002",
        name: "Huggies Active Sec M x50",
        quantity: 1,
        price: 14.99,
      },
      {
        productId: "prod-005",
        name: "Toallitas Pure Care x100",
        quantity: 2,
        price: 3.99,
      },
      {
        productId: "prod-001",
        name: "Pampers Premium Care RN x36",
        quantity: 1,
        price: 9.5,
      },
    ],
  },
  {
    id: "ORD-1002",
    customerName: "Andrea Hernández",
    phone: "7888-4198",
    branch: "Sucursal Escalón",
    address: "Entrega en mostrador",
    notes: "Recogerá personalmente",
    total: 20.25,
    status: "Confirmado",
    createdAt: "2026-04-04T14:45:00.000Z",
    items: [
      {
        productId: "prod-004",
        name: "Pampers Pants XXG x46",
        quantity: 1,
        price: 20.25,
      },
    ],
  },
];

export const defaultAdmin = {
  email: "admin@lacasadelpanal.com",
  password: "Admin123*",
};

export const createSeedData = (): SiteData => ({
  products: JSON.parse(JSON.stringify(seedProducts)),
  categories: JSON.parse(JSON.stringify(seedCategories)),
  orders: JSON.parse(JSON.stringify(seedOrders)),
  settings: JSON.parse(JSON.stringify(seedSettings)),
});
