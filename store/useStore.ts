import { CartItem } from '@/types/cart'
import { create } from 'zustand'
import { persist } from "zustand/middleware";

interface StoreState {
  cart: CartItem[]
  wishlist: CartItem[]
  isCartOpen: boolean
  isSearchOpen: boolean

  addToCart: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  removeFromCart: (id: number, color: string, size: string) => void
  updateQty: (id: number, color: string, size: string, qty: number) => void
   wishUpdateQty: (id: number, color: string, size: string, qty: number) => void
  toggleWishlist: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void
  clearCart: () => void;

  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void

  // cartCount: () => number
  // cartTotal: () => number
}


export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      isCartOpen: false,
      isSearchOpen: false,

      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find(
            (c) =>
              c.id === item.id &&
              c.color === item.color &&
              c.size === item.size
          );

          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === item.id &&
                  c.color === item.color &&
                  c.size === item.size
                  ? { ...c, qty: c.qty + (item.qty || 1) }
                  : c
              ),
              isCartOpen: true,
            };
          }

          return {
            cart: [...state.cart, { ...item, qty: item.qty || 1 }],
            isCartOpen: true,
          };
        }),

      removeFromCart: (id, color, size) =>
        set((state) => ({
          cart: state.cart.filter(
            (c) =>
              !(c.id === id && c.color === color && c.size === size)
          ),
        })),

      updateQty: (id, color, size, qty) =>
        set((state) => ({
          cart: state.cart.map((c) =>
            c.id === id &&
              c.color === color &&
              c.size === size
              ? { ...c, qty: Math.max(1, qty) }
              : c
          ),
        })),

         wishUpdateQty: (id, color, size, qty) =>
        set((state) => ({
          wishlist: state.wishlist.map((c) =>
            c.id === id &&
              c.color === color &&
              c.size === size
              ? { ...c, qty: Math.max(1, qty) }
              : c
          ),
        })),

      toggleWishlist: (item) =>
        set((state) => {
          const existing = state.wishlist.find(
            (w) =>
              w.id === item.id &&
              w.color === item.color &&
              w.size === item.size
          );

          if (existing) {
            return {
              wishlist: state.wishlist.filter(
                (w) =>
                  !(
                    w.id === item.id &&
                    w.color === item.color &&
                    w.size === item.size
                  )
              ),
            };
          }

          return {
            wishlist: [...state.wishlist, { ...item, qty: item.qty || 1 }],
          };
        }),

      clearCart: () =>
        set({
          cart: [],
          isCartOpen: false,
        }),

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

      // cartCount: () =>
      //   get().cart.reduce((sum, item) => sum + item.qty, 0),

      // cartTotal: () =>
      //   get().cart.reduce(
      //     (sum, item) => sum + item.qty * Number(item.price),
      //     0
      //   ),
    }),
    {
      name: "kids-mom-store", // localStorage key

      // Persist only cart and wishlist
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);
