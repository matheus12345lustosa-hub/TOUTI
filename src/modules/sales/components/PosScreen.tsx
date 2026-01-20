"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Trash2, Package, Monitor, User, AlertCircle, Plus, ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { useCartStore } from "../store/cartStore";
import { useCashStore } from "../store/cashStore";
import { productService } from "@/modules/catalog/services/productService";
import { CashOpenModal } from "./CashOpenModal";
import { CashCloseModal } from "./CashCloseModal";
import { PaymentModal } from "./PaymentModal";
import { ClientSelector } from "./ClientSelector";
import { BranchSelector } from "@/components/BranchSelector";

export const PosScreen = () => {

    const router = useRouter();

    // Stores
    const { items: cart, addToCart, removeFromCart, total, clearCart, selectedClient } = useCartStore();
    const { isOpen: isCashOpen, addSale, cashRegisterId } = useCashStore();

    // States
    const [searchTerm, setSearchTerm] = useState("");
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mobileTab, setMobileTab] = useState<'products' | 'cart'>('products');
    const [checkoutError, setCheckoutError] = useState<string | null>(null);

    // Modals
    const [showCashModal, setShowCashModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);

    // Product List State
    const [products, setProducts] = useState<any[]>([]);

    // Sales Goal State
    const [goalData, setGoalData] = useState<{ goal: number, remaining: number } | null>(null);

    useEffect(() => {
        loadProducts();
        useCartStore.getState().fetchPromotions(); // Load promos
        fetchGoal();
    }, []);

    const fetchGoal = async () => {
        try {
            const res = await fetch('/api/user/goal');
            if (res.ok) {
                const data = await res.json();
                setGoalData(data);
            }
        } catch (err) {
            console.error("Failed to fetch goal", err);
        }
    };

    const loadProducts = async () => {
        const data = await productService.searchProducts("");
        setProducts(data);
    };

    // Auto-focus search on load
    useEffect(() => {
        if (isCashOpen) inputRef.current?.focus();
    }, [isCashOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F2") {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "F10") {
                e.preventDefault();
                if (cart.length > 0) handleFinalizeInitiate();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cart, isCashOpen]);

    const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setIsLoading(true);
            const product = await productService.getProductByBarcode(searchTerm);

            if (product) {
                handleAddToCart(product);
                setSearchTerm("");
            } else {
                const results = await productService.searchProducts(searchTerm);
                if (results.length > 0) {
                    // Start filtering if multiple, but here we just take first or show list
                    // Ideally we should filter the `products` state, but for POS speed we often assume precise search or barcode
                    // If no precise barcode, maybe just filter the visual list?
                    // For now, let's just add the first match if it's a good match, or filter
                    setProducts(results); // Update grid to show results
                } else {
                    // Demo Fallback (Optional)
                }
            }
            setIsLoading(false);
        }
    };

    const handleAddToCart = (product: any) => {
        addToCart({
            id: product.id.toString(),
            name: product.name,
            price: Number(product.price),
            quantity: 1,
            total: Number(product.price)
        });
        // Keep focus on input for rapid scanning
        setTimeout(() => inputRef.current?.focus(), 10);
    };

    const handleFinalizeInitiate = () => {
        if (!isCashOpen) {
            setShowCashModal(true);
            return;
        }
        setIsPaymentOpen(true);
    };

    const handlePaymentConfirm = async (payments: { method: string; amount: number }[]) => {
        setIsLoading(true);

        try {
            const currentBranchId = localStorage.getItem("touti_branchId");

            const res = await fetch('/api/sales/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    total: total(),
                    cashRegisterId: cashRegisterId,
                    payments: payments, // Send array
                    userId: "placeholder-user-id",
                    clientId: selectedClient?.id,
                    branchId: currentBranchId
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Erro no checkout");
            }
            const sale = await res.json();

            addSale(total());
            clearCart();
            setIsPaymentOpen(false);
            fetchGoal(); // Update goal progress

            // Send update to Customer Monitor
            const channel = new BroadcastChannel("pdv_channel");
            channel.postMessage({ type: "UPDATE_CART", items: [] });
            channel.close();

        } catch (error: any) {
            console.error(error);
            setCheckoutError(error.message || "Falha ao processar venda.");
        } finally {
            setIsLoading(false);
        }
    };

    // Sync cart with Monitor
    useEffect(() => {
        const channel = new BroadcastChannel("pdv_channel");
        channel.postMessage({ type: "UPDATE_CART", items: cart });
        return () => channel.close();
    }, [cart]);

    const subtotal = total();

    return (
        <div className="h-screen w-full bg-rose-50 flex flex-col md:flex-row overflow-hidden font-sans text-slate-800 relative text-xs">

            {/* Modals */}
            {showCashModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="relative">
                        <CashOpenModal />
                        <Button
                            variant="ghost"
                            className="absolute top-2 right-2 text-slate-400 hover:text-rose-500"
                            onClick={() => setShowCashModal(false)}
                        >
                            X
                        </Button>
                    </div>
                </div>
            )}

            <CashCloseModal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} />

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    setCheckoutError(null);
                }}
                total={subtotal}
                onConfirm={handlePaymentConfirm}
                isLoading={isLoading}
                errorMessage={checkoutError}
            />

            {/* Mobile Tab Switcher */}
            <div className="md:hidden h-12 bg-white border-b border-rose-100 flex items-center justify-around shrink-0 z-30">
                <button
                    onClick={() => setMobileTab('products')}
                    className={`flex flex-col items-center justify-center h-full w-1/2 border-b-2 transition-colors text-[10px] font-medium ${mobileTab === 'products' ? 'border-rose-500 text-rose-500 bg-rose-50' : 'border-transparent text-slate-400'}`}
                >
                    <Package className="h-4 w-4 mb-0.5" />
                    PRODUTOS
                </button>
                <div className="h-6 w-px bg-rose-100"></div>
                <button
                    onClick={() => setMobileTab('cart')}
                    className={`flex flex-col items-center justify-center h-full w-1/2 border-b-2 transition-colors relative text-[10px] font-medium ${mobileTab === 'cart' ? 'border-rose-500 text-rose-500 bg-rose-50' : 'border-transparent text-slate-400'}`}
                >
                    <ShoppingCart className="h-4 w-4 mb-0.5" />
                    CARRINHO
                    {cart.length > 0 && (
                        <span className="absolute top-1.5 right-10 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                            {cart.length}
                        </span>
                    )}
                </button>
            </div>

            {/* LEFT COLUMN: PRODUCTS & SEARCH */}
            <div className={`${mobileTab === 'products' ? 'flex' : 'hidden'} md:flex flex-1 flex-col p-3 gap-3 border-r border-rose-100 bg-rose-50/50 h-full overflow-hidden`}>

                {/* Header */}
                <header className="flex justify-between items-center shrink-0 h-10">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-500 hover:text-rose-600 hover:bg-rose-100 rounded-full"
                            onClick={() => router.push('/')}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-lg font-bold tracking-tight text-rose-900 hidden sm:block font-serif italic">Touti PDV</h1>

                        {/* Sales Goal Display */}
                        {goalData && goalData.goal > 0 && (
                            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white border border-rose-100 rounded-full shadow-sm ml-4">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Meta Mensal</span>
                                    <span className="text-xs font-bold text-slate-700">R$ {goalData.goal.toFixed(2)}</span>
                                </div>
                                <div className="h-4 w-px bg-rose-100 mx-1"></div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Falta</span>
                                    <span className={`text-xs font-bold ${goalData.remaining > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {goalData.remaining > 0 ? `R$ ${goalData.remaining.toFixed(2)}` : 'BATIDA! 🎉'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <BranchSelector />
                        {/* Close Register Button */}
                        {isCashOpen && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-rose-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors hidden sm:flex"
                                onClick={() => setShowCloseModal(true)}
                            >
                                <LogOut className="h-3.5 w-3.5 mr-2" />
                                Fechar Caixa
                            </Button>
                        )}

                        <Badge variant={isCashOpen ? "default" : "destructive"} className={`h-6 px-2.5 text-[10px] font-bold tracking-wide pointer-events-none ${isCashOpen ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-600 border-red-200"}`}>
                            {isCashOpen ? "CAIXA ABERTO" : "CAIXA FECHADO"}
                        </Badge>
                    </div>
                </header>

                {/* Search Bar - Larger Touch Target */}
                {/* Search Bar - Larger Touch Target */}
                <div className="relative shrink-0 flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${isLoading ? "text-rose-500 animate-spin" : "text-slate-400"}`} />
                        <Input
                            ref={inputRef}
                            className="pl-12 h-12 text-base md:text-lg bg-white border-rose-100 focus-visible:ring-2 focus-visible:ring-rose-400 hover:border-rose-300 transition-all rounded-lg shadow-sm text-slate-800 placeholder:text-slate-400"
                            placeholder="Buscar produto ou código (F2)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            disabled={!isCashOpen}
                        />
                    </div>
                    {!isCashOpen && (
                        <Button onClick={() => setShowCashModal(true)} size="lg" className="h-12 w-full sm:w-auto text-sm px-6 font-bold uppercase rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                            Abrir Caixa
                        </Button>
                    )}
                </div>

                {/* Product Grid - Touch Friendly (Larger Cards) */}
                <div className="flex-1 overflow-y-auto pr-1 pb-16 md:pb-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                onClick={() => isCashOpen && handleAddToCart(product)}
                                className={`
                                    bg-white border-rose-50 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-100
                                    cursor-pointer transition-all active:scale-95 duration-100 group
                                    ${!isCashOpen && "opacity-40 grayscale pointer-events-none"}
                                    rounded-lg overflow-hidden shadow-sm text-slate-800
                                `}
                            >
                                <CardContent className="p-0 flex flex-col h-full">
                                    {/* Image Container - Aspect Ratio 4/3 or Square */}
                                    <div className="aspect-[4/3] w-full bg-white flex items-center justify-center relative overflow-hidden border-b border-rose-50">
                                        {product.imageUrl ? (
                                            <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-60 transition-opacity">
                                                <Package className="h-10 w-10 text-rose-300" />
                                            </div>
                                        )}
                                        {/* Quick Add Overlay */}
                                        <div className="absolute inset-0 bg-rose-900/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[1px]">
                                            <div className="bg-white rounded-full p-2 shadow-lg">
                                                <Plus className="h-6 w-6 text-rose-600" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 flex flex-col justify-between flex-1 bg-white">
                                        <span className="font-semibold text-xs text-slate-700 line-clamp-2 leading-tight min-h-[2.5em]" title={product.name}>
                                            {product.name}
                                        </span>
                                        <div className="mt-2 pt-2 border-t border-rose-50 flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-400">Unidade</span>
                                                <span className="font-bold text-sm text-rose-600">R$ {Number(product.price).toFixed(2)}</span>
                                            </div>
                                            {/* Stock Badge could go here */}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: CART & ACTIONS */}
            <div className={`${mobileTab === 'cart' ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] lg:w-[380px] bg-white md:border-l border-rose-100 flex-col h-full shadow-xl shadow-rose-100 z-20`}>

                {/* Cart Header */}
                <div className="h-14 border-b border-rose-100 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-2.5 text-rose-600">
                        <div className="p-1.5 bg-rose-50 rounded-md">
                            <ShoppingCart className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-xs tracking-wide uppercase text-slate-700">Carrinho</span>
                    </div>
                    {/* Client Selector */}
                    <div className="flex items-center gap-2">
                        <ClientSelector />
                    </div>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-rose-200 bg-rose-50/30 p-2 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 opacity-70">
                            <div className="h-20 w-20 rounded-full bg-rose-100/50 flex items-center justify-center">
                                <ShoppingCart className="h-8 w-8 text-rose-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-slate-600">Seu carrinho está vazio</p>
                                <p className="text-xs text-slate-400 mt-1">Bipe produtos ou selecione ao lado</p>
                            </div>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="group relative flex items-center gap-3 p-3 bg-white border border-rose-100 rounded-lg hover:border-rose-300 transition-all shadow-sm">
                                {/* Quantity Control */}
                                <div className="flex flex-col items-center gap-1 bg-rose-50 rounded border border-rose-100 p-0.5">
                                    <span className="text-xs font-bold text-rose-700 w-6 text-center py-1">{item.quantity}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-800 truncate leading-snug">{item.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.promotionApplied ? (
                                            <>
                                                <span className="text-xs text-slate-400 line-through">R$ {item.price.toFixed(2)}</span>
                                                <span className="text-xs text-emerald-600 font-bold">R$ {(item.total / item.quantity).toFixed(2)}</span>
                                                <Badge variant="outline" className="h-4 px-1 text-[8px] bg-emerald-50 border-0 text-emerald-600 ml-1">
                                                    PROMO
                                                </Badge>
                                            </>
                                        ) : (
                                            <span className="text-xs text-slate-500">Unit: R$ {item.price.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-1">
                                    <span className="font-bold text-sm text-rose-700">R$ {item.total.toFixed(2)}</span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Actions */}
                <div className="bg-white p-4 border-t border-rose-100 space-y-4 shrink-0 shadow-[0_-5px_20px_rgba(255,182,193,0.3)] z-30">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-slate-500 text-xs">
                            <span className="uppercase tracking-wider font-semibold">Descontos</span>
                            <span>R$ 0,00</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-800">TOTAL A PAGAR</span>
                            <span className="text-2xl font-black text-rose-600 tabular-nums tracking-tight">
                                R$ {subtotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 h-12">
                        <Button
                            variant="outline"
                            className="col-span-1 h-full border-rose-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-lg flex flex-col items-center justify-center gap-0 p-0"
                            onClick={() => clearCart()}
                            disabled={cart.length === 0}
                        >
                            <Trash2 className="h-4 w-4 mb-0.5" />
                            <span className="text-[9px] font-bold uppercase">Limpar</span>
                        </Button>

                        <Button
                            onClick={handleFinalizeInitiate}
                            className={`col-span-3 h-full text-sm font-bold uppercase tracking-wide rounded-lg active:scale-[0.98] transition-all shadow-lg ${!isCashOpen ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"}`}
                        >
                            {!isCashOpen ? "ABRIR CAIXA" : "FINALIZAR (F10)"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
