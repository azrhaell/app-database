import http from "http";
import next from "next";

const port = process.env.PORT || 3000;
const app = next({ dev: false }); // false para produção, true para dev
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    // 🏃‍♂️ Mantém a conexão aberta (Keep-Alive)
    res.setHeader("Connection", "keep-alive");
    handle(req, res);
  });

  server.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
  });
});
