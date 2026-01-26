"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // To highlight active link
import {
    LayoutDashboard,
    Package,
    ArrowRightLeft,
    DollarSign,
    LogOut,
    Tag,
    X,
    Calendar,
    Users,
    Shield,
    Building2,
    ArrowLeft,
    ShoppingBag,
    Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import { BranchSelector } from "@/components/BranchSelector";

interface SidebarProps {
    className?: string; // For custom classes (e.g. mobile visibility)
    onClose?: () => void; // For closing mobile menu
}

export function AdminSidebar({ className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isActive = (path: string) => {
        return pathname === path || pathname.startsWith(path + "/");
    };

    const LinkItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
        <Link
            href={href}
            onClick={onClose}
            className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                isActive(href)
                    ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );

    return (
        <aside className={cn("flex flex-col h-full bg-white border-r border-rose-100/50 shadow-sm", className)}>
            <div className="h-16 flex items-center justify-between px-6 border-b border-rose-100">
                <span className="text-2xl font-serif font-bold text-rose-600 italic tracking-wider">
                    Touti
                </span>
                {/* Close button for mobile */}
                {onClose && (
                    <button onClick={onClose} className="md:hidden text-slate-400 hover:text-rose-500">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <LinkItem href="/dashboard" icon={LayoutDashboard} label="Visão Geral" />
                <LinkItem href="/dashboard/products" icon={Package} label="Produtos" />
                <LinkItem href="/dashboard/sales" icon={ShoppingBag} label="Vendas" />
                <LinkItem href="/dashboard/clients" icon={Users} label="Clientes" />
                <LinkItem href="/dashboard/team" icon={Shield} label="Equipe" />
                <LinkItem href="/dashboard/promotions" icon={Tag} label="Promoções" />
                <LinkItem href="/dashboard/stock" icon={ArrowRightLeft} label="Estoque & XML" />
                <LinkItem href="/dashboard/financial" icon={DollarSign} label="Financeiro" />
                <LinkItem href="/dashboard/branches" icon={Building2} label="Filiais" />
                <LinkItem href="/dashboard/meetings" icon={Calendar} label="Reuniões" />
                <div className="pt-2 pb-1">
                    <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Configurações</p>
                </div>
                <LinkItem href="/dashboard/settings/backup" icon={Database} label="Backup" />
            </nav>

            <div className="p-4 border-t border-rose-100 space-y-4">
                <div className="w-full">
                    <BranchSelector />
                </div>
                <div className="px-3 py-2 bg-rose-50 rounded-lg">
                    <p className="text-sm font-medium text-rose-900">{session?.user?.name || "Usuário"}</p>
                    <p className="text-xs text-rose-500 truncate">{session?.user?.email}</p>
                </div>
                <Link
                    href="/"
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Início
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </button>
            </div>
        </aside>
    );
}
