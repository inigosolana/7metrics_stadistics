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
    const apiUrl = process.env.API_UPSTREAM_URL || 'http://localhost:8000';
    console.log(`[Next.js] Proxy rewriting /api/proxy -> ${apiUrl}`);

    return [
      {
        source: '/api/proxy/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ]
  },
}

export default nextConfig