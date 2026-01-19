import Link from "next/link";
import { Button } from "@/shared/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Adega Manager
                    </h1>
                </div>
                <nav className="flex-1 px-4 space-y-2 py-4">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                            Dashboard
                        </Button>
                    </Link>
                    <Link href="/admin/products">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                            Produtos
                        </Button>
                    </Link>
                    <Link href="/admin/sales">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                            Vendas
                        </Button>
                    </Link>
                    <Link href="/admin/promotions">
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                            Promoções
                        </Button>
                    </Link>
                    <div className="pt-4 border-t border-slate-800 mt-4">
                        <Link href="/pos">
                            <Button variant="outline" className="w-full justify-start border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
                                Ir para o PDV
                            </Button>
                        </Link>
                    </div>
                </nav>
                <div className="p-4 border-t border-slate-800 text-sm text-slate-600">
                    v1.0.0
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-8 bg-slate-950 text-slate-100">
                {children}
            </main>
        </div>
    );
}
