const env = process.env;
for (const name of ["ADMOB_APP_ID", "ADMOB_BANNER_ID", "PRIVACY_POLICY_URL", "SUPPORT_EMAIL"]) {
  if (!env[name]) throw new Error(`Missing ${name}`);
}
if (!/^ca-app-pub-\d{16}~\d{10}$/.test(env.ADMOB_APP_ID) || env.ADMOB_APP_ID.includes("3940256099942544")) throw new Error("A real AdMob app ID is required");
if (!/^ca-app-pub-\d{16}\/\d{10}$/.test(env.ADMOB_BANNER_ID) || env.ADMOB_BANNER_ID.includes("3940256099942544")) throw new Error("A real banner ID is required");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SUPPORT_EMAIL)) throw new Error("A valid public support email is required");
const url = new URL(env.PRIVACY_POLICY_URL);
if (url.protocol !== "https:" || url.username || url.password) throw new Error("A public HTTPS privacy URL is required");
const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Privacy policy must be a reachable public HTML page");
const html = await response.text();
if (!html.includes("Kuş Köyü") || !html.includes(env.SUPPORT_EMAIL) || /\{\{SUPPORT_CONTACT\}\}|YAYIN ÖNCESİ TASLAK/.test(html)) throw new Error("Publish the approved policy with support contact before signing a release");
console.log("Owner ad IDs and published privacy policy preflight passed. No Play upload performed.");
