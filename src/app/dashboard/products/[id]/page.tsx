import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EditProductForm } from "./EditProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const product = await prisma.product.findUnique({
        where: { id: params.id }
    });

    if (!product) {
        return <div className="p-8 text-slate-500">Produto não encontrado.</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <EditProductForm product={product} />
        </div>
    );
}
