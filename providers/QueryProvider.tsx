'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5000,            // Datos "frescos" por 5 segundos
                gcTime: 10 * 60 * 1000,     // Garbage collection después de 10 min
                retry: 1,                    // Reintentar 1 vez en caso de error
                refetchOnWindowFocus: false, // No refetch al volver a la ventana
            },
            mutations: {
                retry: 0,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </QueryClientProvider>
    );
}
