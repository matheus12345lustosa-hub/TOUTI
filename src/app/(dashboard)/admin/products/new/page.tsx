"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get("name"),
            price: Number(formData.get("price")),
            stock: Number(formData.get("stock")),
            barcode: formData.get("barcode"),
        }

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error("Failed to create product")

            router.push("/admin/products")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Erro ao criar produto")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Novo Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="name" className="text-sm font-medium">Nome do Produto</label>
                            <Input id="name" name="name" required placeholder="Ex: Coca Cola" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="price" className="text-sm font-medium">Preço (R$)</label>
                                <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" />
                            </div>
                            <div className="grid gap-2">
                                <label htmlFor="stock" className="text-sm font-medium">Estoque Inicial</label>
                                <Input id="stock" name="stock" type="number" required placeholder="0" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="barcode" className="text-sm font-medium">Código de Barras</label>
                            <Input id="barcode" name="barcode" required placeholder="Scan ou digite" />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {loading ? "Salvando..." : "Salvar Produto"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
