export interface Product {
    id: string;
    name: string;
    price: number;
    barcode: string;
    stock: number;
}

// Mocks removed in favor of real API


export const productService = {
    getProductByBarcode: async (barcode: string): Promise<Product | null> => {
        try {
            const res = await fetch(`/api/products?barcode=${barcode}`);
            if (!res.ok) return null;
            const product = await res.json();
            return product;
        } catch (error) {
            console.error("Error fetching product:", error);
            return null;
        }
    },

    searchProducts: async (query: string): Promise<Product[]> => {
        try {
            const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Error searching products:", error);
            return [];
        }
    }
};
