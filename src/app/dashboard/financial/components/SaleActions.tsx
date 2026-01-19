"use client";

import { useState } from "react";
import { Trash2, Loader2, RefreshCw } from "lucide-react"; // Using generic icons or X
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";

interface SaleActionsProps {
    saleId: string;
    status: string;
}

export function SaleActions({ saleId, status }: SaleActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleCancel = async () => {
        if (!confirm("Tem certeza que deseja cancelar esta venda? O estoque será estornado.")) return;

        setIsLoading(true);
        try {
            const res = await fetch(`/api/sales/${saleId}/cancel`, {
                method: 'POST'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Erro ao cancelar");
            }

            // Refresh the page data
            router.refresh();
        } catch (error) {
            alert("Erro ao cancelar venda (verifique console).");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'CANCELLED') {
        return <span className="text-[10px] text-red-500 font-bold uppercase">Cancelada</span>;
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-6 px-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 text-[10px]"
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
                <Trash2 className="h-3 w-3 mr-1" />
            )}
            Cancelar
        </Button>
    );
}
