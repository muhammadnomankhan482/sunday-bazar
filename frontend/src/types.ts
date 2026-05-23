export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  isLoggedIn: boolean;
  createdAt: string;
}

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number | string;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: Review[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  thumbnail: string;
  images: string[];
  category: string;
  
  // Custom OLX Fields
  isLocal?: boolean; // True for ads created by user in UI
  location?: string;
  createdAt?: string;
  sellerName?: string;
  sellerPhone?: string;
  likesCount?: number;
  ownerId?: string;
}

export interface CategoryItem {
  slug: string;
  name: string;
  icon: string;
}
