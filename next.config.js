/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
        {
        protocol: "https",
        hostname: "roofdigital.com",
        },
    ],
    },
};
module.exports = nextConfig;

