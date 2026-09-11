export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  gender?: string;
  profile_image?: string;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
password?: string;
  total_orders: number;
  total_spent: string;

  last_order: string | null;
  payment_status: "PAID" | "PENDING" | "REFUNDED" | null;
  order_status:
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | null;
}