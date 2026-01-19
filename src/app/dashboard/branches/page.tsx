"use client";

import { useState, useEffect } from "react";
import { Plus, Building2, MapPin, Phone, Search, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";

interface Branch {
    id: string;
    name: string;
    address: string | null;
    phone: string | null;
    createdAt: string;
}

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Form States
    const [newName, setNewName] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await fetch("/api/branches");
            const data = await res.json();
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/branches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newName,
                    address: newAddress,
                    phone: newPhone
                })
            });

            if (res.ok) {
                setNewName("");
                setNewAddress("");
                setNewPhone("");
                setIsDialogOpen(false);
                fetchBranches();
            } else {
                alert("Erro ao criar filial");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao criar filial");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta filial?")) return;

        try {
            const res = await fetch(`/api/branches/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                fetchBranches();
            } else {
                const data = await res.json();
                alert(data.error || "Erro ao excluir filial");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir filial");
        }
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        (b.address && b.address.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-rose-950 font-serif italic">Gerenciamento de Filiais</h1>
                    <p className="text-slate-500">Cadastre e visualize as unidades da sua rede.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Filial
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Nova Filial</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome da Filial</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Ex: Filial Centro"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    value={newPhone}
                                    onChange={e => setNewPhone(e.target.value)}
                                    placeholder="(00) 0000-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input
                                    id="address"
                                    value={newAddress}
                                    onChange={e => setNewAddress(e.target.value)}
                                    placeholder="Rua, Número, Bairro"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="bg-rose-600 text-white" disabled={isSubmitting}>
                                    {isSubmitting ? "Criando..." : "Criar Filial"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-rose-100 shadow-sm">
                <CardHeader className="pb-3 border-b border-rose-50">
                    <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            className="max-w-xs border-0 bg-rose-50/50 focus-visible:ring-0 placeholder:text-slate-400"
                            placeholder="Buscar filiais..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Carregando...</div>
                    ) : filteredBranches.length === 0 ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                            <Building2 className="h-12 w-12 mb-4 opacity-20" />
                            <p>Nenhuma filial encontrada.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-rose-50">
                            {filteredBranches.map((branch) => (
                                <div key={branch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-rose-50/30 transition-colors group">
                                    <div className="flex items-start sm:items-center gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800">{branch.name}</h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-slate-500 mt-0.5">
                                                {branch.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> {branch.phone}
                                                    </span>
                                                )}
                                                {branch.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {branch.address}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <Badge variant="outline" className="text-slate-400 border-slate-200 hidden md:inline-flex opacity-50 group-hover:opacity-100 transition-opacity">
                                            ID: {branch.id.substring(0, 8)}...
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                            onClick={() => handleDelete(branch.id)}
                                            title="Excluir Filial"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
