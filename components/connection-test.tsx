
"use client";

import { useMatchesList } from "@/lib/hooks/useMatch";

export default function ConnectionTest() {
    const { data: matches, isLoading, error } = useMatchesList();

    if (isLoading) return <div className="p-4 text-blue-500">Cargando partidos...</div>;
    if (error) return <div className="p-4 text-red-500">Error conectando a API: {error.message}</div>;

    return (
        <div className="p-4 bg-slate-900 text-white rounded my-4">
            <h3 className="font-bold text-lg mb-2">Estado de Conexión API</h3>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-green-400">Conectado a {process.env.NEXT_PUBLIC_API_URL || 'localhost:8000'}</span>
            </div>

            <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-2">Partidos Encontrados ({matches?.length || 0})</h4>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
                {matches?.map((m) => (
                    <li key={m.id} className="text-xs bg-slate-800 p-2 rounded border border-slate-700">
                        <span className="font-bold text-blue-400">{m.team_a_name}</span> vs <span className="font-bold text-amber-400">{m.team_b_name}</span>
                        <span className="ml-2 text-slate-500">ID: {m.id}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
