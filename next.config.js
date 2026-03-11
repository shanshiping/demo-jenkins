/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // 用于 Docker 部署
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig
