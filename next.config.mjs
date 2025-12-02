/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"]
};

export default nextConfig;
