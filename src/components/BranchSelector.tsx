"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Building2 } from "lucide-react";

interface Branch {
    id: string;
    name: string;
}

export function BranchSelector() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("");

    useEffect(() => {
        // Fetch branches
        fetch("/api/branches")
            .then(res => res.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    console.error("Invalid branches data:", data);
                    return;
                }

                setBranches(data);

                // Recover selection
                const saved = localStorage.getItem("touti_branchId");
                // Also check cookie if available (client-side check not easy/necessary if we sync)

                let activeBranchId = "";
                if (saved && data.find((b: Branch) => b.id === saved)) {
                    activeBranchId = saved;
                } else if (data.length > 0) {
                    activeBranchId = data[0].id; // Default to first (Matriz)
                }

                if (activeBranchId) {
                    setSelectedBranch(activeBranchId);
                    localStorage.setItem("touti_branchId", activeBranchId);
                    document.cookie = `touti_branchId=${activeBranchId}; path=/; max-age=31536000`;
                }
            })
            .catch(err => console.error("Failed to load branches", err));
    }, []);

    const handleValueChange = (value: string) => {
        setSelectedBranch(value);
        localStorage.setItem("touti_branchId", value);
        document.cookie = `touti_branchId=${value}; path=/; max-age=31536000`;
        window.location.reload(); // Simple way to refresh context for now
    };

    if (branches.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-rose-200" />
            <Select value={selectedBranch} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] h-8 bg-rose-900/50 border-rose-800 text-rose-100 focus:ring-rose-400">
                    <SelectValue placeholder="Selecione a Filial" />
                </SelectTrigger>
                <SelectContent>
                    {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
