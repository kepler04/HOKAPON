import type { NextConfig } from "next";

/**
 * Next.js 15 configuration.
 *
 * `images.remotePatterns` allows <Image /> to serve product images from
 * Supabase Storage. We match any *.supabase.co host (public storage path) so
 * this works regardless of whether NEXT_PUBLIC_SUPABASE_URL is available at
 * the moment next.config is evaluated (it can be empty during build).
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      // Specific project host (if known at build time).
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/sign/**",
            },
          ]
        : []),
      // Fallback: any Supabase project storage host.
      {
        protocol: "https" as const,
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https" as const,
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      // Google account avatars (OAuth sign-in).
      {
        protocol: "https" as const,
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
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
