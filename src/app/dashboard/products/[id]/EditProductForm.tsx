"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "../../../../shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

export function EditProductForm({ product }: { product: any }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error("Falha ao atualizar");

            router.push('/dashboard/products');
            router.refresh();
        } catch (error) {
            alert("Erro ao atualizar produto.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" type="button" onClick={() => router.back()} className="text-slate-500 hover:text-rose-600">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">Editar Produto</h1>
            </div>

            <Card className="bg-white border-rose-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-slate-800">Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-600">Nome do Produto</Label>
                            <Input id="name" name="name" defaultValue={product.name} required className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl" className="text-slate-600">URL da Imagem</Label>
                            <Input id="imageUrl" name="imageUrl" defaultValue={product.imageUrl || ""} className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" placeholder="https://..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="barcode" className="text-slate-600">Código de Barras (EAN)</Label>
                                <Input id="barcode" name="barcode" defaultValue={product.barcode} disabled className="bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" />
                                <p className="text-[10px] text-slate-500">O código de barras não pode ser alterado.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="unit" className="text-slate-600">Unidade</Label>
                                <Input id="unit" name="unit" defaultValue={product.unit} className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-slate-600">Preço de Venda (R$)</Label>
                                <Input id="price" name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="bg-rose-50 border-rose-200 text-rose-600 font-bold focus-visible:ring-rose-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="costPrice" className="text-slate-600">Preço de Custo (R$)</Label>
                                <Input id="costPrice" name="costPrice" type="number" step="0.01" defaultValue={Number(product.costPrice)} className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-rose-100 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="ncm" className="text-slate-600">NCM</Label>
                                <Input id="ncm" name="ncm" defaultValue={product.ncm || ""} className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cest" className="text-slate-600">CEST</Label>
                                <Input id="cest" name="cest" defaultValue={product.cest || ""} className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cfop" className="text-slate-600">CFOP</Label>
                                <Input id="cfop" name="cfop" defaultValue={product.cfop || "5102"} className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-rose-100 pt-4">
                            <Label htmlFor="stock" className="text-slate-600">Estoque Atual</Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                defaultValue={product.stock}
                                className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                placeholder="0"
                            />
                            <p className="text-[10px] text-slate-500">
                                Alterar este valor criará um ajuste de estoque automaticamente.
                            </p>
                        </div>

                        <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                            <Save className="h-4 w-4 mr-2" />
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
