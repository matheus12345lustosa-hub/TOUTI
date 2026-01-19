import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cashService } from '../services/cashService';

interface CashState {
    isOpen: boolean;
    initialAmount: number;
    currentAmount: number;
    cashRegisterId: string | null;
    isLoading: boolean;
    openCash: (initialAmount: number) => Promise<void>;
    closeCash: () => void;
    addSale: (amount: number) => void;
}

export const useCashStore = create<CashState>()(
    persist(
        (set) => ({
            isOpen: false,
            initialAmount: 0,
            currentAmount: 0,
            cashRegisterId: null,
            isLoading: false,
            openCash: async (amount) => {
                set({ isLoading: true });
                const register = await cashService.openCashRegister(amount, "user-placeholder-id");
                if (register) {
                    set({
                        isOpen: true,
                        initialAmount: amount,
                        currentAmount: amount,
                        cashRegisterId: register.id,
                        isLoading: false
                    });
                } else {
                    set({ isLoading: false });
                    // Handle error (mock for now)
                    alert("Erro ao abrir caixa no servidor");
                }
            },
            closeCash: () => set({ isOpen: false, initialAmount: 0, currentAmount: 0, cashRegisterId: null }),
            addSale: (amount) => set((state) => ({ currentAmount: state.currentAmount + amount })),
        }),
        {
            name: 'cash-storage',
        }
    )
);
