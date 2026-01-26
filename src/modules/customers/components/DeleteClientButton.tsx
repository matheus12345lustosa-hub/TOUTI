"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";

export function DeleteClientButton({ clientId }: { clientId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.error || "Erro ao excluir");
                return;
            }

            router.refresh();
        } catch (error) {
            alert("Erro ao excluir cliente");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
            title="Excluir Cliente"
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );
}
