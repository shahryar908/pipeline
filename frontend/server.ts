import { serve } from "bun";
import { join } from "path";

const dist = join(import.meta.dir, "dist");

serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = join(dist, url.pathname === "/" ? "index.html" : url.pathname);
    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    return new Response(Bun.file(join(dist, "index.html")));
  },
});

console.log("Server running at http://localhost:3000");
