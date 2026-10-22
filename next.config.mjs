/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
    ]
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource.includes('node_modules') &&
            warning.details &&
            warning.details.includes('source-map-loader')
          );
        },
      ];
    }
    return config;
  },
};
export default nextConfig;
