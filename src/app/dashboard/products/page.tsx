import Link from "next/link";
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import prisma from "@/lib/prisma";
import { StockAdjustmentDialog } from "./StockAdjustmentDialog";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams?.q || "";

    // Cookie & Branch
    const { cookies } = require("next/headers");
    const cookieStore = await cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { barcode: { contains: query } }
            ]
        },
        include: {
            category: true,
            productStocks: {
                where: branchId ? { branchId } : undefined
            }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50
    });

    return (

        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Produtos</h1>
                        <p className="text-xs text-slate-500">
                            {branchId ? "Gerencie o catálogo desta filial." : "Catálogo geral (soma de estoques)."}
                        </p>
                    </div>
                </div>
                <Link href="/dashboard/products/new">
                    <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs shadow-sm">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Novo Produto
                    </Button>
                </Link>
            </div>

            <div className="bg-white border border-rose-100 rounded-lg p-3 shadow-sm">
                {/* Search / Filter Toolbar */}
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar por nome ou código..."
                            className="pl-8 bg-rose-50/50 border-rose-200 text-slate-800 h-8 text-xs focus-visible:ring-rose-200 placeholder:text-slate-400"
                            defaultValue={query}
                        />
                    </div>
                </div>

                <div className="rounded-md border border-rose-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-rose-50/50">
                            <TableRow className="hover:bg-transparent border-rose-100 h-8">
                                <TableHead className="text-slate-500 font-semibold text-xs h-8">Produto</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-xs h-8">Código (EAN)</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-right text-xs h-8">Preço</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-right text-xs h-8">Estoque</TableHead>
                                <TableHead className="text-slate-500 font-semibold text-right text-xs h-8">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-16 text-center text-slate-500 text-xs">
                                        Nenhum produto encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => {
                                    // Calculate stock from loaded productStocks
                                    const stockQuantity = product.productStocks.reduce((acc, stock) => acc + stock.quantity, 0);

                                    // Serialize for Client Components (Decimal to Number)
                                    const serializedProduct = {
                                        ...product,
                                        price: Number(product.price),
                                        costPrice: Number(product.costPrice)
                                    };

                                    return (
                                        <TableRow key={product.id} className="hover:bg-rose-50/30 border-rose-100 h-10 transition-colors">
                                            <TableCell className="font-medium text-slate-700 text-xs py-2">
                                                {product.name}
                                                {product.ncm && <span className="block text-[9px] text-slate-400">NCM: {product.ncm}</span>}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-xs py-2">{product.barcode}</TableCell>
                                            <TableCell className="text-right text-rose-600 font-bold text-xs py-2">
                                                R$ {serializedProduct.price.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right text-slate-600 text-xs py-2">
                                                {stockQuantity} {product.unit}
                                            </TableCell>
                                            <TableCell className="text-right py-2">
                                                <div className="flex justify-end gap-1">
                                                    <StockAdjustmentDialog product={serializedProduct} />
                                                    <Link href={`/dashboard/products/${product.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </Link>
                                                    <DeleteProductButton id={product.id} productName={product.name} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
