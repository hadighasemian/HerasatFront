/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: 'export',
    images: {
        domains: ['dash.mesbot.ir'], // Add allowed domains
        unoptimized: true
    },
};

export default nextConfig;
