/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["http://localhost:3000", "http://192.168.1.118:3000"],
  typescript: { ignoreBuildErrors: false },
  images: { unoptimized: true },
}

export default nextConfig
