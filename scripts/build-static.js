import { cp, mkdir, rm, stat } from "node:fs/promises";

const runtimeFiles = ["app.js", "actions.js", "content.js", "feedback.js", "game-core.js", "game-view.js", "home-view.js", "modals.js", "state.js", "styles.css", "styles-base.css", "styles-home.css", "styles-tokens.css", "styles-game.css", "styles-sheets.css", "styles-responsive.css", "tutorial.js", "ui.js"];
for (const name of runtimeFiles) await stat(`src/${name}`);
await stat("index.html");

await rm("dist", { recursive: true, force: true });
await mkdir("dist/src", { recursive: true });
await cp("index.html", "dist/index.html");
for (const name of runtimeFiles) await cp(`src/${name}`, `dist/src/${name}`);
await cp("public", "dist", { recursive: true });
console.log("Static mobile bundle prepared in dist/");
