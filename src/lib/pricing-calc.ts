
// Pure functions for pricing, no database imports
// Define minimal types needed
export type PricingProduct = {
    id: string;
    price: number | string; // Decimal or number
    name: string;
    [key: string]: any;
}

export type PricingPromotion = {
    id: string;
    productId: string | null;
    products?: { id: string }[];
    type: string;
    minQuantity: number;
    promotionalPrice: number | string | null;
    discountPercent: number | string | null;
    discountAmount: number | string | null;
    payQuantity: number | null;
    name: string;
    tiers?: any;
}

export type CartItem = {
    id: string; // Add ID for easier matching
    product: PricingProduct;
    quantity: number;
    price: number;
    total: number;
    promotionApplied?: string;
    originalPrice?: number;
}

// Helper to check if an item matches a specific promotion
const isItemEligible = (item: CartItem, promo: PricingPromotion) => {
    // Legacy support: strict productId match
    if (promo.productId && item.product.id === promo.productId) return true;

    // New Many-to-Many support
    if (promo.products && promo.products.some(p => p.id === item.product.id)) return true;

    return false;
};

// Calculate the total for a single item context (Legacy/Simple)
// This is kept for utility, but real logic should use calculateCartWithPromotions
export function calculateItemTotal(item: CartItem, promotions: PricingPromotion[]) {
    // This function is now just a wrapper for the single-item case, 
    // but truly we should process the whole cart.
    // For backward compatibility, we'll leave it simple but updated for checking arrays.

    const qty = item.quantity;
    const unitPrice = Number(item.product.price);
    let finalTotal = unitPrice * qty;
    let appliedPromotion = null;

    // Find tailored promotion for this product
    const promo = promotions.find(p => isItemEligible(item, p));

    if (promo) {
        // Logic duplicated here is dangerous. 
        // Ideally we refactor to use a shared core logic.
        // But for "Item Total" in isolation, we can't do Mix-and-Match.
        // So this function essentially ONLY supports "Buy X of THIS ITEM".

        if (promo.type === 'WHOLESALE' && qty >= promo.minQuantity) {
            if (promo.promotionalPrice) {
                finalTotal = Number(promo.promotionalPrice) * qty;
                appliedPromotion = promo.name;
            }
        }
        // ... (other types omitted for brevity in this legacy helper, 
        // as we will move main logic to calculateCartWithPromotions)
    }

    return {
        originalTotal: unitPrice * qty,
        finalTotal,
        appliedPromotion
    };
}

/**
 * Main logic for applying promotions to the entire cart.
 * Supports Mix-and-Match (multi-product promotions).
 */
export function calculateCartWithPromotions(items: CartItem[], promotions: PricingPromotion[]): CartItem[] {
    // 1. Reset all items to base state
    let processingItems: CartItem[] = items.map(item => ({
        ...item,
        price: Number(item.product.price),
        total: Number(item.product.price) * item.quantity,
        promotionApplied: undefined,
        originalPrice: undefined
    }));

    // 2. Iterate through promos (Priority: You might want to sort promotions by 'priority' or 'value' here)
    // For now, we take them in order. First match consumes the item? 
    // Or we find the 'best' one? 
    // Simple approach: Apply first valid promotion found for the group.

    for (const promo of promotions) {
        // Find all items in cart that match this promo
        const eligibleItems = processingItems.filter(item =>
            // Only items not yet promoted? Or should we allow stacking? Usually no stacking.
            !item.promotionApplied && isItemEligible(item, promo)
        );

        if (eligibleItems.length === 0) continue;

        // Calculate total quantity of eligible items (Mix and Match)
        const totalQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0);

        if (totalQuantity >= promo.minQuantity) {
            // Apply Promotion
            // Strategy: Calculate effective unit price or distribute discount

            if (promo.type === 'WHOLESALE' || promo.type === 'UNITY_PRICE') {
                // Fixed Price per Unit (e.g. R$ 50 each)
                if (promo.promotionalPrice) {
                    const promoPrice = Number(promo.promotionalPrice);
                    eligibleItems.forEach(item => {
                        item.total = promoPrice * item.quantity;
                        item.promotionApplied = promo.name;
                        item.originalPrice = item.price; // Save original for display
                    });
                }
            }
            else if (promo.type === 'FIXED_AMOUNT') {
                // R$ 10 off the bundle
                // We need to distribute this discount proportionally or just split it?
                // Or is it R$ 10 off EACH? Usually "Desconto R$" in this context might be 'Fixed Discount Amount'?
                // If it's "R$ 10 off the total", we split.
                if (promo.discountAmount) {
                    const discountTotal = Number(promo.discountAmount);
                    // Distribute by quantity weight
                    eligibleItems.forEach(item => {
                        const ratio = item.quantity / totalQuantity;
                        const itemDiscount = discountTotal * ratio; // Wait, this distributes 10 reais across 3 items?
                        // Or is it 10 reais per item? 
                        // Usually "Discount Amount" is fixed off the total.
                        // Let's assume it's per bundle execution? 

                        // Simplest: If type is FIXED_AMOUNT (Desconto R$), maybe it implies per unit? 
                        // Or total? Given the UI, let's treat it as *Total Discount on the Bundle*.

                        // Actually, if it's "Leve 3 pague R$ 100", that's WHOLESALE/UNITY_PRICE logic usually.
                        // If it's "Leve 3 e ganhe R$ 10 de desconto", then we subtract 10 from total.

                        const itemOriginalTotal = item.price * item.quantity;
                        // Let's simplify: distribute discount proportional to price contribution?
                        // Or just split evenly per item count?

                        // Implementation: proportional to price
                        const groupTotalInfo = eligibleItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
                        const discountFraction = discountTotal / groupTotalInfo;

                        item.total = itemOriginalTotal * (1 - discountFraction);
                        item.promotionApplied = promo.name;
                        item.originalPrice = item.price;
                    });
                }
            }
            else if (promo.type === 'PERCENTAGE') {
                if (promo.discountPercent) {
                    const multiplier = 1 - (Number(promo.discountPercent) / 100);
                    eligibleItems.forEach(item => {
                        item.total = (item.price * item.quantity) * multiplier;
                        item.promotionApplied = promo.name;
                        item.originalPrice = item.price;
                    });
                }
            }
            else if (promo.type === 'TIERED') {
                // Complex tiered logic (Tabela)
                // e.g. 1-2: R$ 50, 3-5: R$ 45
                // We use totalQuantity to find the tier
                let tierPrice = null;
                if (Array.isArray(promo.tiers)) {
                    // Sort tiers descending by quantity
                    const sortedTiers = [...promo.tiers].sort((a: any, b: any) => b.quantity - a.quantity);
                    const matchedTier = sortedTiers.find((t: any) => totalQuantity >= t.quantity);
                    if (matchedTier) tierPrice = matchedTier.price; // Usually price PER UNIT or Total? Default to Total for batch? 
                    // Looking at UI 'price: 99.90' for 'quantity: 3'. That's likely TOTAL for the batch?
                    // Or Unit price? 
                    // Typically 'Tabela de Preço' implies Unit Price based on Quantity bracket.
                    // But if it's "3 por 99", then 99/3 = 33.33 unit.

                    // Let's assume 'price' in tier is the TOTAL price for that quantity? No, that doesn't scale.
                    // Usually Tiered = "Buy 3+, pay X each. Buy 10+, pay Y each." (Progressive Unit Price)
                    // OR it's "Buy 3 for X".

                    // Let's check schema/comment: "tiers: [{quantity: 3, price: 99.90}]"
                    // If I buy 4? 
                    // Interpretation A: Unit price becomes 33.30 (99.90/3).
                    // Interpretation B: First 3 cost 99.90, 4th costs normal?
                    // Interpretation C: It's strictly "UnitPrice = X" when Qty >= Y.

                    // Given "Tabelado", it usually means Unit Price.
                    // IMPORTANT: If `price` in JSON is 99.90 for qty 3, and normal is 50.
                    // 50*3=150. 99.90 is cheaper. So unit price = 33.30.
                    // I will assume the Tier Price is the *Total Price for the minimum quantity* OR the *Unit Price*?
                    // "3 por 99.90" -> Price is 99.90 for the bundle.
                    // If I buy 6? It's 2 * 99.90?

                    if (matchedTier) {
                        // Determine unit price from the tier
                        // If tier.price is "Price for the Bundle of Qty", then Unit = Price / Qty
                        const unitPrice = Number(matchedTier.price) / Number(matchedTier.quantity);

                        eligibleItems.forEach(item => {
                            item.total = item.quantity * unitPrice;
                            item.promotionApplied = promo.name;
                            item.originalPrice = item.price;
                        });
                    }
                }
            }
        }
    }

    return processingItems;
}
