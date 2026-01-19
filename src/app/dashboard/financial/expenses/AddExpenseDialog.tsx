"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { createExpense } from "./actions";
import { PlusCircle } from "lucide-react";

export function AddExpenseDialog() {
    const [open, setOpen] = useState(false);
    const [isBill, setIsBill] = useState(false);

    async function clientAction(formData: FormData) {
        await createExpense(formData);
        setOpen(false);
        // Reset form or handle state ideally
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Despesa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-800">
                <DialogHeader>
                    <DialogTitle>Adicionar Despesa</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Registre uma nova despesa ou conta a pagar.
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right text-slate-300">
                            Descrição
                        </Label>
                        <Input id="description" name="description" required className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right text-slate-300">
                            Valor
                        </Label>
                        <Input id="amount" name="amount" type="number" step="0.01" required className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right text-slate-300">
                            Tipo
                        </Label>
                        <select id="type" name="type" className="col-span-3 flex h-9 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-white">
                            <option value="FIXA">Fixa</option>
                            <option value="VARIAVEL">Variável</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right text-slate-300">
                            Categoria
                        </Label>
                        <Input id="category" name="category" placeholder="Ex: Aluguel" className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>

                    <div className="flex items-center space-x-2 ml-[25%] mb-2">
                        <input type="checkbox" id="isBill" name="isBill" className="h-4 w-4 rounded border-slate-700 bg-slate-800" checked={isBill} onChange={(e) => setIsBill(e.target.checked)} />
                        <label htmlFor="isBill" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300">
                            É um Boleto/Conta?
                        </label>
                    </div>

                    {isBill && (
                        <>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dueDate" className="text-right text-slate-300">
                                    Vencimento
                                </Label>
                                <Input id="dueDate" name="dueDate" type="date" required className="col-span-3 bg-slate-800 border-slate-700 text-white" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="barcode" className="text-right text-slate-300">
                                    Código Barras
                                </Label>
                                <Input id="barcode" name="barcode" className="col-span-3 bg-slate-800 border-slate-700" />
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
