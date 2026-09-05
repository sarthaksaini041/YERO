import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mglneknqwgpzjijfuaac.supabase.co";
const supabaseWss = supabaseUrl.replace(/^http/, "ws");

const trustedImageOrigins = [
  "'self'",
  "data:",
  "blob:",
  "https://avatars.githubusercontent.com",
  "https://assets.leetcode.com",
  "https://cdn.codechef.com",
  "https://www.codechef.com",
  "https://userpic.codeforces.org",
  "https://codeforces.com",
  "https://lh3.googleusercontent.com",
  "https://*.supabase.co",
  "https://*.gravatar.com",
].join(" ");

const trustedConnectOrigins = [
  "'self'",
  supabaseUrl,
  supabaseWss,
  "https://*.supabase.co",
  "wss://*.supabase.co",
  "https://*.push.apple.com",
  "https://*.fcm.googleapis.com",
  "https://updates.push.services.mozilla.com",
  "https://*.notify.windows.com",
].join(" ");

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src ${trustedImageOrigins};
  font-src 'self' data:;
  connect-src ${trustedConnectOrigins};
  worker-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "assets.leetcode.com",
      },
      {
        protocol: "https",
        hostname: "*.codechef.com",
      },
      {
        protocol: "https",
        hostname: "codechef.com",
      },
      {
        protocol: "https",
        hostname: "*.codeforces.com",
      },
      {
        protocol: "https",
        hostname: "codeforces.com",
      },
      {
        protocol: "https",
        hostname: "userpic.codeforces.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.gravatar.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "@hugeicons/core-free-icons",
      "@hugeicons/react",
      "framer-motion",
      "clsx",
      "tailwind-merge",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

