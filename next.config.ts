import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the headless-Chromium packages out of the bundler — the Chromium binary
  // and native bits must be required at runtime, not traced/bundled by webpack.
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core", "puppeteer"],
};

export default nextConfig;
