import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.STANDALONE !== 'false' ? 'standalone' : undefined,
  // www.rovervilla.space serves the same worker; send it to the bare domain so there is one canonical address.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.rovervilla.space" }],
        destination: "https://rovervilla.space/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
}
