export interface ProductSize {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  sizes: ProductSize[];
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  role: 'user' | 'admin';
}

export interface CartItem {
  id: string;
  name: string;
  category: string;
  image: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  name?: string;
  items: CartItem[];
  total: number;
  totalPrice?: number;
  address: string;
  city?: string;
  pincode?: string;
  phone: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: any;
}
