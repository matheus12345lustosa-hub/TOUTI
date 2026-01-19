"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Package, RefreshCw } from "lucide-react";
import { adjustStock } from "./stock-actions";

export function StockAdjustmentDialog({ product }: { product: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [operation, setOperation] = useState<'ADD' | 'REMOVE' | 'SET'>('ADD');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            const quantity = parseFloat(formData.get("quantity") as string);
            const reason = formData.get("reason") as string;

            if (isNaN(quantity) || quantity < 0) {
                alert("Quantidade inválida");
                return;
            }

            await adjustStock(product.id, quantity, operation, reason);
            setOpen(false);
        } catch (error: any) {
            alert(error.message || "Erro ao ajustar estoque");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Ajuste Manual de Estoque">
                    <Package className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajuste de Estoque</DialogTitle>
                    <DialogDescription>
                        Ajuste manual para o produto: <b>{product.name}</b>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-2 justify-center my-2">
                    <Button
                        size="sm"
                        variant={operation === 'ADD' ? 'default' : 'outline'}
                        className={operation === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        onClick={() => setOperation('ADD')}
                    >
                        Adicionar
                    </Button>
                    <Button
                        size="sm"
                        variant={operation === 'REMOVE' ? 'default' : 'outline'}
                        className={operation === 'REMOVE' ? 'bg-rose-600 hover:bg-rose-700' : ''}
                        onClick={() => setOperation('REMOVE')}
                    >
                        Remover
                    </Button>
                    <Button
                        size="sm"
                        variant={operation === 'SET' ? 'default' : 'outline'}
                        className={operation === 'SET' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                        onClick={() => setOperation('SET')}
                    >
                        Definir Total
                    </Button>
                </div>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantidade</Label>
                        <Input id="quantity" name="quantity" type="number" step="1" required min="0" placeholder="0" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Motivo</Label>
                        <Input id="reason" name="reason" placeholder="Ex: Contagem, Quebra, Compra..." required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirmar Ajuste
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
