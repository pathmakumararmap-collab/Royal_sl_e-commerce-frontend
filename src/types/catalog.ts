export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  url: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  sku: string;
  barcode: string;
  attributes: Record<string, string>;
  cost_price: number;
  selling_price: number;
  image: string | null;
  is_active: boolean;
  stock_quantity?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  description: string | null;
  short_description: string | null;
  cost_price?: number;
  selling_price: number;
  discount_price: number | null;
  current_price: number;
  tax_rate: number;
  unit: string;
  has_variants: boolean;
  is_active: boolean;
  is_featured: boolean;
  low_stock_threshold: number;
  weight: number | null;
  total_stock?: number;
  rating_average?: number;
  reviews_count?: number;
  category?: Category;
  brand?: Brand;
  variants?: ProductVariant[];
  images?: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductReview {
  id: number;
  product_id: number;
  reviewer_name?: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: "pending" | "approved" | "rejected";
  images?: { id: number; url: string }[];
  is_mine?: boolean;
  created_at: string;
}

export interface FlashSaleProduct extends Product {
  flash_sale_price: number;
  flash_sale_discount_percent: number;
}

export interface FlashSaleResponse {
  ends_at: string | null;
  products: FlashSaleProduct[];
}

export interface ProductFilters {
  keyword?: string;
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  is_active?: boolean;
  is_featured?: boolean;
  sort?: "latest" | "price_asc" | "price_desc" | "name";
  per_page?: number;
  page?: number;
}

export interface ProductInput {
  category_id: number;
  brand_id?: number | null;
  supplier_id?: number | null;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  short_description?: string;
  cost_price: number;
  selling_price: number;
  discount_price?: number | null;
  tax_rate?: number;
  unit?: string;
  has_variants?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  low_stock_threshold?: number;
  weight?: number;
  meta_title?: string;
  meta_description?: string;
}
