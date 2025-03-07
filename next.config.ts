import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_EMPLOYEE_FIELDS: process.env.NEXT_PUBLIC_EMPLOYEE_FIELDS,
    NEXT_PUBLIC_MACHINE_FIELDS: process.env.NEXT_PUBLIC_MACHINE_FIELDS,
    NEXT_PUBLIC_GATEWAYS: process.env.NEXT_PUBLIC_GATEWAYS,
    MONGODB_URL: process.env.MONGODB_URL,
    DB_NAME: process.env.DB_NAME,
  },
};

export default nextConfig;
