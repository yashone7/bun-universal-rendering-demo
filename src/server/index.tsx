import { renderToReadableStream } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "../shared/App";

const server = Bun.serve({
  port: 3006,
  idleTimeout: 30,
  async fetch(req) {
    const url = new URL(req.url);

    console.log("Request URL:", url);

    if (url.pathname.startsWith("/api")) {
      const responseBody = {
        version: `Server ${Bun.version}`,
        timestamp: new Date().toISOString(),
        path: url.pathname,
        message: "Welcome to API Route",
      };
      return new Response(JSON.stringify(responseBody), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Serve static files from public directory
    if (url.pathname.startsWith("/build/")) {
      const filePath = `./public${url.pathname}`;
      const file = Bun.file(filePath);

      if (await file.exists()) {
        return new Response(file);
      }
    }

    try {
      const htmlStart = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Isomorphic React App with Bun</title>
      </head>
      <body>
      <div id="root">`.trim();

      const htmlEnd = `
          </div>
        </body>
      </html>
      `.trim();

      const stream = await renderToReadableStream(
        <StaticRouter location={url.pathname}>
          <App />
        </StaticRouter>,
        {
          bootstrapScripts: ["/build/index.js"],
          onError: (error) => {
            console.error(error);
          },
        }
      );

      console.log(stream);

      const combinedStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(htmlStart));

          const reader = stream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }

          controller.enqueue(encoder.encode(htmlEnd));

          controller.close();
        },
      });

      return new Response(combinedStream, {
        headers: {
          "Content-Type": "text/html",
          "Transfer-Encoding": "chunked",
        },
      });
    } catch (error) {
      console.error("Failed to render:", error);
      return new Response(`Server Error: ${error.message}`, { status: 500 });
    }
  },
});

console.log(`Server running on http://localhost:${server.port}`);
