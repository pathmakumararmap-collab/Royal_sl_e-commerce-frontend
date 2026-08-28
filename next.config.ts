import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const apiHostname = (() => {
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: apiHostname, port: "8000", pathname: "/storage/**" },
      { protocol: "https", hostname: apiHostname, pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/storage/**" },
    ],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
