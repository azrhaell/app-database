/** @type {import('next').NextConfig} */

/*module.exports = {
  api: {
    responseLimit: "false",
    bodyParser: {
      sizeLimit: "5000mb", // Aumenta o limite de tamanho do corpo
    },
  },
};*/

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
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Keep-Alive", value: "timeout=600" }, // 5 minutos
          { key: "Connection", value: "keep-alive" },
        ],
      },
    ];
  },
  api: {
    responseLimit: "false",
    bodyParser: {
      sizeLimit: "5000mb", // Aumenta o limite de tamanho do corpo
    },
  },

};

module.exports = nextConfig;