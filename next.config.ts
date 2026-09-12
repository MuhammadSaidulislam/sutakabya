import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "picsum.photos",
    },
     {
        protocol: "https",
        hostname: "images.sutakabya.com",
        pathname: "/sutakabya/**",
      },
    ],
  },
};

export default nextConfig;
