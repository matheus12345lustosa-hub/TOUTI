'use client';

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Save, Ban, Loader2, Edit, Trash2 } from "lucide-react";
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

export function SaleActions({ sale }: SaleActionsProps) {
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
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
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-end gap-1">
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
        </>
    );
}
