export interface CouponForm {
  id?: number;
  code: string;
  discount_percentage: string | number;
  used?: number;
  status?: "ACTIVE" | "INACTIVE";
}