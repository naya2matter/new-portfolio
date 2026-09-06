import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 restricts `quality` to this allowlist and silently coerces
    // anything else to the nearest entry (default is `[75]` alone). The
    // project screenshots are dense UI with small text, so they need the
    // higher end to stay legible in the carousel.
    qualities: [75, 90, 95, 100],
  },
};

export default nextConfig;
