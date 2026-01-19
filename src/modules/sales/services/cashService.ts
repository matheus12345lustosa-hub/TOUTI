import { CashRegister } from "@prisma/client";

export const cashService = {
    openCashRegister: async (initialAmount: number, operatorId: string): Promise<CashRegister | null> => {
        try {
            const res = await fetch('/api/sales/open', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initialAmount, operatorId })
            });

            if (!res.ok) throw new Error('Failed to open cash');
            return await res.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    },

    // TODO: closeCashRegister
};
