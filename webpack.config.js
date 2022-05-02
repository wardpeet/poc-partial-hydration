const path = require("path");
const nodeExternals = require("webpack-node-externals");
const { WebpackPnpExternals } = require("webpack-pnp-externals");

const ServerComponents = {
  apply: function (resolver) {
    resolver
      .getHook("file")
      .tap("ServerComponents", (request, resolveContext) => {
        if (request.path?.endsWith("server.js")) {
          return {
            ...request,
            path: false,
          };
        }
      });
  },
};

const babelOptions = {
  presets: [
    [
      "@babel/preset-react",
      {
        runtime: "automatic", // defaults to classic
        useSpread: true,
      },
    ],
  ],
};

module.exports = [
  {
    entry: "./src/index.js",
    mode: "development",
    output: {
      path: path.resolve(__dirname, "./dist", "client"),
      filename: "index.js",
      iife: true,
      clean: true,
    },
    target: "browserslist",
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: babelOptions,
          },
        },
      ],
    },
    optimization: {
      minimize: false,
    },
    resolve: {
      plugins: [ServerComponents],
    },
  },
  {
    entry: "./src/App.js",
    mode: "development",
    output: {
      path: path.resolve(__dirname, "./dist", "server"),
      filename: "index.server.js",
      libraryTarget: "commonjs2",
      clean: true,
    },
    target: "node",
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: babelOptions,
          },
        },
      ],
    },
    devtool: "source-map",
    optimization: {
      minimize: false,
    },
    externalsPresets: {
      node: true,
    },
    externals: [nodeExternals(), WebpackPnpExternals()],
  },
];
