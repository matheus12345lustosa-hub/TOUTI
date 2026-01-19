"use client";

import { useState, useEffect } from "react";
import { Search, UserPlus, Check, X, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { useCartStore } from "../store/cartStore";

export function ClientSelector() {
    const { selectedClient, setClient } = useCartStore();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Create Form
    const [newClient, setNewClient] = useState({ name: "", cpf: "", phone: "", email: "" });

    useEffect(() => {
        if (!open) return;
        handleSearch();
    }, [search, open]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients?q=${search}`);
            if (res.ok) {
                const data = await res.json();
                setClients(data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const res = await fetch('/api/clients', {
            method: 'POST',
            body: JSON.stringify(newClient)
        });
        if (res.ok) {
            const client = await res.json();
            setClient(client);
            setOpen(false);
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-8 border-rose-200 bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300">
                    <User className="mr-2 h-4 w-4" />
                    {selectedClient ? selectedClient.name : "Selecionar Cliente"}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-rose-100 text-slate-800 sm:max-w-[500px] shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-rose-600 font-bold text-xl">{isCreating ? "Novo Cliente" : "Buscar Cliente"}</DialogTitle>
                </DialogHeader>

                {!isCreating ? (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nome, CPF ou Telefone..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200 placeholder:text-slate-400"
                            />
                            <Button onClick={() => setIsCreating(true)} className="bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-200">
                                <UserPlus className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-rose-100 bg-rose-50/30 hover:bg-rose-50 cursor-pointer transition-all"
                                    onClick={() => {
                                        setClient(client);
                                        setOpen(false);
                                    }}
                                >
                                    <div>
                                        <p className="font-semibold text-slate-800">{client.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{client.cpf || client.phone}</p>
                                    </div>
                                    {selectedClient?.id === client.id && <Check className="h-5 w-5 text-emerald-500" />}
                                </div>
                            ))}
                            {clients.length === 0 && !loading && (
                                <p className="text-center text-slate-500 text-sm py-8 italic bg-rose-50/20 rounded-lg">Nenhum cliente encontrado.</p>
                            )}
                        </div>
                        {selectedClient && (
                            <Button variant="ghost" className="w-full text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => setClient(null)}>
                                Desvincular Cliente
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <Input
                            placeholder="Nome Completo *"
                            value={newClient.name}
                            onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                        />
                        <Input
                            placeholder="CPF"
                            value={newClient.cpf}
                            onChange={e => setNewClient({ ...newClient, cpf: e.target.value })}
                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                        />
                        <Input
                            placeholder="Telefone"
                            value={newClient.phone}
                            onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                        />
                        <Input
                            placeholder="Email"
                            value={newClient.email}
                            onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                            className="bg-white border-rose-200 text-slate-800 focus-visible:ring-rose-200"
                        />
                        <div className="flex gap-2 justify-end pt-4 border-t border-rose-100">
                            <Button variant="ghost" onClick={() => setIsCreating(false)} className="text-slate-500 hover:text-slate-700">Cancelar</Button>
                            <Button onClick={handleCreate} disabled={!newClient.name} className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">
                                Salvar Cliente
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
