import http from "http";
import next from "next";

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // 🔹 Keep-alive no header para conexões longas
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Keep-Alive", "timeout=600, max=1000"); 
    handle(req, res);
  });

  // 🔹 Aumenta o tempo limite para 10 minutos
  server.timeout = 600000;
  server.keepAliveTimeout = 600000;

  server.listen(3000, () => {
    console.log("🚀 Servidor rodando na porta 3000");
  });
});