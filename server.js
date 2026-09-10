/**
 * Minimal static file server — zero dependencies.
 * Used for local previews and works as a Render "Web Service" start
 * command too (node server.js). Not needed if deployed as a Render
 * "Static Site" — Render serves the files directly in that case.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

http
  .createServer((req, res) => {
    const reqPath = decodeURIComponent(req.url.split("?")[0]);
    const relative = reqPath === "/" ? "index.html" : reqPath.replace(/^\/+/, "");
    const filePath = path.normalize(path.join(ROOT, relative));

    if (!(filePath === ROOT || filePath.startsWith(ROOT + path.sep))) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 — not found");
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, "0.0.0.0", () => console.log(`Portfolio running at http://localhost:${PORT}`));
