'use client';

import { Button } from "@/shared/ui/button";
import { Download, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { useState } from "react";

export default function BackupPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/backup');
            if (!res.ok) throw new Error("Erro ao gerar backup");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `touti-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            alert("Erro ao baixar backup. Verifique se você é admin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Backup de Dados</h1>
                <p className="text-slate-500">Salve cópias de segurança dos seus dados.</p>
            </div>

            <div className="grid gap-6">
                <Card className="border-emerald-100 shadow-sm">
                    <CardHeader className="bg-emerald-50/30">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <ShieldCheck className="h-5 w-5" />
                            <CardTitle>Backup Manual</CardTitle>
                        </div>
                        <CardDescription>
                            Gera um arquivo JSON contendo todos os clientes, vendas, produtos e estoque.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4">
                            <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-600 border border-slate-100">
                                <strong>Recomendação:</strong> Faça o download deste arquivo ao final de cada mês ou semana,
                                e salve em um local seguro (Google Drive, HD Externo, etc).
                            </div>

                            <Button
                                onClick={handleDownload}
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12"
                            >
                                <Download className="mr-2 h-5 w-5" />
                                {isLoading ? "Gerando Arquivo..." : "Baixar Cópia Completa dos Dados"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-amber-100 shadow-sm">
                    <CardHeader className="bg-amber-50/30">
                        <div className="flex items-center gap-2 text-amber-700">
                            <AlertTriangle className="h-5 w-5" />
                            <CardTitle>Sobre o Banco na Nuvem</CardTitle>
                        </div>
                        <CardDescription>
                            Informações importantes sobre a segurança dos seus dados na Vercel/Neon.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 text-sm text-slate-600 space-y-2">
                        <p>
                            Seu banco de dados (Neon Postgres) possui sistema próprio de recuperação e backups automáticos.
                            Este backup manual é uma <strong>camada extra de segurança</strong> para que você tenha a posse dos seus dados.
                        </p>
                        <p>
                            Em caso de catástrofe no servidor, este arquivo pode ser usado por um desenvolvedor para restaurar o sistema.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
