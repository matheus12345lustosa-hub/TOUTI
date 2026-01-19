"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Image as ImageIcon, Plus, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

interface MediaGalleryProps {
    onSelect: (url: string) => void;
    currentUrl?: string;
}

export function MediaGallery({ onSelect, currentUrl }: MediaGalleryProps) {
    const [images, setImages] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchImages();
        }
    }, [isOpen]);

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/media');
            const data = await res.json();
            if (Array.isArray(data)) setImages(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddImage = async () => {
        if (!newUrl) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: newUrl, name: 'Nova Imagem' })
            });
            if (res.ok) {
                setNewUrl("");
                fetchImages();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="flex flex-col gap-2">
                    <div className="w-32 h-32 border-2 border-dashed border-rose-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-rose-50 transition-colors relative overflow-hidden bg-white">
                        {currentUrl ? (
                            <img src={currentUrl} alt="Selected" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-slate-400">
                                <ImageIcon className="h-8 w-8 mb-1" />
                                <span className="text-xs">Selecionar</span>
                            </div>
                        )}
                    </div>
                    {currentUrl && (
                        <Button type="button" variant="outline" size="sm" className="w-32 text-xs" onClick={(e) => { e.stopPropagation(); onSelect(""); }}>
                            Remover
                        </Button>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Galeria de Imagens</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="library" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="bg-rose-50 w-full justify-start">
                        <TabsTrigger value="library">Biblioteca</TabsTrigger>
                        <TabsTrigger value="add">Adicionar Nova</TabsTrigger>
                    </TabsList>

                    <TabsContent value="library" className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="aspect-square border border-rose-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-rose-400 relative group"
                                    onClick={() => {
                                        onSelect(img.url);
                                        setIsOpen(false);
                                    }}
                                >
                                    <img src={img.url} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Check className="text-white h-6 w-6" />
                                    </div>
                                </div>
                            ))}
                            {images.length === 0 && (
                                <div className="col-span-full text-center py-10 text-slate-400">
                                    Nenhuma imagem salva.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="add" className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">URL da Imagem</label>
                            <div className="flex gap-2">
                                <Input
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="https://exemplo.com/foto.jpg"
                                    className="bg-white"
                                />
                                <Button onClick={handleAddImage} disabled={isLoading || !newUrl} className="bg-rose-600 text-white">
                                    {isLoading ? "Salvando..." : <Plus className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                Cole o link de uma imagem da internet. Futuramente teremos upload de arquivos.
                            </p>
                        </div>
                        {newUrl && (
                            <div className="mt-4 border border-rose-100 rounded-lg p-2 flex justify-center bg-rose-50/20">
                                <img src={newUrl} alt="Preview" className="max-h-40 object-contain rounded" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
