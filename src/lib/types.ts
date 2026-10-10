export type ProductOption = { name: string; values: string[] };

// Card shape (listings, chat, AI tools).
export type Product = {
  id: string;
  title: string;
  name: string;
  handle: string;
  slug: string;
  vendor: string;
  brand: string;
  productType: string;
  category: string;
  tags: string[];
  image: string;
  price: number;
  priceMax: number;
  compareAtPrice: number | null;
  rating: number;
  ratingCount: number;
  inStock: boolean;
  totalInventory: number;
  options: ProductOption[];
  colors: string[];
  variantCount: number;
  defaultVariantId: string;
  reason?: string;
};

export type Variant = {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  options: Record<string, string>;
  available: boolean;
  inventoryQuantity: number;
  inventoryPolicy: 'deny' | 'continue';
  weight: number;
  weightUnit: string;
  weightGrams: number;
  image: string | null;
};

export type ProductDetail = Product & {
  description: string;
  status: 'active' | 'draft' | 'archived';
  images: { id: string; url: string; alt: string }[];
  variants: Variant[];
  metafields: { namespace: string; key: string; type: string; value: string }[];
  specs: Record<string, string>;
  seo: { title?: string; description?: string };
  collections: { id: string; handle?: string; title?: string }[];
  reviews?: { rating: number; comment: string; createdAt: string }[];
};

export type SearchResult = {
  products: Product[];
  total: number;
  page: number;
  pages: number;
  relaxed?: { field: string; value: string; note: string }[];
};

export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  image: string;
  featured: boolean;
  position: number;
  sortOrder: string;
  productCount?: number;
};

export type Facets = {
  categories: { name: string; path: string; count: number; minPrice: number; image?: string }[];
  productTypes: { name: string; count: number }[];
  vendors: { name: string; count: number }[];
  collections: Collection[];
  tags: { name: string; count: number }[];
  options: Record<string, { value: string; count: number }[]>;
  price: { min: number; max: number };
};

export type Link = { label: string; url: string };
export type StoreSettings = {
  name: string;
  tagline: string;
  announcement: string;
  supportEmail: string;
  currency: string;
  freeShippingOver: number;
  shippingFee: number;
  paymentMethods: { id: string; label: string }[];
  navigation: Link[];
  footer: { title: string; links: Link[] }[];
  homeSections: { type: 'categories' | 'collection' | 'deals'; title?: string; collectionHandle?: string; limit?: number; tone?: string }[];
  trustBadges: { icon: string; text: string }[];
};

export type CartLine = { lineId: string; product: Product; variant: Variant; quantity: number; unitPrice: number; lineTotal: number };
export type Cart = {
  items: CartLine[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  weightGrams: number;
  currency: string;
  freeShippingOver: number;
};

export type Order = {
  orderNumber: string;
  status: string;
  items: { productId: string; variantId: string | null; name: string; variantTitle: string | null; sku: string | null; image: string; price: number; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: { name: string; city: string; state: string; postalCode: string };
  timeline: { status: string; note?: string; at: string }[];
  createdAt: string;
  email?: string;
};

export type User = { id: string; name: string; username: string | null; email: string; role: 'customer' | 'admin'; avatarUrl?: string | null; providers?: string[] };

