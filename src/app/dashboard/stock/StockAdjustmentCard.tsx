"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { StockAdjustmentDialog } from "../products/StockAdjustmentDialog";

export function StockAdjustmentCard() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setProduct(null);
        setError("");

        try {
            // We'll search by barcode first (exact), then name (first match)
            // Using the existing API but we might need a specific endpoint or just hit the list
            // For simplicity, let's try direct exact barcode search first via existing API 
            // If that fails, we might need a better search. 
            // Let's assume the user types exact barcode or name for now, or we hit the list endpoint.

            const params = new URLSearchParams();
            // Heuristic: if numeric, try barcode, else query
            if (/^\d+$/.test(query)) {
                params.set("barcode", query);
            } else {
                params.set("q", query);
            }

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                if (data.length > 0) {
                    setProduct(data[0]); // Pick first hit
                } else {
                    setError("Produto não encontrado.");
                }
            } else if (data && data.id) {
                setProduct(data);
            } else {
                setError("Produto não encontrado.");
            }

        } catch (err) {
            setError("Erro ao buscar produto.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="bg-white border-rose-100 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="text-slate-800">Ajuste Manual</CardTitle>
                <CardDescription className="text-slate-500">
                    Busque um produto para ajustar seu estoque individualmente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Código de barras ou nome..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="bg-white"
                    />
                    <Button type="submit" disabled={isLoading || !query} className="bg-slate-800 hover:bg-slate-700">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                </form>

                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                {product && (
                    <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-slate-800">{product.name}</h4>
                                <p className="text-xs text-slate-500">{product.barcode}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-xs text-slate-500 block">Estoque Atual</span>
                                <span className="font-bold text-lg text-rose-600">
                                    {/* Handle branch vs global stock display if needed, API returns mixed logic but usually 'stock' field is summed or specific */}
                                    {product.stock} {product.unit}
                                </span>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <StockAdjustmentDialog product={product} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
