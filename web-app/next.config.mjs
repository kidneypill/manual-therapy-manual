import { withContentlayer } from 'next-contentlayer2'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        // Prevent contentlayer's periodic regeneration from triggering
        // webpack recompilation of pages that import from contentlayer/generated
        ignored: [
          '**/.contentlayer/**',
          '**/node_modules/**',
        ],
      }
    }
    return config
  },
}

export default withContentlayer(nextConfig)
