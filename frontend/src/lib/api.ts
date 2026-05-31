/**
 * api.ts — Centralized Axios API Client
 * Har request ke saath JWT token automatically attach hota hai.
 * Backend: Node.js + Express + JWT (file-based storage)
 */

import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Axios instance with base URL
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Har outgoing request se pehle localStorage se JWT token uthao aur header mein daal do
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sb_jwt_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// 401 aaye toh token clear karo (expired/invalid)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb_jwt_token');
        localStorage.removeItem('sb_current_user');
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  username: string; // backend expects 'username' not 'name'
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id?: string | number;
    name?: string;
    email?: string;
    phone?: string;
  };
  // Some backends return user info at top level
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
}

/** POST /register */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/register', payload);
  return data;
}

/** POST /login — returns JWT token */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/login', payload);
  return data;
}

// ─── Products API ─────────────────────────────────────────────────────────────

export interface BackendProduct {
  id?: string | number;
  _id?: string;
  title: string;
  description: string;
  price: number;
  category?: string;
  brand?: string;
  thumbnail?: string;
  images?: string[];
  rating?: number;
  stock?: number;
  discountPercentage?: number;
  tags?: string[];
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: any[];
  // Custom fields
  location?: string;
  sellerName?: string;
  sellerPhone?: string;
  likesCount?: number;
  isLocal?: boolean;
  ownerId?: string;
  createdAt?: string;
}

/** GET /products — saare products lao */
export async function fetchProducts(): Promise<BackendProduct[]> {
  const { data } = await apiClient.get<BackendProduct[] | { products: BackendProduct[] }>('/products');
  // Backend { limit, page, products: [] } format return karta hai
  if (Array.isArray(data)) return data;
  if (data && Array.isArray((data as any).products)) return (data as any).products;
  return [];
}

/** POST /products — naya product add karo (JWT required) */
export async function createProduct(payload: Partial<BackendProduct>): Promise<BackendProduct> {
  const { data } = await apiClient.post<BackendProduct>('/products', payload);
  return data;
}

// ─── Token Helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sb_jwt_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sb_jwt_token');
  }
  return null;
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sb_jwt_token');
    localStorage.removeItem('sb_current_user');
  }
}

export default apiClient;
