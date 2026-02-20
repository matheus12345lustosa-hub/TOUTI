'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Calendar, Save, Tag, Percent, DollarSign, Layers, X, Pencil } from 'lucide-react';
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
    product?: {
        name: string;
    };
    products?: Product[];
}

export default function PromotionsPage() {
    const router = useRouter();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form states
    const [name, setName] = useState('');
    const [type, setType] = useState('UNITY_PRICE');
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
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
            const res = await fetch('/api/dashboard/promotions');
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
            const res = await fetch('/api/products?limit=all');
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

    const handleEdit = (promo: Promotion) => {
        setEditingId(promo.id);
        setName(promo.name);
        setType(promo.type);
        setMinQuantity(promo.minQuantity);
        setPromotionalPrice(promo.promotionalPrice?.toString() || '');
        setDiscountAmount(promo.discountAmount?.toString() || '');
        setDiscountPercent(promo.discountPercent?.toString() || '');
        setTiers(promo.tiers && promo.tiers.length > 0 ? promo.tiers : [{ quantity: 2, price: 0 }]);

        // Handle Date format for input datetime-local (YYYY-MM-DDThh:mm)
        if (promo.validUntil) {
            const date = new Date(promo.validUntil);
            const iso = date.toISOString().slice(0, 16); // remove seconds/ms
            setValidUntil(iso);
        } else {
            setValidUntil('');
        }

        // Handle Products
        // If query returned products, use them. If not (legacy), check single product and find it in products list
        if (promo.products && promo.products.length > 0) {
            setSelectedProducts(promo.products);
        } else if (promo.product) {
            // Try to find the full product object from our products list matches the name or fetch again? 
            // The API GET returns `product: {name, price}` but we need ID for logic.
            // Actually GET request returns `product` relation and `products` relation.
            // But `product` in GET only selects name/price. `products` selects id/name/price.
            // So relying on `products` array is best. If it's empty but legacy `product` exists, we might miss the ID.
            // Ideally the backend migration should have linked them, or `products` relation includes the legacy one if we added logic.
            // For now assuming new promotions use `products`.
            setSelectedProducts(promo.products || []);
        } else {
            setSelectedProducts([]);
        }

        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta promoção?')) return;

        try {
            const res = await fetch(`/api/dashboard/promotions?id=${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchPromotions();
            } else {
                alert('Erro ao excluir');
            }
        } catch (error) {
            console.error('Error deleting', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProducts.length === 0) {
            alert('Selecione pelo menos um produto');
            return;
        }

        const payload: any = {
            name,
            type,
            productIds: selectedProducts.map(p => p.id),
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
            const method = editingId ? 'PUT' : 'POST';
            if (editingId) payload.id = editingId;

            const res = await fetch('/api/dashboard/promotions', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setShowForm(false);
                fetchPromotions();
                resetForm();
            } else {
                const err = await res.json();
                alert(`Erro ao ${editingId ? 'atualizar' : 'criar'} promoção: ` + (err.error || 'Erro desconhecido'));
            }
        } catch (error) {
            console.error('Error saving promotion', error);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setType('UNITY_PRICE');
        setSelectedProducts([]);
        setProductSearch('');
        setMinQuantity(1);
        setPromotionalPrice('');
        setDiscountAmount('');
        setDiscountPercent('');
        setValidUntil('');
        setTiers([{ quantity: 2, price: 0 }]);
    };

    const filteredProducts = productSearch.length > 0
        ? products.filter(p =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
            !selectedProducts.find(sp => sp.id === p.id)
        )
        : [];

    const addProduct = (prod: Product) => {
        if (!selectedProducts.find(p => p.id === prod.id)) {
            setSelectedProducts([...selectedProducts, prod]);
        }
        setProductSearch('');
        setShowProductList(false);
    };

    const removeProduct = (prodId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== prodId));
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">Promoções</h1>
                    <p className="text-xs text-slate-500">Gerencie regras de descontos e preços especiais.</p>
                </div>
                <Button
                    onClick={() => {
                        if (showForm) resetForm();
                        setShowForm(!showForm);
                    }}
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs shadow-sm"
                >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {showForm ? 'Cancelar' : 'Nova Promoção'}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white border border-rose-100 p-4 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-rose-50">
                        <h2 className="text-sm font-bold text-rose-700">
                            {editingId ? 'Editar Promoção' : 'Nova Promoção'}
                        </h2>
                        {editingId && (
                            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 text-xs">
                                Cancelar Edição
                            </button>
                        )}
                    </div>

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
                                <label className="text-xs font-semibold text-slate-700">Produtos Alvo</label>
                                <div className="flex flex-wrap gap-2 mb-2 min-h-[38px] p-1 border border-slate-200 rounded-md bg-white">
                                    {selectedProducts.map(p => (
                                        <span key={p.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                            {p.name}
                                            <button type="button" onClick={() => removeProduct(p.id)} className="ml-1 text-rose-400 hover:text-rose-600">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => {
                                            setProductSearch(e.target.value);
                                            setShowProductList(true);
                                        }}
                                        onFocus={() => setShowProductList(true)}
                                        className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none px-1"
                                        placeholder={selectedProducts.length === 0 ? "Buscar produto..." : ""}
                                    />
                                </div>
                                {showProductList && productSearch && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((p) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => addProduct(p)}
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
                                <Save className="h-4 w-4 mr-2" /> {editingId ? 'Atualizar' : 'Salvar'}
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
                            <th className="p-3">Produtos</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Detalhes</th>
                            <th className="p-3">Validade</th>
                            <th className="p-3 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-rose-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center text-slate-400">Carregando...</td></tr>
                        ) : promotions.length === 0 ? (
                            <tr><td colSpan={6} className="p-4 text-center text-slate-400">Nenhuma promoção ativa.</td></tr>
                        ) : (
                            promotions.map((promo) => (
                                <tr key={promo.id} className="hover:bg-rose-50/30 transition-colors">
                                    <td className="p-3 font-medium text-slate-700">{promo.name}</td>
                                    <td className="p-3 text-slate-600">
                                        <div className="flex flex-wrap gap-1">
                                            {promo.products && promo.products.length > 0 ? (
                                                promo.products.map(p => (
                                                    <span key={p.id} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{p.name}</span>
                                                ))
                                            ) : (
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{promo.product?.name}</span>
                                            )}
                                        </div>
                                    </td>
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
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(promo)}
                                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promo.id)}
                                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
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
