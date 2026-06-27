import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = Number(process.env.SMOKETEST_PORT ?? 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const requested = join(root, normalized);
  if (!requested.startsWith(root)) {
    return null;
  }
  if (existsSync(requested) && statSync(requested).isFile()) {
    return requested;
  }
  return join(root, "index.html");
}

const server = createServer((request, response) => {
  const path = resolvePath(request.url ?? "/");
  if (!path || !existsSync(path)) {
    response.writeHead(404).end("Not found");
    return;
  }

  response.setHeader("content-type", contentTypes[extname(path)] ?? "application/octet-stream");
  createReadStream(path).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Live audio smoketest listening at http://127.0.0.1:${port}`);
});
