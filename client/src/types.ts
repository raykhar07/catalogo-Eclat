export interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  imageUrl: string;
  isPromoted?: boolean;
  brand?: string;
  createdAt: string;
  updatedAt?: string;
  categoryId: number;
  category: Category;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: number;
  originalPrice?: number | null;
  isPromoted?: boolean;
  brand?: string;
}

export interface CategoryInput {
  name: string;
  slug: string;
}

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type AuthErrorDetails = Array<{ campo: string; mensaje: string }>;

export type PaymentMethod = "card" | "nequi" | "pse";

export interface OrderCreateInput {
  productId: number;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  paymentMethod: PaymentMethod;
  nequiPhone?: string;
  pseBank?: string;
  psePersonType?: "natural" | "juridica";
  pseId?: string;
  cardHolder?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export interface OrderResponse {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    total: number;
    quantity: number;
    productId: number;
  };
  message: string;
}

export interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  price: number;
  brand?: string | null;
  stock: number;
  quantity: number;
}

export interface OrderListItem {
  id: number;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerAddress: string;
  buyerCity: string;
  paymentMethod: string;
  cardBrand?: string | null;
  cardLast4?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
    imageUrl: string;
    brand?: string | null;
  };
}

export interface MyOrdersResponse {
  orders: OrderListItem[];
}
