
// Pure functions for pricing, no database imports
// Define minimal types needed
export type PricingProduct = {
    id: string;
    price: any; // Decimal or number
    name: string;
    [key: string]: any;
}

export type PricingPromotion = {
    id: string;
    productId: string;
    type: string;
    minQuantity: number;
    promotionalPrice: any | null;
    discountPercent: any | null;
    payQuantity: number | null;
    name: string;
}

export type CartItem = {
    product: PricingProduct;
    quantity: number;
}

export function calculateItemTotal(item: CartItem, promotions: PricingPromotion[]) {
    const { product, quantity } = item;
    let unitPrice = Number(product.price);
    let total = unitPrice * quantity;

    // Find tailored promotion for this product
    const promo = promotions.find(p => p.productId === product.id);

    if (promo) {
        if (promo.type === 'WHOLESALE' && quantity >= promo.minQuantity) {
            // Apply promotional price if met min quantity
            if (promo.promotionalPrice) {
                total = Number(promo.promotionalPrice) * quantity;
            }
        } else if (promo.type === 'PROGRESSIVE' && promo.discountPercent) {
            // Discount percent logic
            // e.g. Buy 3 get 10% off
            if (quantity >= promo.minQuantity) {
                const discountMultiplier = 1 - (Number(promo.discountPercent) / 100);
                total = total * discountMultiplier;
            }
        } else if (promo.type === 'BUNDLE') {
            // Buy X Pay Y
            if (promo.payQuantity && promo.minQuantity > 0) {
                const bundles = Math.floor(quantity / promo.minQuantity);
                const remainder = quantity % promo.minQuantity;
                const payFor = (bundles * promo.payQuantity) + remainder;
                total = unitPrice * payFor;
            }
        }
    }

    return {
        originalTotal: Number(product.price) * quantity,
        finalTotal: total,
        appliedPromotion: promo ? promo.name : null
    };
}

export function calculateCartSummary(items: CartItem[], promotions: PricingPromotion[]) {
    let subtotal = 0;
    let total = 0;

    items.forEach(item => {
        const res = calculateItemTotal(item, promotions);
        subtotal += res.originalTotal;
        total += res.finalTotal;
    });

    return {
        subtotal,
        total,
        discount: subtotal - total
    };
}
