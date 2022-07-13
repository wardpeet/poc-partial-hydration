const path = require("path");
const fs = require("fs");
const http = require("http");
const { PassThrough } = require("stream");
const { createRequire } = require("module");
const React = require("react");
const { renderToPipeableStream } = require("react-dom/server");
const {
  renderToPipeableStream: ServerComponentsStream,
} = require("react-server-dom-webpack/writer.node.server");

http
  .createServer(function (req, res) {
    if (req.url === "/favicon.ico") {
      res.end("");
      return;
    }

    const cleanRequire = createRequire(__filename);
    Object.keys(cleanRequire.cache).forEach((key) => {
      if (key.includes("dist/server")) {
        delete cleanRequire.cache[key];
      }
    });
    if (req.url.startsWith("/page-data/")) {
      const { Header } = cleanRequire("./dist/server/header.server");
      const { pipe } = ServerComponentsStream(
        React.createElement(Header),
        JSON.parse(
          fs.readFileSync("./dist/client/react-client-manifest.json", "utf8")
        )
      );

      pipe(res);
      return;
    }

    if (req.headers.accept.includes("text/html")) {
      let didError = false;
      const { ServerApp } = cleanRequire("./dist/server/index.server");

      const stream = renderToPipeableStream(
        React.createElement(ServerApp, {
          location: req.url,
        }),
        {
          onShellError(error) {
            // Something errored before we could complete the shell so we emit an alternative shell.
            res.statusCode = 500;
            res.write("<!doctype html><p>Loading...</p>");
            res.end();
          },
          onAllReady() {
            console.log({ didError });
            if (didError) {
              return;
            }

            // If you don't want streaming, use this instead of onShellReady.
            // This will fire after the entire page content is ready.
            // You can use this for crawlers or static generation.
            res.statusCode = didError ? 500 : 200;
            res.setHeader("Content-type", "text/html");
            res.write(
              '<!doctype html><head><title>Hydration</title></head><body><div id="root">'
            );

            const writable = new PassThrough();
            writable.setEncoding("utf8");
            writable.on("data", (chunk) => {
              res.write(chunk);
            });
            writable.on("close", () => {
              res.end(
                "</div><script src='/index.js' async></script></body></html>"
              );
            });

            stream.pipe(writable);
          },
          onError(err) {
            didError = true;
            console.log({ err });
          },
        }
      );

      return;
    }

    const asset = path.join(__dirname, "dist", "client", req.url);

    try {
      fs.statSync(asset);

      fs.createReadStream(asset).pipe(res);
    } catch (err) {
      res.statusCode = 404;
      res.end("404");
    }
  })
  .listen(4000);
