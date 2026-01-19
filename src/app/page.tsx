import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { ShoppingBag, Lock, BarChart3, TrendingUp, ShieldCheck } from "lucide-react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-rose-50/30 font-sans text-slate-900 selection:bg-rose-500/30">

            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-rose-200/40 rounded-full blur-[120px] -z-10 opacity-60 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-white/60 rounded-full blur-[100px] -z-10 opacity-50" />

            <div className="w-full max-w-4xl px-6 relative z-10 flex flex-col items-center gap-12">

                {/* Header / Hero */}
                <div className="text-center space-y-6 animate-in slide-in-from-bottom-5 fade-in duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/50 border border-rose-200 backdrop-blur-md">
                        <ShieldCheck className="h-3 w-3 text-rose-600" />
                        <span className="text-[10px] font-bold tracking-widest text-rose-600 uppercase">Sistema de Gestão & PDV</span>
                    </div>

                    <div className="space-y-2">
                        <div className="mb-4 flex justify-center">
                            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center shadow-lg shadow-rose-100">
                                <span className="text-4xl">✨</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter text-rose-600 italic drop-shadow-sm">
                            Touti
                        </h1>
                        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                            Beleza e sofisticação na gestão do seu negócio. Vendas ágeis e controle financeiro completo.
                        </p>
                    </div>
                </div>

                {/* Main Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-150">

                    {/* Card PDV (Frente de Caixa) */}
                    <Link href="/pos" className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="relative h-full p-8 rounded-2xl border border-rose-100 bg-white shadow-sm hover:shadow-xl hover:bg-rose-50/50 transition-all hover:border-rose-300 hover:-translate-y-1 flex flex-col items-center text-center gap-4">
                            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-500 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(251,113,133,0.2)]">
                                <ShoppingBag className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Frente de Caixa</h2>
                                <p className="text-sm text-slate-500 group-hover:text-slate-600">PDV Rápido e Elegante</p>
                            </div>
                        </div>
                    </Link>

                    {/* Card Admin */}
                    <Link href="/dashboard" className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-rose-200 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                        <div className="relative h-full p-8 rounded-2xl border border-rose-100 bg-white shadow-sm hover:shadow-xl hover:bg-rose-50/50 transition-all hover:border-rose-300 hover:-translate-y-1 flex flex-col items-center text-center gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 group-hover:scale-110 transition-transform duration-300">
                                <BarChart3 className="h-10 w-10" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-slate-800 group-hover:text-rose-600 transition-colors">Administração</h2>
                                <p className="text-sm text-slate-500 group-hover:text-slate-600">Gestão, Estoque e Relatórios</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Footer / Status */}
                <div className="flex flex-col items-center gap-4 animate-in fade-in duration-1000 delay-300">
                    <div className="h-px w-24 bg-rose-200" />
                    <p className="text-xs text-slate-400 font-medium">
                        &copy; 2026 Touti Manager. Todos os direitos reservados.
                    </p>
                </div>

            </div>
        </main>
    );
}
