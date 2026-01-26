'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const searchParams = useSearchParams();

    // Helper to build URL with existing search params
    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        return `${baseUrl || ""}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <Button
                variant="outline"
                size="icon"
                disabled={currentPage <= 1}
                asChild
            >
                {currentPage <= 1 ? (
                    <span><ChevronLeft className="h-4 w-4" /></span>
                ) : (
                    <Link href={createPageUrl(currentPage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                )}
            </Button>

            <span className="text-sm text-slate-500 font-medium">
                Página {currentPage} de {totalPages}
            </span>

            <Button
                variant="outline"
                size="icon"
                disabled={currentPage >= totalPages}
                asChild
            >
                {currentPage >= totalPages ? (
                    <span><ChevronRight className="h-4 w-4" /></span>
                ) : (
                    <Link href={createPageUrl(currentPage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                )}
            </Button>
        </div>
    );
}
