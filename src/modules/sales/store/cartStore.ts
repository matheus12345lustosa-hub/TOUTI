import { create } from 'zustand';
import { calculateItemTotal, PricingProduct, PricingPromotion, CartItem as PCartItem } from '@/lib/pricing-calc';

export type CartItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    originalPrice?: number; // Visual aid
    promotionApplied?: string; // Name of promo
};

interface CartState {
    items: CartItem[];
    promotions: PricingPromotion[];
    selectedClient: { id: string; name: string } | null;

    fetchPromotions: () => Promise<void>;
    setClient: (client: { id: string; name: string } | null) => void;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    promotions: [],
    selectedClient: null,

    fetchPromotions: async () => {
        try {
            const res = await fetch('/api/promotions');
            if (res.ok) {
                const data = await res.json();
                set({ promotions: data });
            }
        } catch (error) {
            console.error("Failed to load promotions in POS", error);
        }
    },

    setClient: (client) => set({ selectedClient: client }),

    addToCart: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        let newItems;

        // Adapters for shared function
        const toPricingItem = (i: CartItem): PCartItem => ({
            product: { id: i.id, price: i.price, name: i.name },
            quantity: i.quantity
        });

        if (existingItem) {
            newItems = state.items.map((i) => {
                if (i.id === item.id) {
                    const updatedItem = { ...i, quantity: i.quantity + item.quantity };
                    const res = calculateItemTotal(toPricingItem(updatedItem), state.promotions);
                    return {
                        ...updatedItem,
                        total: res.finalTotal,
                        promotionApplied: res.appliedPromotion || undefined,
                        originalPrice: res.appliedPromotion ? updatedItem.price : undefined
                    };
                }
                return i;
            });
        } else {
            const res = calculateItemTotal(toPricingItem(item), state.promotions);
            const newItem = {
                ...item,
                total: res.finalTotal,
                promotionApplied: res.appliedPromotion || undefined,
                originalPrice: res.appliedPromotion ? item.price : undefined
            };
            newItems = [...state.items, newItem];
        }

        // Broadcast change
        const channel = new BroadcastChannel('pdv_channel');
        channel.postMessage({ type: 'UPDATE_CART', items: newItems });
        channel.close();

        return { items: newItems };
    }),

    removeFromCart: (itemId) => set((state) => {
        const newItems = state.items.filter((i) => i.id !== itemId);

        // Broadcast change
        const channel = new BroadcastChannel('pdv_channel');
        channel.postMessage({ type: 'UPDATE_CART', items: newItems });
        channel.close();

        return { items: newItems };
    }),

    clearCart: () => {
        // Broadcast change
        const channel = new BroadcastChannel('pdv_channel');
        channel.postMessage({ type: 'UPDATE_CART', items: [] });
        channel.close();

        set({ items: [], selectedClient: null });
    },

    total: () => get().items.reduce((acc, item) => acc + item.total, 0),
}));
