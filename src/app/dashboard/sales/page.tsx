import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Receipt } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/shared/ui/table";
import { getSales } from "./actions";
import { SaleActions } from "./components/SaleActions"; // Client Comp
import { SearchInput } from "./components/SearchInput";
import { Pagination } from "@/shared/ui/pagination";
import { format } from "date-fns";
import { Card, CardContent } from "@/shared/ui/card";

export const dynamic = 'force-dynamic';

export default async function SalesPage(props: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || "";
    const currentPage = Number(searchParams?.page) || 1;

    // Cookie
    const { cookies } = require("next/headers");
    const cookieStore = await cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    const { sales, totalPages, totalCount } = await getSales({
        page: currentPage,
        branchId,
        query
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Gerenciar Vendas</h1>
                        <p className="text-sm text-slate-500">
                            Visualize, edite ou cancele vendas realizadas.
                        </p>
                    </div>
                </div>
            </div>

            <Card className="border-rose-100 shadow-sm">
                <CardContent className="p-4">
                    {/* Filter Toolbar */}
                    <div className="flex gap-2 mb-4">
                        <SearchInput placeholder="Buscar por cliente ou ID..." />
                    </div>

                    <div className="rounded-md border border-rose-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-rose-50/50">
                                <TableRow>
                                    <TableHead className="font-semibold text-slate-500">ID / Data</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Cliente</TableHead>
                                    <TableHead className="font-semibold text-slate-500">Vendedor</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500">Valor</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-center">Pagamento</TableHead>
                                    <TableHead className="font-semibold text-slate-500 text-center">Status</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-500">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                            Nenhuma venda encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sales.map((sale) => (
                                        <TableRow key={sale.id} className="hover:bg-rose-50/20">
                                            <TableCell className="py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-mono text-xs text-slate-500">#{sale.id.slice(0, 8)}</span>
                                                    <span className="text-sm font-medium text-slate-700">
                                                        {format(sale.createdAt, "dd/MM/yyyy HH:mm")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 text-slate-600">
                                                {sale.client?.name || "Consumidor Final"}
                                            </TableCell>
                                            <TableCell className="py-3 text-slate-600">
                                                {sale.user?.name || "Sistema"}
                                            </TableCell>
                                            <TableCell className="text-right py-3 font-bold text-emerald-600">
                                                R$ {sale.total.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-center py-3">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {sale.paymentMethod || "N/A"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center py-3">
                                                {sale.status === 'CANCELLED' ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        Cancelado
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                        Concluído
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right py-3">
                                                <SaleActions sale={{
                                                    id: sale.id,
                                                    status: sale.status,
                                                    paymentMethod: sale.paymentMethod,
                                                    items: sale.items.map(() => ({})) // Only length is used
                                                }} />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        baseUrl="/dashboard/sales"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
