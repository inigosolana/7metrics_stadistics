import { NextResponse } from 'next/server';

export async function GET() {
    const upstream = process.env.API_UPSTREAM_URL;
    const nextPublic = process.env.NEXT_PUBLIC_API_URL;

    let fetchResult = "Not attempted";
    let status = 0;

    try {
        if (upstream) {
            const res = await fetch(`${upstream}/docs`, { method: 'HEAD' });
            status = res.status;
            fetchResult = "Success (HEAD /docs)";
        } else {
            fetchResult = "Missing Upstream URL";
        }
    } catch (error: any) {
        fetchResult = `Error: ${error.message}`;
    }

    return NextResponse.json({
        env: {
            API_UPSTREAM_URL: upstream || 'UNDEFINED',
            NEXT_PUBLIC_API_URL: nextPublic || 'UNDEFINED',
        },
        connectivity: {
            attemptedUrl: upstream ? `${upstream}/docs` : null,
            status,
            message: fetchResult
        },
        timestamp: new Date().toISOString()
    });
}
