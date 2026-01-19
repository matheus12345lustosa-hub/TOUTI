import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EditProductForm } from "./EditProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const productRaw = await prisma.product.findUnique({
        where: { id },
        include: { productStocks: true }
    });

    const product = productRaw ? {
        ...productRaw,
        stock: productRaw.productStocks.reduce((acc, ps) => acc + ps.quantity, 0)
    } : null;

    if (!product) {
        return <div className="p-8 text-slate-500">Produto não encontrado.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <EditProductForm product={product} />
        </div>
    );
}
