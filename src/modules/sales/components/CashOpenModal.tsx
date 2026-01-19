"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Lock } from "lucide-react";
import { useCashStore } from "../store/cashStore";

export const CashOpenModal = () => {
    const { isOpen, openCash } = useCashStore();
    const [amount, setAmount] = useState("");

    if (isOpen) return null;

    const handleOpen = async () => {
        await openCash(Number(amount));
    };

    return (
        <div className="w-full max-w-md">
            <Card className="w-full max-w-md border border-rose-100 bg-white text-slate-800 shadow-xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto bg-rose-50 p-4 rounded-full w-fit mb-4 border border-rose-100">
                        <Lock className="h-8 w-8 text-rose-500" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">Caixa Fechado</CardTitle>
                    <CardDescription className="text-slate-500">
                        Informe o fundo de troco para iniciar as operações.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-600">Fundo de Troco (R$)</label>
                        <Input
                            autoFocus
                            type="number"
                            className="text-center text-3xl h-16 font-bold bg-rose-50/30 border-rose-200 text-rose-600 placeholder:text-rose-300 focus-visible:ring-rose-200 focus:border-rose-400"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                        onClick={handleOpen}
                        disabled={!amount}
                    >
                        Abrir Caixa
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
