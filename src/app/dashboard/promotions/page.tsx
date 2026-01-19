"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Tag, Plus, Trash2, Calendar, AlertCircle } from "lucide-react";

interface Promotion {
    id: string;
    name: string;
    type: 'BUNDLE' | 'WHOLESALE' | 'BUY_X_PAY_Y';
    minQuantity: number;
    promotionalPrice?: number;
    payQuantity?: number;
    active: boolean;
    product: {
        name: string;
        price: number;
    };
}

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        type: "WHOLESALE",
        barcode: "",
        minQuantity: "3",
        promotionalPrice: "",
        payQuantity: ""
    });
    const [productSearch, setProductSearch] = useState<any>(null); // Found product to link

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await fetch("/api/dashboard/promotions");
            if (res.ok) {
                const data = await res.json();
                setPromotions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const findProduct = async () => {
        // This would ideally use the same service as POS or a dedicated API
        // For MVP we assume user types barcode exactly
        // We need an endpoint to lookup product by barcode for admin forms
        // Since we don't have a direct client-side service for this page, we might need to rely on manual entry or existing product list
        // Let's simplified: User enters Barcode, we try to create. 
        // BETTER: Let user search product name/barcode.
        // For now, let's implement a simple "Check" via API if needed, or just let backend handle validation

        // Quick fix: assume user knows barcode or we add a Product lookup component later.
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.barcode) return alert("Informe o código de barras");

        // 1. Resolve Product ID from Barcode (Client or Server?)
        // Let's do it simple: Search Product first
        const productRes = await fetch(`/api/products/search?q=${formData.barcode}`);
        const products = await productRes.json();
        const product = products.find((p: any) => p.barcode === formData.barcode);

        if (!product) return alert("Produto não encontrado com este código de barras.");

        try {
            const payload = {
                name: formData.name,
                type: formData.type,
                productId: product.id,
                minQuantity: Number(formData.minQuantity),
                promotionalPrice: formData.promotionalPrice ? Number(formData.promotionalPrice) : null,
                payQuantity: formData.payQuantity ? Number(formData.payQuantity) : null
            };

            const res = await fetch("/api/dashboard/promotions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("Promoção criada!");
                setIsCreating(false);
                fetchPromotions();
                setFormData({ ...formData, name: "", barcode: "" });
            } else {
                alert("Erro ao criar promoção");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza?")) return;
        await fetch(`/api/dashboard/promotions?id=${id}`, { method: 'DELETE' });
        fetchPromotions();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Tag className="h-8 w-8 text-rose-500" />
                        Promoções
                    </h1>
                    <p className="text-slate-500">Gerencie regras de desconto automático.</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">
                    {isCreating ? "Cancelar" : "Nova Promoção"}
                </Button>
            </div>

            {isCreating && (
                <Card className="bg-white border-rose-100 shadow-sm animate-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle className="text-slate-800">Criar Regra</CardTitle>
                        <CardDescription className="text-slate-500">Defina como o desconto será aplicado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nome da Promoção</label>
                                    <Input
                                        placeholder="Ex: Leve 3 Skol pague R$3,50"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Código de Barras do Produto</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Escaneie ou digite..."
                                            value={formData.barcode}
                                            onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                                            required
                                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tipo</label>
                                    <select
                                        className="w-full h-10 rounded-md border border-rose-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="WHOLESALE">Atacado (Preço reduzido a partir de X unid)</option>
                                        <option value="BUNDLE">Leve X Pague Y</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Qtd Mínima (Gatilho)</label>
                                        <Input
                                            type="number"
                                            value={formData.minQuantity}
                                            onChange={e => setFormData({ ...formData, minQuantity: e.target.value })}
                                            required
                                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                                        />
                                    </div>

                                    {formData.type === 'WHOLESALE' ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-rose-600">Novo Preço Unitário</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.promotionalPrice}
                                                onChange={e => setFormData({ ...formData, promotionalPrice: e.target.value })}
                                                className="bg-rose-50 border-rose-200 text-rose-600 font-bold focus-visible:ring-rose-200"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-rose-600">Pague Apenas (Qtd)</label>
                                            <Input
                                                type="number"
                                                placeholder="Ex: 2"
                                                value={formData.payQuantity}
                                                onChange={e => setFormData({ ...formData, payQuantity: e.target.value })}
                                                className="bg-rose-50 border-rose-200 text-rose-600 font-bold focus-visible:ring-rose-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button type="submit" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
                                Salvar Promoção
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="bg-white border-rose-100 shadow-sm hidden md:block">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-rose-50/50">
                            <TableRow className="border-rose-100 hover:bg-transparent">
                                <TableHead className="text-slate-500 font-semibold">Nome</TableHead>
                                <TableHead className="text-slate-500 font-semibold">Produto</TableHead>
                                <TableHead className="text-slate-500 font-semibold">Regra</TableHead>
                                <TableHead className="text-slate-500 font-semibold">Status</TableHead>
                                <TableHead className="text-right text-slate-500 font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {promotions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                        Nenhuma promoção ativa no momento.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                promotions.map((promo) => (
                                    <TableRow key={promo.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                        <TableCell className="font-medium text-slate-700">{promo.name}</TableCell>
                                        <TableCell className="text-slate-600">{promo.product.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-500 font-bold">{promo.type === 'WHOLESALE' ? 'ATACADO' : 'LEVE X PAGUE Y'}</span>
                                                <span className="text-xs text-slate-500">
                                                    {promo.type === 'WHOLESALE'
                                                        ? `Acima de ${promo.minQuantity} un: R$ ${Number(promo.promotionalPrice).toFixed(2)}`
                                                        : `Leve ${promo.minQuantity}, Pague ${promo.payQuantity}`
                                                    }
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                            bg-emerald-50 text-emerald-600 border-emerald-200
                        `}>
                                                Ativo
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {promotions.map((promo) => (
                    <div key={promo.id} className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm flex flex-col gap-3 relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">{promo.name}</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{promo.product.name}</p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-[10px] h-5 px-1.5">
                                Ativo
                            </Badge>
                        </div>

                        <div className="bg-rose-50/50 rounded p-2 text-xs border border-rose-100">
                            <div className="font-bold text-rose-700 mb-1">{promo.type === 'WHOLESALE' ? 'ATACADO' : 'LEVE X PAGUE Y'}</div>
                            <div className="text-slate-600">
                                {promo.type === 'WHOLESALE'
                                    ? `Acima de ${promo.minQuantity} un: R$ ${Number(promo.promotionalPrice).toFixed(2)}/un`
                                    : `Leve ${promo.minQuantity}, Pague ${promo.payQuantity}`
                                }
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-rose-50">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(promo.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 text-xs">
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Excluir
                            </Button>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="text-center py-8 text-slate-400 bg-white rounded-lg border border-dashed border-rose-200">
                        <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma promoção ativa.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
