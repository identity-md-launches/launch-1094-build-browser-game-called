import assert from "node:assert/strict";
import { readFile, readdir, stat, lstat } from "node:fs/promises";
import { dirname, join, resolve, relative } from "node:path";

const root = resolve("dist");
const walk = async (directory) => {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Unexpected symlink: ${path}`);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
};
const files = await walk(root);
const verify = async (from, url) => {
  assert(!/^(?:\/|https?:|\/\/)/.test(url), `Nonrelative runtime URL: ${url}`);
  if (url.startsWith("data:") || url.startsWith("#")) return;
  const target = resolve(dirname(from), url.split(/[?#]/)[0]);
  assert(!relative(root, target).startsWith(".."), `Asset escapes dist: ${url}`);
  assert((await stat(target)).isFile(), `Missing asset: ${url}`);
};
const htmlPath = join(root, "index.html");
const html = await readFile(htmlPath, "utf8");
for (const [, url] of html.matchAll(/(?:src|href)="([^"]+)"/g)) await verify(htmlPath, url);
for (const path of files.filter(path => path.endsWith(".css"))) {
  const css = await readFile(path, "utf8");
  for (const [, url] of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) await verify(path, url);
}
for (const asset of ["frog.svg", "fonts/bricolage-latin.woff2", "fonts/dm-sans-latin.woff2"]) {
  assert((await lstat(join(root, asset))).isFile(), `Required local asset missing: ${asset}`);
}
const bytes = (await Promise.all(files.map(path => stat(path)))).reduce((sum, info) => sum + info.size, 0);
assert(bytes < 8_388_608, "Static export exceeds the entire submission limit");
console.log(`PASS: ${files.length} export files, ${bytes} bytes; all HTML/CSS asset URLs are relative and resolve locally.`);
