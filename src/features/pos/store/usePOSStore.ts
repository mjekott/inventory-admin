import type { ProductResponseDto } from '@/types/generated/productResponseDto';
import type { VariantResponseDto } from '@/types/generated/variantResponseDto';
import type { Customer } from '@/types/generated/customer';
import { create } from 'zustand';

export interface CartItem {
  id: string; // productId or productId-variantId
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  product?: ProductResponseDto;
  variant?: VariantResponseDto;
}

interface POSState {
  // Cart state
  cartItems: CartItem[];
  selectedCustomer: Customer | null;
  discount: number;
  tax: number;
  notes: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'online' | 'credit' | null;

  // Search & UI state
  searchQuery: string;
  isProcessing: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  setSelectedCustomer: (customer: Customer | null) => void;
  setDiscount: (discount: number) => void;
  setTax: (tax: number) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: 'cash' | 'bank_transfer' | 'online' | 'credit' | null) => void;

  setSearchQuery: (query: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;

  // Computed values
  getSubtotal: () => number;
  getTaxAmount: () => number;
  getTotal: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  // Initial state
  cartItems: [],
  selectedCustomer: null,
  discount: 0,
  tax: 0,
  notes: '',
  paymentMethod: null,
  searchQuery: '',
  isProcessing: false,

  // Actions
  addItem: (item) => {
    const items = get().cartItems;
    const itemId = item.variantId ? `${item.productId}-${item.variantId}` : item.productId;
    const existingItem = items.find((i) => i.id === itemId);

    if (existingItem) {
      // Update quantity if item already exists
      set({
        cartItems: items.map((i) =>
          i.id === itemId
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
              }
            : i
        ),
      });
    } else {
      // Add new item
      const newItem: CartItem = {
        ...item,
        id: itemId,
      };
      set({ cartItems: [...items, newItem] });
    }
  },

  removeItem: (id) => {
    set({ cartItems: get().cartItems.filter((item) => item.id !== id) });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    set({
      cartItems: get().cartItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      ),
    });
  },

  clearCart: () => {
    set({
      cartItems: [],
      selectedCustomer: null,
      discount: 0,
      tax: 0,
      notes: '',
      paymentMethod: null,
    });
  },

  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setDiscount: (discount) => set({ discount }),
  setTax: (tax) => set({ tax }),
  setNotes: (notes) => set({ notes }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),

  // Computed values
  getSubtotal: () => {
    return get().cartItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    return ((subtotal - discount) * get().tax) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().discount;
    const tax = get().getTaxAmount();
    return subtotal - discount + tax;
  },
}));
