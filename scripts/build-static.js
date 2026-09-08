import { cp, mkdir, rm, stat, readdir, readFile, writeFile } from "node:fs/promises";
const files = (await readdir("src")).filter(name => /\.(js|css)$/.test(name));
for (const name of files) await stat(`src/${name}`);
await stat("index.html");
await rm("dist", { recursive: true, force: true });
await mkdir("dist/src", { recursive: true });
await cp("index.html", "dist/index.html");
for (const name of files) await cp(`src/${name}`, `dist/src/${name}`);
await cp("public", "dist", { recursive: true });
console.log("Static mobile bundle prepared in dist/");

const escape = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const contact = process.env.SUPPORT_EMAIL || "Yayın öncesinde destek iletişim adresi eklenecek.";
const policy = (await readFile("dist/privacy.html", "utf8"))
  .replace("{{PUBLISH_NOTICE}}", process.env.SUPPORT_EMAIL ? "Hesap gerekmez. Oyun kayıtları cihazda tutulur; reklam hizmetinin veri kullanımı aşağıda açıklanır." : "Hazırlık sürümü: destek adresi ve herkese açık gizlilik bağlantısı yayın öncesinde doğrulanmalıdır.")
  .replace("{{SUPPORT_CONTACT}}", escape(contact));
await writeFile("dist/privacy.html", policy);
