export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface SizePackageInfo {
  size: string;
  units: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  size: string;
  sizeOptions?: string[];
  sizePackageInfo?: SizePackageInfo[];
  sizeInventory?: Array<{ size: string; stock: number }>;
  sortOrder?: number;
  brand: string;
  pack: string;
  stock: number;
  categoryId: string;
  image: string;
  featured?: boolean;
  isNew?: boolean;
  onSale?: boolean;
  tags: string[];
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
}

export type OrderStatus =
  | "Nuevo"
  | "Confirmado"
  | "En preparación"
  | "En camino"
  | "Entregado";

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  branch: string;
  address: string;
  notes?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  hours: string;
  phones: string[];
}

export interface HeroBanner {
  title: string;
  subtitle: string;
  highlight: string;
  ctaText: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
}

export interface BusinessSettings {
  businessName: string;
  email: string;
  whatsappNumbers: string[];
  socialLinks: SocialLinks;
  branches: Branch[];
  trustMessages: string[];
  heroBanner: HeroBanner;
}

export interface SiteData {
  products: Product[];
  categories: Category[];
  orders: Order[];
  settings: BusinessSettings;
}

export interface CartItem {
  productId: string;
  quantity: number;
  selectedSize: string;
}
