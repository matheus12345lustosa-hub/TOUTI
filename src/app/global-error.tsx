'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold">Algo deu errado criticalmente!</h2>
                    <button
                        onClick={() => reset()}
                        className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </body>
        </html>
    );
}
