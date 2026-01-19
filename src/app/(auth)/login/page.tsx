"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false
            });

            if (res?.error) {
                setError("Email ou senha inválidos.");
            } else {
                router.refresh();
                router.push(callbackUrl || "/dashboard");
            }
        } catch (err) {
            setError("Ocorreu um erro ao tentar entrar.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-rose-100 shadow-xl relative z-10">
            <CardHeader className="space-y-1 text-center pb-8 border-b border-rose-50">
                <div className="mx-auto w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">✨</span>
                </div>
                <CardTitle className="text-3xl font-serif font-bold text-rose-700 italic">
                    Touti
                </CardTitle>
                <CardDescription className="text-slate-500 font-light">
                    Área Administrativa
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-600 font-medium">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seunome@touti.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="bg-white border-slate-200 text-slate-800 focus:border-rose-400 focus:ring-rose-200 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-600 font-medium">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-white border-slate-200 text-slate-800 focus:border-rose-400 focus:ring-rose-200 h-11"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-md flex items-center justify-center">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium h-12 text-lg shadow-lg shadow-rose-200"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            "Acessar Sistema"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-rose-50/50 p-4 relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2576&auto=format&fit=crop')] bg-cover bg-center opacity-5 pointer-events-none"></div>

            <div className="absolute top-4 left-4 z-10">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-600 hover:text-rose-600 hover:bg-white/50">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Voltar para o Início
                    </Button>
                </Link>
            </div>

            <Suspense fallback={<div className="text-center font-bold text-rose-600">Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
