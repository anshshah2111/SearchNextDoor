import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_PAGES === "true" ? "/SearchNextDoor" : "",
  images: { unoptimized: true },
};

export default nextConfig;
