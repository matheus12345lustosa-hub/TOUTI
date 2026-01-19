import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react"; // Icons
import { Button } from "@/shared/ui/button"; // UI Components
import { Input } from "@/shared/ui/input";
import prisma from "@/lib/prisma"; // DB

export const dynamic = 'force-dynamic'; // Ensure no caching for latest prices

export default async function FastSearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams?.q || "";

    // Optimized search for minimal data
    const products = query ? await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { barcode: { contains: query } }
            ]
        },
        select: {
            id: true,
            name: true,
            barcode: true,
            price: true,
            stock: true,
            unit: true
        },
        take: 20
    }) : [];

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Header minimalista */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Consulta Rápida</h1>
            </div>

            {/* Barra de Pesquisa Grande */}
            <form className="relative">
                <Search className="absolute left-4 top-3.5 h-6 w-6 text-rose-400" />
                <Input
                    name="q"
                    defaultValue={query}
                    placeholder="Digite o nome ou código de barras..."
                    className="pl-12 h-14 text-lg bg-white border-rose-200 text-slate-800 shadow-sm focus-visible:ring-rose-200"
                    autoFocus
                />
            </form>

            {/* Resultados em Grade para melhor visualização rápida */}
            <div className="grid gap-4">
                {query === "" && (
                    <p className="text-center text-slate-500 mt-10">
                        Digite algo acima para pesquisar preços e estoque.
                    </p>
                )}

                {query !== "" && products.length === 0 && (
                    <p className="text-center text-slate-500 mt-10">
                        Nenhum produto encontrado.
                    </p>
                )}

                {products.map((product) => (
                    <div key={product.id} className="bg-white p-4 rounded-lg border border-rose-100 flex justify-between items-center shadow-sm hover:bg-rose-50/20 transition-colors">
                        <div>
                            <h3 className="text-lg font-medium text-slate-800">{product.name}</h3>
                            <p className="text-slate-500 text-sm font-mono">Cód: {product.barcode}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
                                R$ {Number(product.price).toFixed(2)}
                            </div>
                            <div className="text-slate-500 text-sm">
                                Estoque: {product.stock} {product.unit}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
