'use client';

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Save, Ban, Loader2, Edit, Trash2, Eye, Receipt, Package, DollarSign, User, Tag } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/ui/select";
import { cancelSale, updateSale, deleteSale } from "../actions";

interface SaleActionsProps {
    sale: any;
}

const paymentMethodsMap: Record<string, string> = {
    'DINHEIRO': 'Dinheiro',
    'CARTAO_CREDITO': 'Cartão de Crédito',
    'CARTAO_DEBITO': 'Cartão de Débito',
    'PIX': 'Pix',
    'CASH': 'Dinheiro',
    'CREDIT_CARD': 'Cartão de Crédito',
    'DEBIT_CARD': 'Cartão de Débito'
};

export function SaleActions({ sale }: SaleActionsProps) {
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Edit State
    const [paymentMethod, setPaymentMethod] = useState(sale.paymentMethod || "");

    const handleCancel = async () => {
        setIsLoading(true);
        try {
            const res = await cancelSale(sale.id);
            if (res.success) {
                setIsCancelOpen(false);
            } else {
                alert(res.message);
            }
        } catch (error) {
            alert("Erro ao cancelar.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const res = await updateSale(sale.id, { paymentMethod });
            if (res.success) {
                setIsEditOpen(false);
            } else {
                alert(res.message);
            }
        } catch (e) {
            alert("Erro ao atualizar.");
        } finally {
            setIsLoading(false);
        }
    }


    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja EXCLUIR DEFINITIVAMENTE esta venda do histórico?")) return;
        setIsLoading(true);
        try {
            const res = await deleteSale(sale.id);
            if (!res.success) {
                alert(res.message);
            } else {
                // Success - page will revalidate
            }
        } catch (error) {
            alert("Erro ao excluir.");
        } finally {
            setIsLoading(false);
        }
    };

    if (sale.status === 'CANCELLED') {
        return (
            <div className="flex items-center gap-2 justify-end">
                <span className="text-xs text-slate-400 italic">Cancelada</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                    disabled={isLoading}
                    title="Excluir do Histórico"
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 ml-1"
                    onClick={() => setIsDetailsOpen(true)}
                    title="Ver Detalhes"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                    onClick={() => setIsDetailsOpen(true)}
                    title="Ver Detalhes"
                >
                    <Eye className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => setIsEditOpen(true)}
                    title="Editar Venda"
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setIsCancelOpen(true)}
                    title="Cancelar Venda"
                >
                    <Ban className="h-4 w-4" />
                </Button>
            </div>

            {/* Cancel Dialog */}
            <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Venda</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja cancelar a venda #{sale.id.slice(0, 8)}?
                            Isso irá estornar {sale.items.length} itens ao estoque. essa ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCancelOpen(false)} disabled={isLoading}>
                            Voltar
                        </Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Cancelamento
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Venda</DialogTitle>
                        <DialogDescription>
                            Ajuste detalhes da venda #{sale.id.slice(0, 8)}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Método de Pagamento</label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                                    <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                                    <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdate} disabled={isLoading} className="bg-rose-600 hover:bg-rose-700 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Receipt className="h-5 w-5 text-rose-500" />
                            Detalhes da Venda #{sale.id.slice(0, 8)}
                        </DialogTitle>
                        <DialogDescription>
                            Visualizando todos os detalhes, produtos e pagamentos.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Summary Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Cliente</p>
                                <p className="text-sm font-semibold text-slate-800">{sale.client?.name || "Consumidor Final"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                                    <User className="h-3 w-3" /> Vendedor / Admin
                                </p>
                                <p className="text-sm font-semibold text-slate-800">{sale.user?.name || "Sistema"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium mb-1">Data</p>
                                <p className="text-sm font-semibold text-slate-800">
                                    {new Date(sale.createdAt).toLocaleDateString('pt-BR')} {new Date(sale.createdAt).toLocaleTimeString('pt-BR')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
                                    <Tag className="h-3 w-3" /> Status
                                </p>
                                <p className="text-sm font-semibold text-slate-800">
                                    {sale.status === 'CANCELLED' ? (
                                        <span className="text-red-600">Cancelada</span>
                                    ) : (
                                        <span className="text-emerald-600">Concluída</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Items List */}
                        <div>
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                                <Package className="h-4 w-4 text-slate-500" />
                                Produtos Vendidos
                            </h4>
                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-2 font-medium">Produto</th>
                                            <th className="px-4 py-2 font-medium text-center">Qtd</th>
                                            <th className="px-4 py-2 font-medium text-right">Preço Un.</th>
                                            <th className="px-4 py-2 font-medium text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sale.items?.map((item: any) => (
                                            <tr key={item.id} className="bg-white">
                                                <td className="px-4 py-2 font-medium text-slate-700">{item.product?.name || "Produto Excluído"}</td>
                                                <td className="px-4 py-2 text-center text-slate-600">{item.quantity}</td>
                                                <td className="px-4 py-2 text-right text-slate-600">R$ {Number(item.unitPrice).toFixed(2)}</td>
                                                <td className="px-4 py-2 text-right text-slate-800 font-semibold">R$ {Number(item.total).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financials & Payments */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Payments List */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
                                    <DollarSign className="h-4 w-4 text-slate-500" />
                                    Formas de Pagamento
                                </h4>
                                <ul className="space-y-2">
                                    {sale.payments && sale.payments.length > 0 ? (
                                        sale.payments.map((p: any) => (
                                            <li key={p.id} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded border border-slate-100">
                                                <span className="text-sm font-medium text-slate-600">{paymentMethodsMap[p.method] || p.method}</span>
                                                <span className="text-sm font-bold text-slate-800">R$ {Number(p.amount).toFixed(2)}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded border border-slate-100">
                                            <span className="text-sm font-medium text-slate-600">{sale.paymentMethod ? paymentMethodsMap[sale.paymentMethod] || sale.paymentMethod : "N/A"}</span>
                                            <span className="text-sm font-bold text-slate-800">R$ {Number(sale.total).toFixed(2)}</span>
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {/* Totals Summary */}
                            <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3">Resumo de Valores</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Valor Cheio (Sem Desconto):</span>
                                        <span className="font-medium">R$ {(sale.fullValue || sale.total).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-emerald-600">
                                        <span>Desconto da Promoção:</span>
                                        <span className="font-medium">- R$ {(sale.discount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-rose-200 flex justify-between text-slate-800 font-bold text-base">
                                        <span>Total Pago:</span>
                                        <span>R$ {sale.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
