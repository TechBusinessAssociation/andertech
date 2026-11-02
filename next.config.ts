import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Newsletter images are uploaded from /admin/newsletter through a server
  // action. The browser shrinks them first (a few hundred KB), but the default
  // 1 MB body limit is tight, so allow 4 MB (Vercel's own cap is 4.5 MB).
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  // Images are stored in Vercel Blob and served from its public domain.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
