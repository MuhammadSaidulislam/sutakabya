import { ProductImage } from "@/types/imageProps";

export type Category = {
  id: string;
  name: string;
  description: string;
  productCount: number;
  color: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  images: ProductImage[];
  thumbnail: string;
  category_name?: string; // Optional property to hold the category name
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  joinedDate: string;
  avatarColor: "blush" | "sage" | "honey" | "sky";
};

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  customerId: string;
  customer: string;
  mobile: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment: "Paid" | "Pending" | "Refunded";
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
  shippingAddress: string;
};

export type Delivery = {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  courier: string;
  eta: string;
  status: "Preparing" | "In Transit" | "Out for Delivery" | "Delivered" | "Delayed";
  progress: number;
};

export type Review = {
  id: string;
  productId: string;
  productName: string;
  customer: string;
  mobile: string;
  rating: number;
  comment: string;
  date: string;
  status: "Published" | "Pending" | "Hidden";
};

export type Coupon = {
  id: string;
  code: string;
  type: "Percentage" | "Fixed Amount";
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Expired";
};

export type Campaign = {
  id: string;
  name: string;
  channel: "Email" | "Storefront Banner" | "SMS" | "Social Media";
  discount: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Ended";
  description: string;
  reach: number;
};

export const categories: Category[] = [
  { id: "CAT-01", name: "Baby Feeding", description: "Bottles, bibs, weaning sets", productCount: 42, color: "blush" },
  { id: "CAT-02", name: "Diapering", description: "Diapers, wipes, changing mats", productCount: 36, color: "sage" },
  { id: "CAT-03", name: "Maternity Wear", description: "Nursing tops, maternity dresses", productCount: 58, color: "honey" },
  { id: "CAT-04", name: "Nursery", description: "Cribs, bedding, mobiles", productCount: 24, color: "sky" },
  { id: "CAT-05", name: "Baby Gear", description: "Strollers, car seats, carriers", productCount: 19, color: "blush" },
  { id: "CAT-06", name: "Toys & Play", description: "Soft toys, rattles, activity gyms", productCount: 63, color: "sage" },
  { id: "CAT-07", name: "Bath & Skincare", description: "Baby wash, lotion, bath tubs", productCount: 31, color: "honey" },
  { id: "CAT-08", name: "Health & Safety", description: "Monitors, thermometers, gates", productCount: 15, color: "sky" },
];

export const products: Product[] = [
  { id: "P-1001", name: "Soft Silicone Baby Bottle 240ml", category: "Baby Feeding", description: "A soft silicone baby bottle for safe feeding", price: 12.99, stock: 128, status: "In Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🍼" },
  { id: "P-1002", name: "Organic Cotton Muslin Swaddle (3-pack)", category: "Nursery", description: "A set of three organic cotton muslin swaddles for your baby", price: 24.5, stock: 8, status: "Low Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }],  thumbnail: "🧵" },
  { id: "P-1003", name: "Overnight Diapers Size 3 (44ct)", category: "Diapering", description: "Long-lasting overnight diapers for better sleep", price: 18.75, stock: 0,status: "Out of Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🧷" },
  { id: "P-1004", name: "Nursing-Friendly Wrap Dress", category: "Maternity Wear", description: "Comfortable and functional nursing wrap dress", price: 39.0, stock: 54, status: "In Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }],  thumbnail: "👗" },
  { id: "P-1005", name: "3-in-1 Convertible Stroller", category: "Baby Gear", description: "A versatile stroller that grows with your child", price: 189.99, stock: 12,status: "In Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🛒" },
  { id: "P-1006", name: "Plush Elephant Rattle Toy", category: "Toys & Play", description: "A soft and cuddly elephant rattle for little hands", price: 9.49, stock: 5, status: "Low Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🧸" },
  { id: "P-1007", name: "Tear-Free Baby Shampoo 400ml", category: "Bath & Skincare", description: "A gentle shampoo for your baby's sensitive skin", price: 8.25, stock: 76,status: "In Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🧴" },
  { id: "P-1008", name: "Smart Video Baby Monitor", category: "Health & Safety", description: "A high-definition baby monitor with two-way audio", price: 79.99, stock: 3, status: "Low Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "📺" },
  { id: "P-1009", name: "Adjustable Baby Carrier Wrap", category: "Baby Gear", description: "A comfortable and adjustable baby carrier for on-the-go parents", price: 45.0, stock: 21, status: "In Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🎒" },
  { id: "P-1010", name: "Maternity Support Belt", category: "Maternity Wear", description: "A supportive belt to help alleviate back pain during pregnancy", price: 22.3, stock: 0, status: "Out of Stock", images: [ {"image_url": "/uploads/image2.jpg", "is_thumbnail": false }], thumbnail: "🩱" },
];

export const customers: Customer[] = [
  { id: "CUS-01", name: "Amina Rahman", mobile: "+880 1711-223344", email: "amina.rahman@example.com", address: "Flat 3B, Dhanmondi 27, Dhaka", joinedDate: "2025-11-02", avatarColor: "blush" },
  { id: "CUS-02", name: "Sarah Chen", mobile: "+1 512-555-0182", email: "sarah.chen@example.com", address: "22 Elm Street, Austin, TX", joinedDate: "2025-09-14", avatarColor: "sky" },
  { id: "CUS-03", name: "Fatima Islam", mobile: "+44 7700 900123", email: "fatima.islam@example.com", address: "56 Baker Street, London", joinedDate: "2026-01-20", avatarColor: "sage" },
  { id: "CUS-04", name: "Laila Ahmed", mobile: "+880 1812-334455", email: "laila.ahmed@example.com", address: "House 8, Road 2, Mirpur, Dhaka", joinedDate: "2025-12-05", avatarColor: "honey" },
  { id: "CUS-05", name: "Nusrat Jahan", mobile: "+880 1913-445566", email: "nusrat.jahan@example.com", address: "House 9, Uttara Sector 7, Dhaka", joinedDate: "2026-02-11", avatarColor: "sky" },
  { id: "CUS-06", name: "Priya Sharma", mobile: "+91 98765 43210", email: "priya.sharma@example.com", address: "14 MG Road, Bengaluru", joinedDate: "2025-10-29", avatarColor: "blush" },
  { id: "CUS-07", name: "Rebecca Lopez", mobile: "+1 415-555-0143", email: "rebecca.lopez@example.com", address: "9 Pine Ave, San Jose, CA", joinedDate: "2026-03-03", avatarColor: "sage" },
  { id: "CUS-08", name: "Tania Karim", mobile: "+880 1611-556677", email: "tania.karim@example.com", address: "House 5, Gulshan-2, Dhaka", joinedDate: "2025-08-19", avatarColor: "honey" },
];

export const orders: Order[] = [
  {
    id: "#ORD-8291", customerId: "CUS-01", customer: "Amina Rahman", mobile: "+880 1711-223344", date: "2026-07-10",
    items: [
      { productId: "P-1001", name: "Soft Silicone Baby Bottle 240ml", image: "🍼", qty: 2, price: 12.99 },
      { productId: "P-1007", name: "Tear-Free Baby Shampoo 400ml", image: "🧴", qty: 1, price: 8.25 },
      { productId: "P-1006", name: "Plush Elephant Rattle Toy", image: "🧸", qty: 3, price: 9.49 },
    ],
    subtotal: 62.7, shipping: 3.5, discount: 1.72, total: 64.48, payment: "Paid", status: "Processing",
    shippingAddress: "Flat 3B, Dhanmondi 27, Dhaka",
  },
  {
    id: "#ORD-8290", customerId: "CUS-02", customer: "Sarah Chen", mobile: "+1 512-555-0182", date: "2026-07-10",
    items: [{ productId: "P-1005", name: "3-in-1 Convertible Stroller", image: "🛒", qty: 1, price: 189.99 }],
    subtotal: 189.99, shipping: 0, discount: 0, total: 189.99, payment: "Paid", status: "Shipped",
    shippingAddress: "22 Elm Street, Austin, TX",
  },
  {
    id: "#ORD-8289", customerId: "CUS-03", customer: "Fatima Islam", mobile: "+44 7700 900123", date: "2026-07-09",
    items: [
      { productId: "P-1003", name: "Overnight Diapers Size 3 (44ct)", image: "🧷", qty: 2, price: 18.75 },
      { productId: "P-1010", name: "Maternity Support Belt", image: "🩱", qty: 1, price: 22.3 },
      { productId: "P-1009", name: "Adjustable Baby Carrier Wrap", image: "🎒", qty: 1, price: 45.0 },
      { productId: "P-1006", name: "Plush Elephant Rattle Toy", image: "🧸", qty: 1, price: 9.49 },
    ],
    subtotal: 114.29, shipping: 4.5, discount: 6.59, total: 112.2, payment: "Pending", status: "Processing",
    shippingAddress: "56 Baker Street, London",
  },
  {
    id: "#ORD-8288", customerId: "CUS-04", customer: "Laila Ahmed", mobile: "+880 1812-334455", date: "2026-07-09",
    items: [
      { productId: "P-1007", name: "Tear-Free Baby Shampoo 400ml", image: "🧴", qty: 2, price: 8.25 },
      { productId: "P-1002", name: "Organic Cotton Muslin Swaddle (3-pack)", image: "🧵", qty: 1, price: 24.5 },
    ],
    subtotal: 41.0, shipping: 3.5, discount: 11.26, total: 33.24, payment: "Paid", status: "Delivered",
    shippingAddress: "House 8, Road 2, Mirpur, Dhaka",
  },
  {
    id: "#ORD-8287", customerId: "CUS-05", customer: "Nusrat Jahan", mobile: "+880 1913-445566", date: "2026-07-08",
    items: [
      { productId: "P-1004", name: "Nursing-Friendly Wrap Dress", image: "👗", qty: 2, price: 39.0 },
      { productId: "P-1007", name: "Tear-Free Baby Shampoo 400ml", image: "🧴", qty: 1, price: 8.25 },
    ],
    subtotal: 86.0, shipping: 3.5, discount: 1.0, total: 88.5, payment: "Paid", status: "Delivered",
    shippingAddress: "House 9, Uttara Sector 7, Dhaka",
  },
  {
    id: "#ORD-8286", customerId: "CUS-06", customer: "Priya Sharma", mobile: "+91 98765 43210", date: "2026-07-08",
    items: [{ productId: "P-1008", name: "Smart Video Baby Monitor", image: "📺", qty: 1, price: 79.99 }],
    subtotal: 79.99, shipping: 0, discount: 0, total: 79.99, payment: "Refunded", status: "Cancelled",
    shippingAddress: "14 MG Road, Bengaluru",
  },
  {
    id: "#ORD-8285", customerId: "CUS-07", customer: "Rebecca Lopez", mobile: "+1 415-555-0143", date: "2026-07-07",
    items: [
      { productId: "P-1001", name: "Soft Silicone Baby Bottle 240ml", image: "🍼", qty: 2, price: 12.99 },
      { productId: "P-1007", name: "Tear-Free Baby Shampoo 400ml", image: "🧴", qty: 1, price: 8.25 },
      { productId: "P-1006", name: "Plush Elephant Rattle Toy", image: "🧸", qty: 2, price: 9.49 },
    ],
    subtotal: 53.21, shipping: 3.5, discount: 8.96, total: 47.75, payment: "Paid", status: "Shipped",
    shippingAddress: "9 Pine Ave, San Jose, CA",
  },
  {
    id: "#ORD-8284", customerId: "CUS-08", customer: "Tania Karim", mobile: "+880 1611-556677", date: "2026-07-07",
    items: [
      { productId: "P-1005", name: "3-in-1 Convertible Stroller", image: "🛒", qty: 1, price: 189.99 },
      { productId: "P-1006", name: "Plush Elephant Rattle Toy", image: "🧸", qty: 2, price: 9.49 },
    ],
    subtotal: 208.97, shipping: 0, discount: 65.37, total: 143.6, payment: "Paid", status: "Delivered",
    shippingAddress: "House 5, Gulshan-2, Dhaka",
  },
  {
    id: "#ORD-8283", customerId: "CUS-01", customer: "Amina Rahman", mobile: "+880 1711-223344", date: "2026-06-28",
    items: [
      { productId: "P-1002", name: "Organic Cotton Muslin Swaddle (3-pack)", image: "🧵", qty: 1, price: 24.5 },
      { productId: "P-1003", name: "Overnight Diapers Size 3 (44ct)", image: "🧷", qty: 2, price: 18.75 },
    ],
    subtotal: 62.0, shipping: 3.5, discount: 0, total: 65.5, payment: "Paid", status: "Delivered",
    shippingAddress: "Flat 3B, Dhanmondi 27, Dhaka",
  },
  {
    id: "#ORD-8279", customerId: "CUS-01", customer: "Amina Rahman", mobile: "+880 1711-223344", date: "2026-06-11",
    items: [{ productId: "P-1009", name: "Adjustable Baby Carrier Wrap", image: "🎒", qty: 1, price: 45.0 }],
    subtotal: 45.0, shipping: 3.5, discount: 0, total: 48.5, payment: "Paid", status: "Delivered",
    shippingAddress: "Flat 3B, Dhanmondi 27, Dhaka",
  },
  {
    id: "#ORD-8260", customerId: "CUS-08", customer: "Tania Karim", mobile: "+880 1611-556677", date: "2026-05-30",
    items: [
      { productId: "P-1001", name: "Soft Silicone Baby Bottle 240ml", image: "🍼", qty: 4, price: 12.99 },
      { productId: "P-1007", name: "Tear-Free Baby Shampoo 400ml", image: "🧴", qty: 2, price: 8.25 },
    ],
    subtotal: 68.46, shipping: 3.5, discount: 0, total: 71.96, payment: "Paid", status: "Delivered",
    shippingAddress: "House 5, Gulshan-2, Dhaka",
  },
];

export const deliveries: Delivery[] = [
  { id: "DL-501", orderId: "#ORD-8290", customer: "Sarah Chen", address: "22 Elm Street, Austin, TX", courier: "FedEx", eta: "Today, 6:00 PM", status: "Out for Delivery", progress: 80 },
  { id: "DL-502", orderId: "#ORD-8285", customer: "Rebecca Lopez", address: "9 Pine Ave, San Jose, CA", courier: "FedEx", eta: "Jul 12, 2026", status: "In Transit", progress: 55 },
  { id: "DL-503", orderId: "#ORD-8284", customer: "Tania Karim", address: "House 5, Gulshan-2, Dhaka", courier: "Sundarban Courier", eta: "Delivered Jul 9", status: "Delivered", progress: 100 },
  { id: "DL-504", orderId: "#ORD-8291", customer: "Amina Rahman", address: "Flat 3B, Dhanmondi 27, Dhaka", courier: "RedX", eta: "Preparing", status: "Preparing", progress: 15 },
  { id: "DL-505", orderId: "#ORD-8287", customer: "Nusrat Jahan", address: "House 9, Uttara Sector 7, Dhaka", courier: "Pathao Courier", eta: "Delivered Jul 8", status: "Delivered", progress: 100 },
  { id: "DL-506", orderId: "#ORD-8289", customer: "Fatima Islam", address: "56 Baker Street, London", courier: "DHL", eta: "Delayed — new ETA Jul 14", status: "Delayed", progress: 40 },
];

export const reviews: Review[] = [
  { id: "REV-01", productId: "P-1001", productName: "Soft Silicone Baby Bottle 240ml", customer: "Amina Rahman", mobile: "+880 1711-223344", rating: 5, comment: "My baby loves this bottle, no colic issues at all. Great flow control.", date: "2026-07-05", status: "Published" },
  { id: "REV-02", productId: "P-1005", productName: "3-in-1 Convertible Stroller", customer: "Sarah Chen", mobile: "+1 512-555-0182", rating: 4, comment: "Sturdy and easy to fold, though a bit heavy to carry upstairs.", date: "2026-07-03", status: "Published" },
  { id: "REV-03", productId: "P-1002", productName: "Organic Cotton Muslin Swaddle (3-pack)", customer: "Laila Ahmed", mobile: "+880 1812-334455", rating: 5, comment: "Super soft fabric and breathable, perfect for the summer heat.", date: "2026-07-01", status: "Published" },
  { id: "REV-04", productId: "P-1008", productName: "Smart Video Baby Monitor", customer: "Priya Sharma", mobile: "+91 98765 43210", rating: 2, comment: "App keeps disconnecting from WiFi, needs a firmware fix.", date: "2026-06-29", status: "Pending" },
  { id: "REV-05", productId: "P-1006", productName: "Plush Elephant Rattle Toy", customer: "Fatima Islam", mobile: "+44 7700 900123", rating: 5, comment: "Adorable and machine washable — exactly what we needed.", date: "2026-06-27", status: "Published" },
  { id: "REV-06", productId: "P-1010", productName: "Maternity Support Belt", customer: "Nusrat Jahan", mobile: "+880 1913-445566", rating: 3, comment: "Decent support but the velcro wore out after a month.", date: "2026-06-22", status: "Pending" },
  { id: "REV-07", productId: "P-1009", productName: "Adjustable Baby Carrier Wrap", customer: "Tania Karim", mobile: "+880 1611-556677", rating: 1, comment: "Flagged for spam links and removed from the storefront.", date: "2026-06-18", status: "Hidden" },
  { id: "REV-08", productId: "P-1007", productName: "Tear-Free Baby Shampoo 400ml", customer: "Rebecca Lopez", mobile: "+1 415-555-0143", rating: 4, comment: "Smells lovely and truly tear-free during bath time.", date: "2026-06-14", status: "Published" },
];

export const coupons: Coupon[] = [
  { id: "CPN-01", code: "WELCOME10", type: "Percentage", value: 10, minOrder: 20, usageLimit: 500, used: 318, startDate: "2026-06-01", endDate: "2026-08-31", status: "Active" },
  { id: "CPN-02", code: "FREESHIP", type: "Fixed Amount", value: 3.5, minOrder: 30, usageLimit: 1000, used: 642, startDate: "2026-05-01", endDate: "2026-07-31", status: "Active" },
  { id: "CPN-03", code: "EIDSALE25", type: "Percentage", value: 25, minOrder: 50, usageLimit: 300, used: 300, startDate: "2026-03-15", endDate: "2026-04-15", status: "Expired" },
  { id: "CPN-04", code: "NEWMOM15", type: "Percentage", value: 15, minOrder: 0, usageLimit: 200, used: 47, startDate: "2026-07-15", endDate: "2026-09-15", status: "Scheduled" },
  { id: "CPN-05", code: "BUNDLE5", type: "Fixed Amount", value: 5, minOrder: 40, usageLimit: 400, used: 129, startDate: "2026-06-10", endDate: "2026-07-20", status: "Active" },
];

export const campaigns: Campaign[] = [
  { id: "CMP-01", name: "Monsoon Baby Essentials Sale", channel: "Storefront Banner", discount: 20, startDate: "2026-07-05", endDate: "2026-07-20", status: "Active", description: "Homepage banner promoting diapering and bath essentials.", reach: 18400 },
  { id: "CMP-02", name: "New Mom Welcome Series", channel: "Email", discount: 15, startDate: "2026-06-15", endDate: "2026-12-31", status: "Active", description: "3-part welcome email flow for first-time customers.", reach: 5230 },
  { id: "CMP-03", name: "Eid Family Bundle Promo", channel: "Social Media", discount: 25, startDate: "2026-03-15", endDate: "2026-04-15", status: "Ended", description: "Instagram and Facebook push for maternity bundles.", reach: 42750 },
  { id: "CMP-04", name: "Back-to-Routine Nursery Refresh", channel: "SMS", discount: 10, startDate: "2026-08-01", endDate: "2026-08-14", status: "Scheduled", description: "SMS blast for nursery furniture and bedding restock.", reach: 9100 },
];

export const monthlySales = [
  { month: "Jan", sales: 8200, orders: 210 },
  { month: "Feb", sales: 9100, orders: 240 },
  { month: "Mar", sales: 8700, orders: 225 },
  { month: "Apr", sales: 10400, orders: 268 },
  { month: "May", sales: 11800, orders: 301 },
  { month: "Jun", sales: 12650, orders: 322 },
  { month: "Jul", sales: 9800, orders: 251 },
];

export const categorySplit = [
  { name: "Baby Feeding", value: 42, color: "#e8a5a5" },
  { name: "Maternity Wear", value: 58, color: "#e3a857" },
  { name: "Toys & Play", value: 63, color: "#869f82" },
  { name: "Diapering", value: 36, color: "#8fb2c2" },
  { name: "Other", value: 89, color: "#c9beae" },
];

export const weeklyVisitors = [
  { day: "Mon", visitors: 1240 },
  { day: "Tue", visitors: 1380 },
  { day: "Wed", visitors: 1190 },
  { day: "Thu", visitors: 1520 },
  { day: "Fri", visitors: 1680 },
  { day: "Sat", visitors: 2010 },
  { day: "Sun", visitors: 1750 },
];

export const dashboardStats = {
  revenue: { value: 12650, change: 8.4 },
  orders: { value: 322, change: 5.1 },
  customers: { value: 2140, change: 3.6 },
  lowStock: { value: products.filter((p) => p.status !== "In Stock").length, change: -2 },
};

// One customer can place many orders over time, and each order can contain many items.
// This helper aggregates that order history for a customer, keyed by their unique mobile number.
export function getCustomerStats(mobile: string, orderList: Order[] = orders) {
  const customerOrders = orderList
    .filter((o) => o.mobile === mobile)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const totalOrders = customerOrders.length;
  const totalItems = customerOrders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0),
    0
  );
  const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
  const lastOrderDate = customerOrders[0]?.date;
  return { totalOrders, totalItems, totalSpent, lastOrderDate, customerOrders };
}
