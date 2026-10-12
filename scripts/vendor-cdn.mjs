#!/usr/bin/env node
// Remplace les URLs https://cdn.jsdelivr.net/npm/<paquet>@<version>/<chemin> d'un projet
// HyperFrames par des copies locales dans <projet>/vendor/. Nécessaire quand le réseau
// de l'environnement bloque cdn.jsdelivr.net (le rendu échoue sinon : "gsap ... null").
// Usage : node scripts/vendor-cdn.mjs videos/<projet>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? ".");
const re = /https:\/\/cdn\.jsdelivr\.net\/npm\/((?:@[^/@"'\s]+\/)?[^/@"'\s]+)@([^/"'\s]+)(\/[^"'\s)]*)?/g;

function htmlFiles(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    if (e.name === "node_modules" || e.name === "vendor" || e.name.startsWith(".")) return [];
    const p = path.join(d, e.name);
    return e.isDirectory() ? htmlFiles(p) : /\.(html|js|mjs|css)$/.test(e.name) ? [p] : [];
  });
}

function fetchPkg(name, version) {
  const dest = path.join(dir, "vendor", `${name.replace("/", "__")}@${version}`);
  if (fs.existsSync(dest)) return dest;
  fs.mkdirSync(dest, { recursive: true });
  const tgz = execFileSync("npm", ["pack", `${name}@${version}`, "--silent", "--pack-destination", dest], { encoding: "utf8" }).trim().split("\n").pop();
  execFileSync("tar", ["-xzf", path.join(dest, tgz), "-C", dest, "--strip-components=1"]);
  fs.rmSync(path.join(dest, tgz));
  console.log(`vendored ${name}@${version}`);
  return dest;
}

let changed = 0;
for (const file of htmlFiles(dir)) {
  const src = fs.readFileSync(file, "utf8");
  const out = src.replace(re, (_, name, version, sub = "/") => {
    const local = fetchPkg(name, version);
    let rel = path.relative(path.dirname(file), local).split(path.sep).join("/");
    changed++;
    return rel + sub;
  });
  if (out !== src) fs.writeFileSync(file, out);
}
console.log(`${changed} URL(s) CDN remplacée(s) par des copies locales.`);
