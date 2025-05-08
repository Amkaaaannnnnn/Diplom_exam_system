/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // serverActions: true тэмдэглэгээг устгаж, хоосон объект тавих
    serverActions: {},
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
