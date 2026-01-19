import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import prisma from "@/lib/prisma";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/shared/ui/table"; // Assuming table component exists or I need to create/use raw HTML

async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { name: 'asc' }
    });
}

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    const products = await getProducts();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Produtos</h1>
                <Link href="/admin/products/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">Novo Produto</Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Estoque</th>
                            <th className="p-4">Código de Barras</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-4 font-medium text-slate-800">{product.name}</td>
                                <td className="p-4">R$ {Number(product.price).toFixed(2)}</td>
                                <td className="p-4 flex items-center gap-2">
                                    <span className={product.stock <= product.minStock ? "text-red-600 font-bold" : "text-green-600"}>
                                        {product.stock}
                                    </span>
                                    {product.stock <= product.minStock && (
                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Baixo</Badge>
                                    )}
                                </td>
                                <td className="p-4 font-mono text-slate-500">{product.barcode}</td>
                                <td className="p-4">
                                    <Button variant="ghost" size="sm" className="text-blue-600">Editar</Button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    Nenhum produto encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
