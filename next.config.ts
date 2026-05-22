import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "frozen-babble-rosy.ngrok-free.dev",
    "localhost",
    "127.0.0.1",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    // DEV → no CSP
    if (!isProd) {
      return [];
    }

    // PROD → secure CSP
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",

              "script-src 'self' 'unsafe-inline' https://app.midtrans.com https://api.midtrans.com",

              "frame-src 'self' https://app.midtrans.com https://api.midtrans.com",

              "img-src 'self' data: https:",

              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",

              "font-src 'self' https://fonts.gstatic.com data:",

              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.midtrans.com https://app.midtrans.com",

              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
