/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions объект биш boolean байх ёстой
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Өөр тохиргоонууд байвал хэвээр үлдээнэ
}

module.exports = nextConfig
