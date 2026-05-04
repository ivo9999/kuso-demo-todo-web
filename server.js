// Tiny static file server for the kuso demo todo frontend. We don't
// need a framework — kuso routes the request to whichever pod owns
// the domain, and this just serves index.html / app.js / styles.css.
//
// API_BASE is read at request time (not at build time) so kuso can
// inject it via env without rebuilding the image. The server writes
// it into a small `/config.js` shim that index.html loads first.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const API_BASE = process.env.API_BASE || "";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/healthz") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(`{"ok":true}`);
      return;
    }
    if (url.pathname === "/config.js") {
      // Runtime-injected config so users don't need to rebuild
      // the image to point at a new API.
      res.writeHead(200, { "Content-Type": types[".js"] });
      res.end(`window.__KUSO_API_BASE__ = ${JSON.stringify(API_BASE)};`);
      return;
    }
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = join(__dirname, "public", path);
    const data = await readFile(file);
    res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("not found");
  }
});

server.listen(PORT, () => {
  console.log(`kuso-demo-todo-web listening on :${PORT}, API_BASE=${API_BASE || "(empty — set API_BASE env)"}`);
});
