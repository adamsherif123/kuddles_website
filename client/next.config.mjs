/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://192.168.1.124:3000",
    "http://192.168.1.124:3001",
  ],
  typescript: { ignoreBuildErrors: false },
  images: { unoptimized: true },
}

export default nextConfig
