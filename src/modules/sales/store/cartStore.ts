import { create } from 'zustand';
import { calculateCartWithPromotions, PricingPromotion } from '@/lib/pricing-calc';

// ...
export type CartItem = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    originalPrice?: number; // Visual aid
    promotionApplied?: string; // Name of promo
    product?: { id: string; name: string; price: number | string };
};

interface CartState {
    items: CartItem[];
    promotions: PricingPromotion[];
    selectedClient: { id: string; name: string; birthday?: string | Date | null } | null;

    fetchPromotions: () => Promise<void>;
    setClient: (client: { id: string; name: string; birthday?: string | Date | null } | null) => void;
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
                // Re-calculate cart in case promotions loaded after items
                const state = get();
                if (state.items.length > 0) {
                    const recalculatedItems = calculateCartWithPromotions(state.items as any, data);
                    set({ items: recalculatedItems as any });
                }
            }
        } catch (error) {
            console.error("Failed to load promotions in POS", error);
        }
    },

    setClient: (client) => set({ selectedClient: client }),

    addToCart: (newItemRaw) => set((state) => {
        // 1. Update the raw items list first (Quantity logic)
        const existingItemIndex = state.items.findIndex((i) => i.id === newItemRaw.id);
        let updatedItemsList = [...state.items];

        if (existingItemIndex > -1) {
            // Update quantity
            updatedItemsList[existingItemIndex] = {
                ...updatedItemsList[existingItemIndex],
                quantity: updatedItemsList[existingItemIndex].quantity + (newItemRaw.quantity || 1)
            };
        } else {
            // Add new item
            // Ensure we match the internal structure expected by calculator
            updatedItemsList.push({
                ...newItemRaw,
                product: {
                    id: newItemRaw.id,
                    price: newItemRaw.price,
                    name: newItemRaw.name
                },
                price: Number(newItemRaw.price), // Ensure base price is set
                total: Number(newItemRaw.price) * (newItemRaw.quantity || 1) // Initial total
            });
        }

        // 2. Apply Promotions to the WHOLE cart (Mix and Match support)
        const finalItems = calculateCartWithPromotions(updatedItemsList as any, state.promotions) as any;

        // 3. Broadcast change
        const channel = new BroadcastChannel('pdv_channel');
        channel.postMessage({ type: 'UPDATE_CART', items: finalItems });
        channel.close();

        return { items: finalItems };
    }),

    removeFromCart: (itemId) => set((state) => {
        const remainingItems = state.items.filter((i) => i.id !== itemId);

        // Recalculate with remaining items
        const finalItems = calculateCartWithPromotions(remainingItems as any, state.promotions) as any;

        // Broadcast change
        const channel = new BroadcastChannel('pdv_channel');
        channel.postMessage({ type: 'UPDATE_CART', items: finalItems });
        channel.close();

        return { items: finalItems };
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
