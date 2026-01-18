/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  async rewrites() {
    // La URL del backend real (Render o Localhost)
    let apiUrl = process.env.API_UPSTREAM_URL || 'http://localhost:8000';
    // Remove trailing slash if present to avoid double slashes in destination
    if (apiUrl.endsWith('/')) {
      apiUrl = apiUrl.slice(0, -1);
    }
    console.log(`[Next.js] Proxy rewriting /api/proxy -> ${apiUrl}`);

    return [
      // Force slash for known collections (FastAPI strictness)
      {
        source: '/api/proxy/matches',
        destination: `${apiUrl}/matches/`,
      },
      {
        source: '/api/proxy/events',
        destination: `${apiUrl}/events/`,
      },
      {
        source: '/api/proxy/matches/:id/players',
        destination: `${apiUrl}/matches/:id/players/`,
      },
      {
        source: '/api/proxy/matches/:id/statistics',
        destination: `${apiUrl}/matches/:id/statistics/`,
      },
      // Default catch-all
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig