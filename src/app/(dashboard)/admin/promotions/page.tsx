import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Plus, Tag, Calendar, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

async function getPromotions() {
    return await prisma.promotion.findMany({
        include: { product: true },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function PromotionsPage() {
    const promotions = await getPromotions();

    const formatDate = (date: Date | null) => {
        if (!date) return "Indefinido";
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'BUNDLE': return 'Kit / Pacote';
            case 'WHOLESALE': return 'Atacado (Progressivo)';
            case 'BUY_X_PAY_Y': return 'Leve X Pague Y';
            default: return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Promoções</h1>
                    <p className="text-slate-500">Gerencie campanhas, kits e descontos progressivos.</p>
                </div>
                <Link href="/admin/promotions/new">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                        <Plus className="h-4 w-4" />
                        Nova Promoção
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promo) => (
                    <div key={promo.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${promo.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                <Tag className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase tracking-widest">
                                {getTypeLabel(promo.type)}
                            </span>
                        </div>

                        <h3 className="font-bold text-lg text-slate-800 mb-1">{promo.name}</h3>
                        <p className="text-sm text-slate-500 mb-4">Produto: <span className="font-medium text-slate-700">{promo.product?.name || "N/A"}</span></p>

                        <div className="bg-slate-50 p-3 rounded border border-slate-100 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Gatilho:</span>
                                <span className="font-medium">Mín. {promo.minQuantity} un.</span>
                            </div>
                            {promo.type === 'BUNDLE' && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Preço do Kit:</span>
                                    <span className="font-bold text-emerald-600 w-1/2 text-right">R$ {Number(promo.promotionalPrice).toFixed(2)} / un</span>
                                </div>
                            )}
                            {promo.type === 'WHOLESALE' && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Preço Atacado:</span>
                                    <span className="font-bold text-emerald-600">R$ {Number(promo.promotionalPrice).toFixed(2)} / un</span>
                                </div>
                            )}
                            {promo.type === 'BUY_X_PAY_Y' && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Regra:</span>
                                    <span className="font-bold text-emerald-600">Paga {promo.payQuantity}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(promo.validFrom)} até {formatDate(promo.validUntil)}</span>
                        </div>
                    </div>
                ))}

                {promotions.length === 0 && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <AlertCircle className="h-10 w-10 mb-2 opacity-50" />
                        <p>Nenhuma promoção ativa no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
