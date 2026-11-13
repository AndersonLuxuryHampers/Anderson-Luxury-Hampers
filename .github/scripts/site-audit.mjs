import fs from "node:fs";
import path from "node:path";

const pages = [
  "index.html", "story.html", "collections.html", "beauty.html",
  "corporate.html", "contact.html", "chocolate.html", "tumblers.html",
  "gourmet.html", "privacy.html", "delivery.html", "faq.html",
  "en/index.html", "en/story.html", "en/collections.html", "en/beauty.html",
  "en/corporate.html", "en/contact.html", "en/chocolate.html", "en/tumblers.html",
  "en/gourmet.html", "en/privacy.html", "en/delivery.html", "en/faq.html"
];
const errors = [];
const root = process.cwd();
const exists = (p) => fs.existsSync(path.join(root, p));
const resolveLocal = (page, ref) => {
  const clean = decodeURIComponent(ref.split("?")[0].split("#")[0]);
  if (!clean) return page;
  const resolved = clean.startsWith("/")
    ? clean.replace(/^\/+/, "")
    : path.posix.normalize(path.posix.join(path.posix.dirname(page), clean));
  return resolved.endsWith("/") ? resolved + "index.html" : resolved;
};

for (const page of pages) {
  if (!exists(page)) {
    errors.push(`${page}: required page is missing`);
    continue;
  }
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const expectedLang = page.startsWith("en/") ? "en" : "id";
  const lang = html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1];
  if (lang !== expectedLang) errors.push(`${page}: expected lang="${expectedLang}", got "${lang}"`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`${page}: missing page title`);
  if (!/<meta\s+name=["']description["'][^>]*content=["'][^"']+["']/i.test(html)) errors.push(`${page}: missing meta description`);
  if (!/<meta\s+name=["']viewport["']/i.test(html)) errors.push(`${page}: missing viewport meta`);
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  if (h1Count !== 1) errors.push(`${page}: expected one H1, found ${h1Count}`);

  const ids = new Set([...html.matchAll(/(?:^|\s)id=["']([^"']+)["']/g)].map(m => m[1]));
  for (const img of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt\s*=/.test(img[0])) errors.push(`${page}: image missing alt text`);
  }

  for (const a of html.matchAll(/<a\b([^>]*)href=["']([^"']+)["']([^>]*)>/gi)) {
    const attrs = a[1] + a[3];
    const href = a[2];
    if (/^(https?:|mailto:|tel:|javascript:|data:)/i.test(href)) {
      if (/target=["']_blank/i.test(attrs) && !/\brel=["'][^"']*noopener/i.test(attrs)) {
        errors.push(`${page}: external new-tab link lacks rel=noopener: ${href}`);
      }
      continue;
    }
    if (href.startsWith("#")) {
      if (href.length > 1 && !ids.has(href.slice(1))) errors.push(`${page}: missing anchor target ${href}`);
      continue;
    }
    const target = resolveLocal(page, href);
    if (!exists(target)) errors.push(`${page}: broken internal link ${href} -> ${target}`);
  }

  const assetRefs = [];
  for (const m of html.matchAll(/\b(?:src|poster)=["']([^"']+)["']/gi)) assetRefs.push(m[1]);
  for (const m of html.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const candidate of m[1].split(",")) assetRefs.push(candidate.trim().split(/\s+/)[0]);
  }
  for (const m of html.matchAll(/<link\b(?=[^>]*rel=["']preload["'])[^>]*href=["']([^"']+)["']/gi)) assetRefs.push(m[1]);
  const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]);
  for (const css of styleBlocks) {
    for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) assetRefs.push(m[1]);
    if (/:focus-visible/.test(css) === false) errors.push(`${page}: missing visible keyboard focus styling`);
    if (/\\n/.test(css)) errors.push(`${page}: CSS contains a literal escaped newline`);
  }
  for (const ref of assetRefs) {
    if (/^(https?:|data:|blob:|#)/i.test(ref)) continue;
    const target = resolveLocal(page, ref);
    if (!exists(target)) errors.push(`${page}: missing local asset ${ref} -> ${target}`);
  }

  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  for (const m of scripts) {
    if (/application\/ld\+json/i.test(m[1])) continue;
    try { new Function(m[2]); }
    catch (e) { errors.push(`${page}: inline JavaScript syntax error: ${e.message}`); }
  }
}

for (const page of ["contact.html", "en/contact.html"]) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  if (!/id=["']enquiryForm["']/.test(html)) errors.push(`${page}: enquiry form missing`);
  if (!/name=["']delivery_location["']/.test(html)) errors.push(`${page}: delivery location field missing`);
  if (!/wa\.me\/6289673642072/.test(html)) errors.push(`${page}: WhatsApp enquiry destination missing`);
  if (!/addEventListener\(["']submit["']/.test(html)) errors.push(`${page}: enquiry submit handler missing`);
}

if (errors.length) {
  console.error("Anderson site audit failed:");
  for (const error of errors) console.error(" - " + error);
  process.exit(1);
}
console.log(`Anderson site audit passed: ${pages.length} bilingual pages, internal links, image assets, SEO, accessibility, and enquiry forms checked.`);
