"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { ArrowLeft, Save } from "lucide-react";

export default function NewPromotionPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        productId: "",
        type: "BUNDLE", // BUNDLE, WHOLESALE, BUY_X_PAY_Y
        minQuantity: "",
        promotionalPrice: "",
        payQuantity: "",
        validFrom: "",
        validUntil: ""
    });

    useEffect(() => {
        // Fetch products for dropdown
        fetch('/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error("Error loading products", err));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin/promotions');
                router.refresh();
            } else {
                alert("Erro ao criar promoção");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white flex items-center gap-2 h-auto py-2 px-3"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-lg font-medium pt-0.5">Voltar</span>
                </Button>
                <h1 className="text-2xl font-bold text-white pt-1">Nova Promoção</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Configuração da Regra</CardTitle>
                        <CardDescription className="text-slate-400">Defina como o desconto será aplicado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nome da Promoção</label>
                                <Input required name="name" placeholder="Ex: Pack Cerveja Final de Semana" value={formData.name} onChange={handleChange} className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Produto Alvo</label>
                                <select required name="productId" className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={formData.productId} onChange={handleChange}>
                                    <option value="" className="bg-slate-900 text-slate-400">Selecione um produto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-900 text-white">{p.name} - R$ {Number(p.price).toFixed(2)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tipo de Regra</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "BUNDLE" })}
                                    className={`p-4 border rounded-lg text-left transition-all h-full flex flex-col justify-between ${formData.type === 'BUNDLE' ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
                                >
                                    <div className={`font-bold ${formData.type === 'BUNDLE' ? 'text-emerald-400' : 'text-slate-300'}`}>Kit / Bundle</div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">"Leve 12 por preço de atacado".</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "WHOLESALE" })}
                                    className={`p-4 border rounded-lg text-left transition-all h-full flex flex-col justify-between ${formData.type === 'WHOLESALE' ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
                                >
                                    <div className={`font-bold ${formData.type === 'WHOLESALE' ? 'text-blue-400' : 'text-slate-300'}`}>Atacado (Prog.)</div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">"A partir de 10 unidades, desconto geral".</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: "BUY_X_PAY_Y" })}
                                    className={`p-4 border rounded-lg text-left transition-all h-full flex flex-col justify-between ${formData.type === 'BUY_X_PAY_Y' ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500' : 'border-slate-800 bg-slate-950 hover:border-slate-600'}`}
                                >
                                    <div className={`font-bold ${formData.type === 'BUY_X_PAY_Y' ? 'text-purple-400' : 'text-slate-300'}`}>Leve X Pague Y</div>
                                    <div className="text-xs text-slate-500 mt-2 leading-relaxed">"Leve 3 Pague 2". Clássico.</div>
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        <div className="bg-slate-950/50 p-6 rounded-lg border border-slate-800 space-y-4">

                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="space-y-2 w-full md:w-1/3">
                                    <label className="text-sm font-bold text-slate-300">Qtd. Gatilho (Min)</label>
                                    <Input required type="number" name="minQuantity" placeholder="Ex: 12" value={formData.minQuantity} onChange={handleChange} className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600" />
                                    <p className="text-[10px] text-slate-500">Quantas unidades para ativar?</p>
                                </div>

                                {(formData.type === 'BUNDLE' || formData.type === 'WHOLESALE') && (
                                    <div className="space-y-2 w-full md:w-1/3">
                                        <label className="text-sm font-bold text-slate-300">Preço Promocional (UN)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                                            <Input required type="number" className="pl-10 bg-slate-900 border-slate-700 text-white font-bold placeholder:text-slate-600" name="promotionalPrice" placeholder="0,00" value={formData.promotionalPrice} onChange={handleChange} />
                                        </div>
                                        <p className="text-[10px] text-slate-500">Valor de CADA unidade no desconto.</p>
                                    </div>
                                )}

                                {formData.type === 'BUY_X_PAY_Y' && (
                                    <div className="space-y-2 w-full md:w-1/3">
                                        <label className="text-sm font-bold text-slate-300">Pague Apenas</label>
                                        <Input required type="number" name="payQuantity" placeholder="Ex: 2" value={formData.payQuantity} onChange={handleChange} className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600" />
                                        <p className="text-[10px] text-slate-500">Cliente leva {formData.minQuantity || 'X'} e paga {formData.payQuantity || 'Y'}.</p>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Válido De</label>
                                <Input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} className="bg-slate-950 border-slate-800 text-white [color-scheme:dark]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Válido Até</label>
                                <Input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} className="bg-slate-950 border-slate-800 text-white [color-scheme:dark]" />
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end pt-6">
                    <Button type="submit" size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20" disabled={isLoading}>
                        <div className="flex items-center gap-2">
                            <Save className="h-5 w-5" />
                            <span>{isLoading ? "Salvando..." : "Criar Promoção"}</span>
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
