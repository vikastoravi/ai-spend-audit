/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Ensure Turbopack uses the project root when multiple lockfiles exist
  turbopack: {
    root: 'C:\\Users\\vikas\\OneDrive\\Documents\\Desktop\\ai-spend-audit',
  },
  reactCompiler: true,
  reactStrictMode: true,
};

export default nextConfig;
