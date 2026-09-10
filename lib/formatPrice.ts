export function formatPrice(value: number): string {
 const price = Number(value);
  return `৳ ${price.toFixed(2)}`;
}
