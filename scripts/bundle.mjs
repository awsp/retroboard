// Bundles the server, its dependencies and the built client (dist/) into one
// self-contained CommonJS file: release/retroboard.cjs. Run `npm run build`
// first (the `bundle` script does both).
import { build } from "esbuild";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");
const outfile = path.join(root, "release", "retroboard.cjs");

if (!existsSync(path.join(distDir, "index.html"))) {
  console.error("dist/index.html not found. Run `npm run build` first.");
  process.exit(1);
}

const listFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });

const assets = Object.fromEntries(
  listFiles(distDir).map((file) => [
    "/" + path.relative(distDir, file).split(path.sep).join("/"),
    readFileSync(file).toString("base64"),
  ]),
);

const embedClient = {
  name: "embed-client",
  setup(b) {
    b.onLoad({ filter: /server[\\/]embeddedAssets\.js$/ }, () => ({
      contents: `export default ${JSON.stringify(assets)};`,
      loader: "js",
    }));
  },
};

await build({
  entryPoints: [path.join(root, "server", "index.js")],
  outfile,
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node18",
  minify: true,
  legalComments: "none",
  // Optional native speedups for `ws`; it falls back to JS when they're missing.
  external: ["bufferutil", "utf-8-validate"],
  plugins: [embedClient],
  logLevel: "warning",
});

const kb = (statSync(outfile).size / 1024).toFixed(0);
console.log(
  `Built ${path.relative(root, outfile)} (${kb} KB, ${Object.keys(assets).length} client files)`,
);
