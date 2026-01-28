'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Calendar, Save, Tag, Percent, DollarSign, Layers } from 'lucide-react';
import { Button } from "@/shared/ui/button";
import { format } from 'date-fns';

interface Product {
    id: string;
    name: string;
    price: number;
}

interface Tier {
    quantity: number;
    price: number;
}

interface Promotion {
    id: string;
    name: string;
    type: string;
    minQuantity: number;
    promotionalPrice?: number;
    discountPercent?: number;
    discountAmount?: number;
    tiers?: Tier[];
    validUntil?: string;
    product: {
        name: string;
    };
}

export default function PromotionsPage() {
    const router = useRouter();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [type, setType] = useState('UNITY_PRICE');
    const [productId, setProductId] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [minQuantity, setMinQuantity] = useState(1);
    const [promotionalPrice, setPromotionalPrice] = useState('');
    const [discountAmount, setDiscountAmount] = useState('');
    const [discountPercent, setDiscountPercent] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [tiers, setTiers] = useState<Tier[]>([{ quantity: 2, price: 0 }]);
    const [showProductList, setShowProductList] = useState(false);

    useEffect(() => {
        fetchPromotions();
        fetchProducts();
    }, []);

    const fetchPromotions = async () => {
        try {
            const res = await fetch('/api/promotions');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            if (Array.isArray(data)) {
                setPromotions(data);
            } else {
                setPromotions([]);
            }
        } catch (error) {
            console.error('Failed to fetch promotions', error);
            setPromotions([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch products');
            setProducts([]);
        }
    };

    const handleAddTier = () => {
        setTiers([...tiers, { quantity: tiers.length + 2, price: 0 }]);
    };

    const handleRemoveTier = (index: number) => {
        const newTiers = [...tiers];
        newTiers.splice(index, 1);
        setTiers(newTiers);
    };

    const handleTierChange = (index: number, field: keyof Tier, value: number) => {
        const newTiers = [...tiers];
        newTiers[index] = { ...newTiers[index], [field]: value };
        setTiers(newTiers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            name,
            type,
            productId,
            minQuantity: Number(minQuantity),
            validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        };

        if (type === 'UNITY_PRICE') {
            payload.promotionalPrice = Number(promotionalPrice);
        } else if (type === 'FIXED_AMOUNT') {
            payload.discountAmount = Number(discountAmount);
        } else if (type === 'PERCENTAGE') {
            payload.discountPercent = Number(discountPercent);
        } else if (type === 'TIERED') {
            payload.tiers = tiers;
        }

        try {
            const res = await fetch('/api/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowForm(false);
                fetchPromotions();
                resetForm();
            } else {
                alert('Erro ao criar promoção');
            }
        } catch (error) {
            console.error('Error saving promotion', error);
        }
    };

    const resetForm = () => {
        setName('');
        setType('UNITY_PRICE');
        setProductId('');
        setProductSearch('');
        setMinQuantity(1);
        setPromotionalPrice('');
        setDiscountAmount('');
        setDiscountPercent('');
        setValidUntil('');
        setTiers([{ quantity: 2, price: 0 }]);
    };

    const filteredProducts = productSearch.length > 0
        ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
        : [];

    const selectProduct = (prod: Product) => {
        setProductId(prod.id);
        setProductSearch(prod.name);
        setShowProductList(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Promoções</h1>
                    <p className="text-xs text-slate-500">Gerencie regras de descontos e preços especiais.</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs shadow-sm"
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {showForm ? 'Cancelar' : 'Nova Promoção'}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white border border-rose-100 p-4 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Nome da Promoção</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    placeholder="Ex: Promoção VIP"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-semibold text-slate-700">Produto Alvo (Busca)</label>
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => {
                                        setProductSearch(e.target.value);
                                        setShowProductList(true);
                                        setProductId('');
                                    }}
                                    onFocus={() => setShowProductList(true)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                    placeholder="Buscar produto..."
                                    required={!productId}
                                />
                                {showProductList && productSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((p) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => selectProduct(p)}
                                                    className="p-2 hover:bg-rose-50 cursor-pointer border-b border-slate-100 last:border-0 text-sm"
                                                >
                                                    <p className="font-medium text-slate-700">{p.name}</p>
                                                    <p className="text-slate-500 text-xs">R$ {Number(p.price).toFixed(2)}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-2 text-slate-500 text-xs">Nenhum produto encontrado</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Tipo</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                >
                                    <option value="UNITY_PRICE">Preço Fixo</option>
                                    <option value="FIXED_AMOUNT">Desconto R$</option>
                                    <option value="PERCENTAGE">Desconto %</option>
                                    <option value="TIERED">Tabela Preço/Qtd</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">Validade</label>
                                <input
                                    type="datetime-local"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
                            {type === 'UNITY_PRICE' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500">Preço Unitário Promo (R$)</label>
                                        <input
                                            type="number"
                                            value={promotionalPrice}
                                            onChange={(e) => setPromotionalPrice(e.target.value)}
                                            className="w-full text-sm border-slate-200 rounded h-8 px-2"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-500">Mínimo Unidades</label>
                                        <input
                                            type="number"
                                            value={minQuantity}
                                            onChange={(e) => setMinQuantity(Number(e.target.value))}
                                            className="w-full text-sm border-slate-200 rounded h-8 px-2"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}

                            {type === 'FIXED_AMOUNT' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Desconto (R$)</label>
                                    <input
                                        type="number"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                        className="w-full text-sm border-slate-200 rounded h-8 px-2"
                                        placeholder="0.00"
                                        step="0.01"
                                    />
                                </div>
                            )}

                            {type === 'PERCENTAGE' && (
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-500">Desconto (%)</label>
                                    <input
                                        type="number"
                                        value={discountPercent}
                                        onChange={(e) => setDiscountPercent(e.target.value)}
                                        className="w-full text-sm border-slate-200 rounded h-8 px-2"
                                        placeholder="0"
                                        max="100"
                                    />
                                </div>
                            )}

                            {type === 'TIERED' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-slate-700">Faixas de Preço</span>
                                        <button type="button" onClick={handleAddTier} className="text-[10px] text-blue-600 hover:underline">+ Adicionar Faixa</button>
                                    </div>
                                    {tiers.map((tier, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={tier.quantity}
                                                onChange={(e) => handleTierChange(index, 'quantity', Number(e.target.value))}
                                                className="w-20 text-sm border-slate-200 rounded h-7 px-2"
                                                placeholder="Qtd"
                                            />
                                            <span className="text-xs text-slate-400">un. por</span>
                                            <input
                                                type="number"
                                                value={tier.price}
                                                onChange={(e) => handleTierChange(index, 'price', Number(e.target.value))}
                                                className="w-24 text-sm border-slate-200 rounded h-7 px-2"
                                                placeholder="R$ Total"
                                                step="0.01"
                                            />
                                            <button type="button" onClick={() => handleRemoveTier(index)} className="text-rose-500 hover:text-rose-700">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                                <Save className="h-4 w-4 mr-2" /> Salvar
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white border border-rose-100 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-rose-50/50 text-slate-500 font-semibold text-xs border-b border-rose-100">
                        <tr>
                            <th className="p-3">Nome</th>
                            <th className="p-3">Produto</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Detalhes</th>
                            <th className="p-3">Validade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-4 text-center text-slate-400">Carregando...</td></tr>
                        ) : promotions.length === 0 ? (
                            <tr><td colSpan={5} className="p-4 text-center text-slate-400">Nenhuma promoção ativa.</td></tr>
                        ) : (
                            promotions.map((promo) => (
                                <tr key={promo.id} className="hover:bg-rose-50/30 transition-colors">
                                    <td className="p-3 font-medium text-slate-700">{promo.name}</td>
                                    <td className="p-3 text-slate-600">{promo.product?.name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${promo.type === 'TIERED' ? 'bg-purple-100 text-purple-700' :
                                                promo.type === 'PERCENTAGE' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                            }`}>
                                            {promo.type === 'TIERED' ? 'TABELA' :
                                                promo.type === 'PERCENTAGE' ? '%' :
                                                    promo.type === 'FIXED_AMOUNT' ? 'R$ OFF' : 'FIXO'}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600 text-xs">
                                        {promo.type === 'TIERED' ? (
                                            <span title={JSON.stringify(promo.tiers)}>{(promo.tiers?.length || 0)} faixas</span>
                                        ) : promo.type === 'PERCENTAGE' ? (
                                            <span>{promo.discountPercent}% OFF</span>
                                        ) : promo.type === 'FIXED_AMOUNT' ? (
                                            <span>-{promo.discountAmount} R$</span>
                                        ) : (
                                            <span>R$ {promo.promotionalPrice} (min {promo.minQuantity})</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-slate-500 text-xs">
                                        {promo.validUntil ? format(new Date(promo.validUntil), 'dd/MM/yyyy') : 'Indeterminado'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
