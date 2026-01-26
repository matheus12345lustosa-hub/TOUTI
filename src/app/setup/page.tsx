"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";

export default function SetupPage() {
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState(false);

    async function runFix() {
        setLoading(true);
        try {
            const res = await fetch("/api/setup-admin");
            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (e: any) {
            setResult("Erro ao conectar: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md space-y-6">
                <h1 className="text-2xl font-bold text-rose-600">Reparo de Acesso (Admin)</h1>
                <p className="text-slate-600">
                    Clique abaixo para forçar a criação do usuário Admin no banco de dados atual.
                </p>

                <Button
                    onClick={runFix}
                    disabled={loading}
                    className="w-full h-12 text-lg bg-rose-600 hover:bg-rose-700 text-white"
                >
                    {loading ? "Corrigindo..." : "CORRIGIR ACESSO AGORA"}
                </Button>

                {result && (
                    <div className="p-4 bg-slate-100 rounded border border-slate-200 overflow-auto max-h-60">
                        <pre className="text-xs text-slate-800 whitespace-pre-wrap">{result}</pre>
                    </div>
                )}

                <div className="text-center pt-4">
                    <a href="/login" className="text-rose-600 underline">Voltar para Login</a>
                </div>
            </div>
        </div>
    );
}
