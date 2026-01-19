import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { deleteExpense, markBillPaid } from "./actions";

// Helper for currency
const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
    // Cookie & Branch
    const { cookies } = require("next/headers");
    const cookieStore = await cookies();
    const branchId = cookieStore.get("touti_branchId")?.value;

    const expenses = await prisma.expense.findMany({
        orderBy: { date: 'desc' },
        where: branchId ? { branchId } : {},
        include: { bills: true },
        take: 100
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/financial">
                        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-rose-600">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Despesas</h1>
                        <p className="text-sm text-slate-500">Gerencie contas fixas, variáveis e boletos.</p>
                    </div>
                </div>
                <AddExpenseDialog />
            </div>

            <Card className="bg-white border-rose-100 shadow-sm hidden md:block">
                <CardHeader>
                    <CardTitle className="text-slate-800">Histórico de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-rose-50/50">
                            <TableRow className="border-rose-100 hover:bg-transparent">
                                <TableHead className="text-slate-500 font-semibold">Data e Descrição</TableHead>
                                <TableHead className="text-slate-500 font-semibold">Tipo</TableHead>
                                <TableHead className="text-slate-500 font-semibold">Boleto (Vcto)</TableHead>
                                <TableHead className="text-right text-slate-500 font-semibold">Valor</TableHead>
                                <TableHead className="text-right text-slate-500 font-semibold">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                    <TableCell className="text-slate-700">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{expense.description}</span>
                                            <span className="text-xs text-slate-500">
                                                {format(new Date(expense.date), 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded font-medium ${expense.type === 'FIXA' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                            }`}>
                                            {expense.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-xs">
                                        {expense.bills.map(bill => (
                                            <div key={bill.id} className="flex gap-2 items-center">
                                                <span>{format(new Date(bill.dueDate), 'dd/MM/yyyy')}</span>
                                                {bill.status === 'PAGO' ? (
                                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" /> PAGO
                                                    </span>
                                                ) : (
                                                    <form action={async () => {
                                                        'use server';
                                                        await markBillPaid(bill.id);
                                                    }}>
                                                        <button className="text-amber-600 underline hover:text-amber-700 font-medium">Pagar</button>
                                                    </form>
                                                )}
                                            </div>
                                        ))}
                                        {expense.bills.length === 0 && "-"}
                                    </TableCell>
                                    <TableCell className="text-right text-slate-800 font-bold">
                                        {formatCurrency(Number(expense.amount))}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <form action={async () => {
                                            'use server';
                                            await deleteExpense(expense.id);
                                        }}>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {expenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-slate-400 py-8">Nenhuma despesa lançada.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                <h3 className="font-bold text-slate-800 px-1">Histórico</h3>
                {expenses.map((expense) => (
                    <div key={expense.id} className="bg-white border border-rose-100 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-sm">{expense.description}</span>
                                <span className="text-xs text-slate-500">{format(new Date(expense.date), 'dd/MM/yyyy')}</span>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${expense.type === 'FIXA' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'
                                }`}>
                                {expense.type}
                            </span>
                        </div>

                        <div className="flex justify-between items-end border-t border-rose-50 pt-3">
                            <div className="flex flex-col gap-1">
                                {expense.bills.map(bill => (
                                    <div key={bill.id} className="text-xs flex items-center gap-2">
                                        <span className="text-slate-500">Vcto: {format(new Date(bill.dueDate), 'dd/MM')}</span>
                                        {bill.status === 'PAGO' ? (
                                            <span className="text-emerald-600 font-bold flex items-center gap-0.5 text-[10px]">
                                                <CheckCircle className="h-3 w-3" /> PAGO
                                            </span>
                                        ) : (
                                            <form action={async () => {
                                                'use server';
                                                await markBillPaid(bill.id);
                                            }}>
                                                <button className="text-amber-600 underline hover:text-amber-700 font-bold text-[10px] uppercase">Pagar</button>
                                            </form>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-slate-800">{formatCurrency(Number(expense.amount))}</div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <form action={async () => {
                                'use server';
                                await deleteExpense(expense.id);
                            }}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 w-full justify-end px-0">
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Excluir Lançamento
                                </Button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
