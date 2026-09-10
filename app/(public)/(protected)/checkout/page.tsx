'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, ClipboardCheck, ShoppingBag, Shield, MapPin, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'

const steps = [
  { id: 0, label: 'Checkout', icon: ShoppingBag },
  { id: 1, label: 'Shipping', icon: Truck },
  { id: 2, label: 'Review', icon: ClipboardCheck },
]

import { formatPrice } from '@/lib/formatPrice'
import { toast } from '@/lib/toast'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShippingRate } from '@/types/order'
import { OrderSuccessModal } from '@/components/OrderSuccessModal'





export default function Page() {
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '', phone: '' })
  const [loading, setLoading] = useState(true);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState<number>(0);
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const shippingRate = shippingRates.find((rate) => rate.id === selectedShippingRate)?.rate ?? 0;
  const shippingLocation = shippingRates.find((rate) => rate.id === selectedShippingRate)?.name ?? 0;
  const cart = useStore((s) => s.cart)
  const total = cart.reduce((sum, item) => sum + item.qty * (item.offer_price && Number(item.offer_price) > 0 ? Number(item.offer_price) : Number(item.price)), 0);

  const validateShipping = () => {
    const e: Record<string, string> = {}
    if (!shipping.name) e.name = 'Full name is required'
    if (!shipping.phone) e.phone = 'Phone number is required'
    if (!shipping.address) e.address = 'Address is required'
    if (!shipping.city) e.city = 'City is required'
    if (!selectedShippingRate) e.selectedShippingRate = 'Shipping location is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }


  const handlePlaceOrder = async () => {
    const validationErrors: Record<string, string> = {};

    if (!shipping.name.trim()) validationErrors.name = "Name is required.";
    if (!shipping.phone.trim()) validationErrors.phone = "Phone number is required.";
    if (!shipping.address.trim()) validationErrors.address = "Address is required.";
    if (!shipping.city.trim()) validationErrors.city = "City is required.";
    if (!selectedShippingRate) {
      validationErrors.selectedShippingRate = "Shipping location is required.";
    }

    if (cart.length === 0) {
      toast({
        type: "error",
        message: "Your cart is empty.",
        position: "top-right",
      });
      return;
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        shipping,
        shippingRate,
        shippingLocation,
        couponDiscount: appliedCoupon?.discount || 0,
        cart,
      };

      const res = await fetch("/api/user/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast({
          type: "error",
          message: data.message || "Failed to place order.",
          position: "top-right",
        });
        return;
      }

      // Clear cart
      useStore.getState().clearCart();

      // Reset checkout form
      setShipping({
        name: "",
        phone: "",
        address: "",
        city: "",
        zip: ""
      });

      // router.replace("/");
      setOrderSuccess(data.order);
      setShowOrderSuccess(true);
      toast({
        type: "success",
        message: `Order ${data.orderNo} placed successfully.`,
        position: "top-right",
      });
    } catch (error) {

      toast({
        type: "error",
        message: "Something went wrong. Please try again.",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };


  const goNext = () => {
    if (step === 1 && !validateShipping()) return
    // if (step === 2 && !validatePayment()) return
    if (step === 2) {
      handlePlaceOrder()
      // setPlaced(true)
      return
    }
    setErrors({})
    setStep((s) => s + 1)
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);

        const res = await fetch("/api/user/profile");

        // Guest user → API returned no content
        if (res.status === 204) {
          return;
        }

        const data = await res.json();

        if (!res.ok || !data.success) {
          return;
        }

        setShipping((prev) => ({
          ...prev,
          ...data.data,
        }));
      } catch (error) {
        console.error("Profile loading error:", error);

        toast({
          type: "error",
          message: "Failed to load profile.",
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    }
    const fetchShippingRates = async () => {
      try {
        const response = await fetch(
          "/api/admin/shipping-rates"
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
            "Failed to fetch shipping rates"
          );
        }

        setShippingRates(result.data || []);
      } catch (error) {
        console.error(
          "Fetch shipping rates error:",
          error
        );
      }
    };

    fetchProfile();
    fetchShippingRates();
  }, []);

  // Coupon discount
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      setApplyingCoupon(true);
      setCouponError("");

      const response = await fetch("/api/admin/coupon-validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal: total,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Invalid coupon code."
        );
      }
console.log("coupon",data.coupon.discount_percentage);
      setAppliedCoupon({
        code: data.coupon.code,
        discount: Number(data.coupon.discount_percentage),
      });
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(
        error instanceof Error
          ? error.message
          : "Unable to apply coupon."
      );
    } finally {
      setApplyingCoupon(false);
    }
  };

  // remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };
console.log("Discount coupon",appliedCoupon?.discount);

console.log("Discount",formatPrice(total - (total * Number(appliedCoupon?.discount || 0)) / 100 + Number(shippingRate)));

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-12">
      <h1 className="font-serif text-3xl sm:text-4xl text-ink-900 mb-10 text-center">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${step >= s.id ? 'bg-rose-400 border-blush-400 text-white' : 'border-ink-100 text-ink-400'
                  }`}
              >
                {step > s.id ? <ShoppingBag size={16} /> : <s.icon size={16} />}
              </div>
              <span className="text-xs text-ink-500">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-12 sm:w-24 h-0.5 ${step > s.id ? 'bg-rose-400' : 'bg-rose-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-6 lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-6 lg:col-span-2">


                  {/* Contact information */}
                  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
                    <h3 className="font-semibold text-neutral-800">Contact Information</h3>
                    <p className="mt-1 text-sm text-neutral-400">
                      We&apos;ll use this to send you order updates.
                    </p>

                    <div className="mt-5">
                      <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex overflow-hidden rounded-xl border border-neutral-200 focus-within:ring-2 focus-within:ring-rose-200">
                        {/* <button
                          type="button"
                          className="flex shrink-0 items-center gap-1.5 border-r border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-600"
                        >
                          +880
                        </button> */}
                        <input
                          value={shipping.phone}
                          onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                          type="tel"
                          placeholder="Enter your mobile number"
                          className="w-full px-3 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
                        />
                      </div>
                      {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-500">
                        <Shield className="h-3.5 w-3.5 shrink-0" />
                        Make sure this number is active. We&apos;ll send you order updates here.
                      </p>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-100">
                    <h3 className="font-semibold text-neutral-800">Delivery Address</h3>

                    <div className="mt-5 space-y-5">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          value={shipping.name}
                          onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                          type="text"
                          placeholder="Enter your full name"
                          className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-200"
                        />
                        {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                          Address  <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          value={shipping.address}
                          onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                          rows={3}
                          placeholder="House/Flat, Road, Area"
                          className="w-full resize-none rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-200"
                        />
                        {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                            City / Town <span className="text-rose-500">*</span>
                          </label>
                          <input
                            value={shipping.city}
                            onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                            type="text"
                            placeholder="Enter your city"
                            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-200"
                          />
                          {errors.city && <p className="mt-1 text-xs text-rose-500">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                            ZIP / Postal Code (Optional)
                          </label>
                          <input
                            value={shipping.zip}
                            onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                            type="text"
                            placeholder="Enter zip code"
                            className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-700 outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </motion.div>
            )}


            {step === 2 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* ================= SHIPPING ADDRESS ================= */}
                <div className="rounded-2xl ring-1 ring-neutral-100 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100">
                        <MapPin
                          size={16}
                          strokeWidth={1.6}
                          className="text-ink-600"
                        />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                          Delivery
                        </p>

                        <h3 className="font-serif text-base text-ink-900">
                          Shipping Address
                        </h3>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-emerald-600">
                      Confirmed
                    </span>
                  </div>

                  <div className="rounded-xl bg-cream-50 p-4">
                    <p className="text-sm font-semibold text-ink-800">
                      {shipping.name}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-ink-500">
                      {shipping.address}
                      <br />
                      {shipping.city}
                      {shipping.zip && `, ${shipping.zip}`}
                    </p>

                    {shipping.phone && (
                      <p className="mt-2 text-xs text-ink-400">
                        {shipping.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* ================= ORDER ITEMS ================= */}
                <div className="rounded-2xl shadow-sm ring-1 ring-neutral-100 p-5 bg-white">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                        Your selection
                      </p>

                      <h3 className="font-serif text-base text-ink-900">
                        Order Summary
                      </h3>
                    </div>

                    <span className="text-xs text-ink-400">
                      {cart.reduce((sum, item) => sum + item.qty, 0)} items
                    </span>
                  </div>

                  <div className="divide-y divide-brand-pink">
                    {cart.map((item) => {
                      const price = Number(item.price);
                      const offerPrice = Number(item.offer_price);

                      const hasOffer =
                        offerPrice > 0 && offerPrice < price;

                      const finalPrice = hasOffer
                        ? offerPrice
                        : price;

                      return (
                        <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                          {/* Product Image */}
                          <div className="relative h-[76px] w-[62px] shrink-0 overflow-hidden rounded-xl bg-cream-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="62px"
                            />

                            {/* Quantity badge */}
                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-[9px] font-bold text-white">
                              {item.qty}
                            </span>
                          </div>

                          {/* Product Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between gap-3">
                              <div>
                                <p className="line-clamp-2 text-xs font-medium leading-relaxed text-ink-800">
                                  {item.name}
                                </p>

                                {(item.color || item.size) && (
                                  <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-400">
                                    {item.color && item.color}
                                    {item.color && item.size && " / "}
                                    {item.size && item.size}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 text-right">
                                <p className="text-sm font-semibold text-ink-900">
                                  {formatPrice(finalPrice * item.qty)}
                                </p>

                                {hasOffer && (
                                  <p className="mt-0.5 text-[9px] text-ink-400 line-through">
                                    {formatPrice(price * item.qty)}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-[10px] text-ink-400">
                                {formatPrice(finalPrice)} each
                              </span>

                              {hasOffer && (
                                <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[8px] font-bold text-rose-500">
                                  {Math.round(
                                    ((price - offerPrice) / price) * 100
                                  )}
                                  % OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>



                {/* ================= FINAL MESSAGE ================= */}
                <div className="rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 px-5 py-4 ">
                  <div className="flex items-center gap-3">
                    <Sparkles
                      size={45}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-rose-300"
                    />

                    <div>
                      <p className="text-xl font-medium text-ink-900">
                        Almost yours.
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-ink-800">
                        Please review your delivery details and items
                        carefully before placing your order.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6 rounded-2xl p-6 h-fit bg-white">
          <h2 className="font-semibold text-neutral-800 mb-5">Order Summary</h2>
          <div className="mt-5 space-y-4">
            {cart.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className="flex relative h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-2xl">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="60px" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-400">Quantity: {item.qty}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-neutral-800">
                  {item.price}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 border-t border-dashed border-neutral-200 pt-5 text-sm">
            {/* Shipping Location */}
            <div>
              <label className="mb-2 block text-xs font-medium text-neutral-600">
                Delivery Location
              </label>

              <div className="space-y-2">
                {shippingRates.filter((rate) => rate.status === "ACTIVE").map((rate) => (
                  <label
                    key={rate.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-3 transition ${selectedShippingRate === rate.id
                      ? "border-blush-deep bg-blush-deep/5"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping-rate"
                        value={rate.id}
                        checked={selectedShippingRate === rate.id}
                        onChange={() =>
                          setSelectedShippingRate(rate.id)
                        }
                        className="h-4 w-4 accent-blush-deep"
                      />

                      <span className="text-sm font-medium text-neutral-700">
                        {rate.name}
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-neutral-700">
                      {rate.rate === 0
                        ? "Free"
                        : formatPrice(rate?.rate)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.selectedShippingRate && <p className="mt-1 text-xs text-rose-500">{errors.selectedShippingRate}</p>}
            </div>

            <div className="flex items-center justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className="text-neutral-700">{formatPrice(total)}</span>
            </div>
            {/* Coupon */}
            <div className="pt-2">
              <label className="mb-2 block text-xs font-medium text-neutral-600">
                Have a coupon?
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter coupon code"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-sm uppercase outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                />

                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || applyingCoupon}
                  className="h-10 rounded-lg bg-neutral-900 px-4 text-xs font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {applyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div>

              {couponError && (
                <p className="mt-1.5 text-xs text-rose-500">
                  {couponError}
                </p>
              )}

              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="text-xs font-medium text-emerald-700">
                    {appliedCoupon.code} applied
                  </span>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-medium text-rose-500 hover:text-rose-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-neutral-500">
              <span>Discount</span>
              <span className="text-emerald-500">৳ {(Number(total) * Number(appliedCoupon?.discount || 0)) / 100}</span>
            </div>
          </div>


          <div className="space-y-3 text-sm mt-5">
            <div className="border-t border-brand-pink pt-3 flex justify-between font-semibold text-base">
             <span>Total</span><span>{formatPrice(total - (total * Number(appliedCoupon?.discount || 0)) / 100 + Number(shippingRate))}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-8">
            <button onClick={goNext} className="flex-1 py-3 rounded-full bg-brand-pink hover:bg-blush-500 text-white font-medium btn-magnetic shadow-glow">
              {step === 2 ? 'Confirm the order' : 'Continue'}
            </button>
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="px-6 py-3 rounded-full border border-ink-200 text-ink-700 text-sm font-medium">
                Back
              </button>
            )}

          </div>
        </div>
      </div>

      <OrderSuccessModal open={showOrderSuccess} order={orderSuccess} />

    </div>
  )
}
