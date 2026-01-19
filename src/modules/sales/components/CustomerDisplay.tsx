"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ShoppingBag, QrCode } from "lucide-react";
import { CartItem } from "../store/cartStore";

export const CustomerDisplay = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [lastItem, setLastItem] = useState<CartItem | null>(null);

    useEffect(() => {
        const channel = new BroadcastChannel("pdv_channel");

        channel.onmessage = (event) => {
            if (event.data.type === "UPDATE_CART") {
                const newItems = event.data.items as CartItem[];
                setCart(newItems);

                if (newItems.length > 0) {
                    setLastItem(newItems[newItems.length - 1]);
                } else {
                    setLastItem(null);
                }
            }
        };

        return () => {
            channel.close();
        };
    }, []);

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);

    return (
        <div className="h-screen w-full bg-slate-950 text-white flex overflow-hidden font-sans">
            {/* Esquerda: Propaganda / Logo / QR Code */}
            <div className="w-1/3 min-w-[250px] bg-slate-900 border-r border-slate-800 flex flex-col p-4 items-center justify-between relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="z-10 text-center space-y-2 mt-4">
                    <div className="h-16 w-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/50">
                        <ShoppingBag className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                        Adega Cometas
                    </h1>
                </div>

                {/* QR Code Area */}
                <div className="z-10 w-full max-w-[180px] bg-white rounded-lg p-3 shadow-md">
                    <div className="aspect-square bg-slate-100 rounded flex items-center justify-center mb-1 border-2 border-dashed border-slate-300">
                        <QrCode className="h-20 w-20 text-slate-800 opacity-20" />
                    </div>
                    <p className="text-center text-slate-900 font-bold text-xs">Pague com PIX</p>
                </div>

                <div className="z-10 text-center text-slate-600 text-[10px]">
                    <p>Atendimento</p>
                    <p>(11) 99999-9999</p>
                </div>
            </div>

            {/* Direita: Lista de Itens e Totais */}
            <div className="flex-1 flex flex-col bg-slate-950">

                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm h-16">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-yellow-400 h-4 w-4" />
                        <span className="text-base font-medium text-slate-200">Sua Compra</span>
                    </div>
                    <div className="text-right leading-tight">
                        <p className="text-slate-500 text-[10px]">Itens</p>
                        <p className="text-lg font-bold">{cart.length}</p>
                    </div>
                </div>

                {/* Lista Scrollável */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                            <ShoppingBag className="h-10 w-10" />
                            <p className="text-sm font-light">Caixa Livre</p>
                        </div>
                    ) : (
                        cart.map((item, index) => (
                            <div
                                key={item.id}
                                className={`
                            flex items-center justify-between p-3 rounded-lg border transition-all duration-300
                            ${item.id === lastItem?.id
                                        ? 'bg-blue-600/20 border-blue-500/50 shadow-md'
                                        : 'bg-slate-900 border-slate-800'
                                    }
                        `}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-slate-500 text-xs w-4">{(index + 1).toString().padStart(2, '0')}</span>
                                    <div>
                                        <p className="text-sm font-bold text-slate-100 line-clamp-1">{item.name}</p>
                                        <p className="text-slate-400 text-xs">
                                            {item.quantity} x R$ {item.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right whitespace-nowrap pl-2">
                                    <p className="text-base font-bold text-white tracking-wide">R$ {item.total.toFixed(2)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Total */}
                <div className="bg-slate-900 p-4 border-t border-slate-800 shadow-lg z-20">
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">Total a Pagar</p>
                            <p className="text-green-500 text-[10px]">Obrigado!</p>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 tracking-tighter">
                                R$ {subtotal.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
