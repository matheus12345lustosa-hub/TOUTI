"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/shared/ui/button";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-rose-50/30 text-slate-800 font-sans">
            {/* Desktop Sidebar */}
            <AdminSidebar className="hidden md:flex w-64 fixed inset-y-0 left-0 z-50 shadow-sm" />

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    {/* Sidebar */}
                    <AdminSidebar
                        className="fixed inset-y-0 left-0 w-3/4 max-w-xs animate-in slide-in-from-left duration-300 shadow-xl"
                        onClose={() => setIsMobileMenuOpen(false)}
                    />
                </div>
            )}

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
                {/* Mobile Header */}
                <header className="sticky top-0 z-40 md:hidden border-b border-rose-100 bg-white/80 backdrop-blur-md px-4 h-16 flex items-center justify-between shadow-sm">
                    <span className="text-xl font-serif font-bold text-rose-600 italic tracking-wider">
                        Touti
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="text-slate-500 hover:text-rose-600"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
