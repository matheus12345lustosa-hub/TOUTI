"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { AlertTriangle } from "lucide-react";
import { useCashStore } from "../store/cashStore";

interface CashCloseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CashCloseModal = ({ isOpen, onClose }: CashCloseModalProps) => {
    const { closeCash, currentAmount } = useCashStore();
    const [finalCount, setFinalCount] = useState("");

    if (!isOpen) return null;

    const handleCloseRegister = async () => {
        // Here we could calculate difference and save to DB
        // For MVP, we just close the store state
        closeCash();
        onClose();
        // Ideally we show a summary report here
        alert(`Caixa fechado!\nSistema: R$ ${currentAmount.toFixed(2)}\nContagem: R$ ${Number(finalCount).toFixed(2)}\nDiferença: R$ ${(Number(finalCount) - currentAmount).toFixed(2)}`);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border border-rose-100 bg-white text-slate-800 shadow-xl animate-in fade-in zoom-in duration-200">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-amber-50 p-4 rounded-full w-fit mb-4 border border-amber-100">
                        <AlertTriangle className="h-8 w-8 text-amber-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Fechar Caixa</CardTitle>
                    <CardDescription className="text-slate-500">
                        Realize a conferência cega dos valores.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-600">Valor em Gaveta (R$)</label>
                        <Input
                            autoFocus
                            type="number"
                            className="text-center text-3xl h-16 font-bold bg-white border-rose-200 text-slate-800 placeholder:text-slate-300 focus-visible:ring-amber-500 shadow-sm"
                            placeholder="0,00"
                            value={finalCount}
                            onChange={(e) => setFinalCount(e.target.value)}
                        />
                        <p className="text-[10px] text-center text-slate-400">
                            Não exibe o valor esperado para garantir conferência real.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 border-slate-200 hover:bg-slate-50 text-slate-600"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="lg"
                            className="h-14 text-lg font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100"
                            onClick={handleCloseRegister}
                            disabled={!finalCount}
                        >
                            Fechar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
