"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { CreditCard, Banknote, QrCode, Check, X, Plus, Trash2 } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (payments: { method: string; amount: number }[]) => void;
    isLoading?: boolean;
    errorMessage?: string | null;
}

interface Payment {
    id: string;
    method: "cash" | "card" | "pix" | "debit" | "credit";
    amount: number;
}

export const PaymentModal = ({ isOpen, onClose, total, onConfirm, isLoading = false, errorMessage = null }: PaymentModalProps) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [leftToPay, setLeftToPay] = useState(total);
    const [change, setChange] = useState(0);

    // Initial State: 100% in CASH
    useEffect(() => {
        if (isOpen) {
            setPayments([{ id: "init-cash", method: "cash", amount: total }]);
            setLeftToPay(0);
            setChange(0);
        }
    }, [isOpen, total]);

    // Recalculate totals whenever payments change
    useEffect(() => {
        const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);

        if (totalPaid >= total) {
            setLeftToPay(0);
            // Only calculate change if there is CASH involved
            const cashPayment = payments.find(p => p.method === "cash")?.amount || 0;
            const nonCashTotal = totalPaid - cashPayment;

            // Change is what remains from CASH after covering the rest
            // Actually simpler: Total Paid - Total Sale. But logic says change comes from cash.
            // If I pay 50 card + 50 cash for a 80 sale. 
            // Paid 100. Change 20. Correct.
            setChange(totalPaid - total);
        } else {
            setLeftToPay(total - totalPaid);
            setChange(0);
        }
    }, [payments, total]);

    if (!isOpen) return null;

    const handleUpdateAmount = (id: string, newAmount: string) => {
        const val = Number(newAmount); // Allow typing, validate later if needed
        setPayments(prev => prev.map(p => p.id === id ? { ...p, amount: val } : p));
    };

    const handleAddPayment = (method: "cash" | "card" | "pix") => {
        if (leftToPay <= 0.01) return;

        // Add new payment with the remaining amount
        setPayments(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            method,
            amount: leftToPay
        }]);
    };

    const handleRemovePayment = (id: string) => {
        setPayments(prev => prev.filter(p => p.id !== id));
    };

    const handleConfirm = () => {
        // Validate
        const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
        if (totalPaid < total - 0.01) { // Floating point tolerance
            return; // Cannot finish if missing money
        }

        // Transform for parent
        const payload = payments.map(p => ({
            method: p.method === 'card' ? 'CREDIT_CARD' : p.method === 'pix' ? 'PIX' : 'CASH', // Simple mapping for now
            amount: p.amount
        }));

        onConfirm(payload);
    };

    const getIcon = (method: string) => {
        switch (method) {
            case "cash": return <Banknote className="h-4 w-4" />;
            case "card": return <CreditCard className="h-4 w-4" />;
            case "pix": return <QrCode className="h-4 w-4" />;
            default: return <Banknote className="h-4 w-4" />;
        }
    };

    const getLabel = (method: string) => {
        switch (method) {
            case "cash": return "Dinheiro";
            case "card": return "Cartão";
            case "pix": return "PIX";
            default: return method;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />

            <div className="relative bg-white w-full max-w-lg rounded-xl shadow-2xl border border-rose-100 overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-rose-100 bg-rose-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Pagamento Misto</h2>
                        <p className="text-xs text-slate-500">Adicione múltiplas formas de pagamento</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs text-slate-500 uppercase font-medium">Total a Pagar</span>
                        <span className="text-3xl font-bold text-rose-600">R$ {total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">

                    {errorMessage && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <X className="h-4 w-4" />
                            {errorMessage}
                        </div>
                    )}

                    {/* Left to Pay Indicator */}
                    {leftToPay > 0.01 ? (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex justify-between items-center animate-pulse">
                            <span className="text-amber-600 font-bold uppercase text-sm">Faltando</span>
                            <span className="text-2xl font-bold text-amber-600">R$ {leftToPay.toFixed(2)}</span>
                        </div>
                    ) : change > 0 && (
                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex justify-between items-center">
                            <span className="text-emerald-600 font-bold uppercase text-sm">Troco</span>
                            <span className="text-3xl font-bold text-emerald-600">R$ {change.toFixed(2)}</span>
                        </div>
                    )}

                    {/* Payments List */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagamentos Adicionados</label>

                        {payments.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-rose-100 hover:border-rose-200 transition-colors shadow-sm">
                                <div className={`p-2 rounded-full ${p.method === 'cash' ? 'bg-emerald-100 text-emerald-600' : p.method === 'pix' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {getIcon(p.method)}
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-slate-800 block">{getLabel(p.method)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-sm">R$</span>
                                    <Input
                                        type="number"
                                        className="w-28 text-right font-bold bg-white border-rose-200 text-slate-800 focus:border-emerald-500 h-10 shadow-sm"
                                        value={p.amount}
                                        onChange={(e) => handleUpdateAmount(p.id, e.target.value)}
                                        autoFocus={p.method === 'cash' && payments.length === 1} // Autofocus only on initial cash
                                    />
                                    {payments.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => handleRemovePayment(p.id)} className="text-slate-400 hover:text-red-500 w-8 h-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Payment Buttons (Only if money is missing) */}
                    {leftToPay > 0.01 && (
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            <Button variant="outline" onClick={() => handleAddPayment('cash')} className="border-rose-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 h-10 gap-2 text-slate-600">
                                <Plus className="h-3 w-3" /> Dinheiro
                            </Button>
                            <Button variant="outline" onClick={() => handleAddPayment('card')} className="border-rose-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 h-10 gap-2 text-slate-600">
                                <Plus className="h-3 w-3" /> Cartão
                            </Button>
                            <Button variant="outline" onClick={() => handleAddPayment('pix')} className="border-rose-200 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 h-10 gap-2 text-slate-600">
                                <Plus className="h-3 w-3" /> PIX
                            </Button>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3 bg-white border-t border-rose-100 mt-auto pt-6">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-14 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-bold" disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className="flex-[2] h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg shadow-lg shadow-emerald-200"
                        disabled={isLoading || leftToPay > 0.01}
                    >
                        {isLoading ? "Processando..." : (change > 0 ? `Finalizar (Troco: R$ ${change.toFixed(2)})` : "Finalizar Venda")}
                    </Button>
                </div>
            </div>
        </div>
    );
};
