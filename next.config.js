/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['undici'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
      canvas: false,
      'node:assert': false,
      'node:async_hooks': false,
      'node:buffer': false,
      'node:console': false,
      'node:crypto': false,
      'node:events': false,
      'node:fs': false,
      'node:http': false,
      'node:https': false,
      'node:net': false,
      'node:os': false,
      'node:path': false,
      'node:stream': false,
      'node:tls': false,
      'node:url': false,
      'node:util': false,
      'node:zlib': false,
    }
    return config
  },
}

module.exports = nextConfig
