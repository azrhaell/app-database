import http from "http";
import next from "next";

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Keep-Alive", "timeout=3600, max=1000"); // 1 hora
    handle(req, res);
  });

  server.keepAliveTimeout = 3600000; // 1 hora
  server.headersTimeout = 3600000;
  server.listen(3000, () => {
    console.log("🚀 Servidor rodando na porta 3000");
  });
});
