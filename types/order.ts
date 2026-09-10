export type PaymentStatus = "PAID" | "PENDING" | "REFUNDED";

export type OrderStatus =
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: number;
  order_no: string;
  user_id: number;

  customer_name: string;
  email: string | null;
  phone: string | null;

  subtotal: string;
  shipping: string;
  discount: string;
  total: string;

  payment_status: PaymentStatus;
  order_status: OrderStatus;

  ordered_at: string;
  created_at: string;

  total_products: 3;
  total_qty: string;
  items_total: string;
}


export interface Product {
  name: string;
  sku: string | null;
  price: number;
  status?: string;
}

export interface OrderProduct {
  order_item_id: number;
  order_id: number;
  product_id: number;
  qty: number;
  price: number;
  subtotal: number;
  product: Product;
  status?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

export interface Customer {
  id: number;
    name: string;
    email: string | null;
    phone: string | null;
}

export interface OrderDetails {
  order: {
    id: number;
    order_no: string;
    user_id: number;
    subtotal: number;
    shipping_rate: number;
    coupon_discount: string;
    discount: number;
    total: number;
    shipping_address: string;
    payment_status: string;
    order_status: string;
    ordered_at: string | null;
    created_at: string;
    delivery_option?: string;
  };

  customer: Customer;

  products: OrderProduct[];
  shippingAddress?: ShippingAddress;
}

export interface Address {
  id: number;
  label: string;
  name: string;
  address: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  zip: string | null;
  is_default: boolean;
}
export interface ShippingRate {
  id: number;
  name: string;
  rate: number;
  status: "ACTIVE" | "INACTIVE";
  created_at?: string;
  updated_at?: string;
}

export type DeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "PREPARING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN"
  | "FAILED";
export interface Delivery {
  id: number;
  order_id: number;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  shipping_rate: number;
  total: number;
  shipping_location: string | null;
  courier_company: string | null;
  delivery_date: string | null;
  status: string;
  payment_status: string;
  order_status: DeliveryStatus;
  delivery_status: string;
  shipping_address?: string | null;
  created_at: string;
  updated_at: string;
}