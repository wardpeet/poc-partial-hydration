const path = require("path");
const fs = require("fs");
const http = require("http");
const { PassThrough } = require("stream");
const { createRequire } = require("module");
const React = require("react");
const { renderToPipeableStream } = require("react-dom/server");
const { StaticRouter } = require("react-router-dom/server");

http
  .createServer(function (req, res) {
    if (req.url === "/favicon.ico") {
      res.end("");
      return;
    }

    if (req.headers.accept.includes("text/html")) {
      let didError = false;
      const cleanRequire = createRequire(__filename);
      delete cleanRequire.cache[
        cleanRequire.resolve("./dist/server/index.server")
      ];
      const { App } = cleanRequire("./dist/server/index.server");

      const stream = renderToPipeableStream(
        React.createElement(
          StaticRouter,
          {
            location: req.url,
          },
          React.createElement(App)
        ),
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
