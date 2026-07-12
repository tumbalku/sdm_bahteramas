import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@prisma/client",
    "@sparticuz/chromium",
    "bcryptjs",
    "puppeteer-core",
  ],
  outputFileTracingIncludes: {
    "/api/v1/profile/export-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "/api/v1/users/[id]/profile/export-pdf": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "app/api/v1/profile/export-pdf/route": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
    "app/api/v1/users/[id]/profile/export-pdf/route": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },
};

export default nextConfig;
