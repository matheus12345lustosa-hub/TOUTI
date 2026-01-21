'use client';

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { deleteProduct } from "./actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";

interface DeleteProductButtonProps {
    id: string;
    productName: string;
}

export function DeleteProductButton({ id, productName }: DeleteProductButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteProduct(id);
            if (!result.success) {
                alert(result.message);
            } else {
                setIsOpen(false);
            }
        } catch (error) {
            alert("Ocorreu um erro ao tentar excluir o produto.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50"
                onClick={() => setIsOpen(true)}
                title="Excluir Produto"
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Produto</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir o produto <strong>{productName}</strong>?
                            Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isDeleting}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirmar Exclusão
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
