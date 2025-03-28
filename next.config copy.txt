/** @type {import('next').NextConfig} */

module.exports = {
  api: {
    responseLimit: "false",
    bodyParser: {
      sizeLimit: "5000mb", // Aumenta o limite de tamanho do corpo
    },
  },
};

const nextConfig = {
  experimental: {
    turbo: {
      loaders: {
        ".js": { cache: false },
        ".jsx": { cache: false },
        ".ts": { cache: false },
        ".tsx": { cache: false },
      },
    },
  },
};

module.exports = nextConfig;