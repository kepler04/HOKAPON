import type { NextConfig } from "next";

/**
 * Next.js 15 configuration.
 *
 * `images.remotePatterns` must include the Supabase Storage host so that
 * <Image /> can serve product images. The host is derived from
 * NEXT_PUBLIC_SUPABASE_URL at build time.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
  // Security headers (baseline; tightened further in Fase 5).
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // SAMEORIGIN (not DENY) so the admin store-preview iframe can embed
          // the storefront, while still blocking embedding by other sites.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
