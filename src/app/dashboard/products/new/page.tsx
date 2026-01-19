"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Box, Tag, FileText } from "lucide-react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui";

import { MediaGallery } from "./MediaGallery";

interface Category {
    id: string;
    name: string;
}

export default function NewProductPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("geral");
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => setCategories(Array.isArray(data) ? data : []))
            .catch(err => console.error("Falha ao buscar categorias", err));
    }, []);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Falha ao criar");
            }

            // Show success ?
            router.push('/dashboard/products');
            router.refresh();
        } catch (error) {
            alert("Erro ao salvar produto. Verifique os dados.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-rose-600">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Novo Produto</h1>
                        <p className="text-slate-500 text-sm">Cadastre um novo item no estoque</p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-8">
                {/* Tabs Navigation */}
                <div className="flex space-x-1 bg-rose-50/50 p-1 rounded-lg border border-rose-100 w-fit">
                    <button
                        type="button"
                        onClick={() => setActiveTab("geral")}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "geral"
                            ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                            : "text-slate-500 hover:text-rose-600 hover:bg-rose-100/50"
                            }`}
                    >
                        <Box className="w-4 h-4 mr-2" />
                        Geral
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("detalhes")}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "detalhes"
                            ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                            : "text-slate-500 hover:text-rose-600 hover:bg-rose-100/50"
                            }`}
                    >
                        <Tag className="w-4 h-4 mr-2" />
                        Códigos & Categorias
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("fiscal")}
                        className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "fiscal"
                            ? "bg-white text-rose-600 shadow-sm border border-rose-100"
                            : "text-slate-500 hover:text-rose-600 hover:bg-rose-100/50"
                            }`}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Fiscal
                    </button>
                </div>

                {/* Tab Content: GERAL */}
                <div className={activeTab === "geral" ? "block" : "hidden"}>
                    <Card className="bg-white border-rose-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Informações Principais</CardTitle>
                            <CardDescription className="text-slate-500">Dados essenciais para a venda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-600">Nome do Produto <span className="text-red-500">*</span></Label>
                                    <Input id="name" name="name" required className="bg-white border-rose-200 text-slate-800 h-12 text-lg focus-visible:ring-rose-200" placeholder="Ex: Cerveja Artesanal IPA" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="barcode" className="text-slate-600">Código de Barras (EAN)</Label>
                                        <Input id="barcode" name="barcode" className="bg-white border-rose-200 text-slate-800 font-mono focus-visible:ring-rose-200" placeholder="789... (Opcional)" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="unit" className="text-slate-600">Unidade</Label>
                                        <Input id="unit" name="unit" defaultValue="UN" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-rose-50/30 p-4 rounded-lg border border-rose-100">
                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="text-emerald-600 font-bold">Preço de Venda (R$) <span className="text-red-500">*</span></Label>
                                        <Input id="price" name="price" type="number" step="0.01" required className="bg-white border-emerald-200 text-emerald-600 font-bold text-xl h-12 focus:border-emerald-500 focus-visible:ring-emerald-200" placeholder="0,00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="costPrice" className="text-slate-600">Preço de Custo (R$)</Label>
                                        <Input id="costPrice" name="costPrice" type="number" step="0.01" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" placeholder="0,00" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="stock" className="text-slate-600">Estoque Atual</Label>
                                        <Input id="stock" name="stock" type="number" defaultValue="0" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minStock" className="text-slate-600">Estoque Mínimo</Label>
                                        <Input id="minStock" name="minStock" type="number" defaultValue="5" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Content: DETALHES (CATEGORIA & COD) */}
                <div className={activeTab === "detalhes" ? "block" : "hidden"}>
                    <Card className="bg-white border-rose-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Organização</CardTitle>
                            <CardDescription className="text-slate-500">Categorias e códigos internos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="internalCode" className="text-slate-600">Código Interno (Opcional)</Label>
                                <Input id="internalCode" name="internalCode" className="bg-white border-rose-200 text-slate-800 font-mono focus-visible:ring-rose-200" placeholder="Deixe em branco para gerar automaticamente" />
                                <p className="text-xs text-slate-500">* Se não preencher, o sistema criará um código único.</p>
                            </div>

                            <hr className="border-rose-100" />

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="categoryId" className="text-slate-600">Categoria Existente</Label>
                                    <select
                                        id="categoryId"
                                        name="categoryId"
                                        className="flex h-10 w-full rounded-md border border-rose-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-800"
                                    >
                                        <option value="">Selecione uma categoria...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-rose-100" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-slate-400">OU Crie Nova</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newCategoryName" className="text-slate-600">Nova Categoria</Label>
                                    <Input id="newCategoryName" name="newCategoryName" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" placeholder="Digite o nome para criar..." />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label htmlFor="imageUrl" className="text-slate-600">Imagem do Produto</Label>
                                <Input type="hidden" name="imageUrl" id="imageUrl" value={imageUrl} />
                                <MediaGallery
                                    currentUrl={imageUrl}
                                    onSelect={(url) => setImageUrl(url)}
                                />
                                <p className="text-xs text-slate-500">Selecione uma imagem da galeria ou adicione uma nova URL.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tab Content: FISCAL */}
                <div className={activeTab === "fiscal" ? "block" : "hidden"}>
                    <Card className="bg-white border-rose-100 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-800">Dados Fiscais</CardTitle>
                            <CardDescription className="text-slate-500">Para emissão de nota (futuro)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="ncm" className="text-slate-600">NCM</Label>
                                    <Input id="ncm" name="ncm" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" placeholder="0000.00.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cest" className="text-slate-600">CEST</Label>
                                    <Input id="cest" name="cest" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cfop" className="text-slate-600">CFOP Padrão</Label>
                                    <Input id="cfop" name="cfop" defaultValue="5102" className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-rose-100">
                    <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-500 hover:text-rose-600">
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 w-48 shadow-md hover:shadow-lg transition-all" disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Salvando..." : "Salvar Produto"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
