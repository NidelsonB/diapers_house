import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  experimental: {
    // Hostinger reports a very high CPU count, which can cause Next to
    // over-spawn workers and exhaust the process limit on small plans.
    cpus: 1,
    workerThreads: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Accel-Buffering",
            value: "no",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
