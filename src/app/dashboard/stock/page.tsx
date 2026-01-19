"use client"

import Link from "next/link";
import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { StockAdjustmentCard } from "./StockAdjustmentCard";

export default function StockPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setLogs([]);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setStatus('uploading');
        setLogs(["Lendo arquivo XML..."]);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const xmlContent = e.target?.result as string;

            try {
                const res = await fetch('/api/stock/import-xml', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ xmlContent })
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Erro na importação");

                setStatus('success');
                setLogs(prev => [...prev, `Sucesso! ${data.productsProcessed} produtos processados.`]);
            } catch (error: any) {
                console.error(error);
                setStatus('error');
                setLogs(prev => [...prev, `Erro: ${error.message}`]);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Estoque & Importação</h1>
                    <p className="text-slate-500">Gerencie a entrada de produtos via XML (NFe).</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* XML Import Card */}
                <Card className="bg-white border-rose-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Importar XML da Nota Fiscal
                        </CardTitle>
                        <CardDescription className="text-slate-500">
                            Faça upload do XML da NFe para cadastrar produtos e atualizar estoque automaticamente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-2 border-dashed border-rose-200 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-rose-50/30 transition-colors bg-rose-50/10">
                            <Upload className="h-8 w-8 text-rose-400 mb-2" />
                            <label htmlFor="xml-upload" className="cursor-pointer">
                                <span className="text-rose-600 font-bold hover:underline">Clique para selecionar</span>
                                <span className="text-slate-500"> ou arraste o arquivo aqui</span>
                                <input
                                    id="xml-upload"
                                    type="file"
                                    accept=".xml"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                            {file && <p className="mt-2 text-sm text-slate-700 font-medium">{file.name}</p>}
                        </div>

                        <Button
                            onClick={handleImport}
                            disabled={!file || status === 'uploading'}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-sm font-semibold"
                        >
                            {status === 'uploading' ? 'Processando...' : 'Processar XML'}
                        </Button>

                        {/* Status Logs */}
                        {logs.length > 0 && (
                            <div className={`p-4 rounded-md text-sm border ${status === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                {logs.map((log, i) => (
                                    <p key={i} className="flex items-center gap-2">
                                        {status === 'success' ? <CheckCircle className="h-4 w-4" /> : status === 'error' ? <AlertTriangle className="h-4 w-4" /> : null}
                                        {log}
                                    </p>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Manual Adjustment Card */}
                <StockAdjustmentCard />
            </div>
        </div>
    );
}
