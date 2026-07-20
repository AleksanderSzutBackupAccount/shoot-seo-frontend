<script setup lang="ts">
// Public integration docs (English only). Content is grounded in sdk/README.md
// and the Public API v1 contract — keep it in sync with the SDK.
definePageMeta({ layout: false })

useSeoMeta({
  title: 'Docs — Shoot SEO',
  description: 'Integrate Shoot SEO into your own system: pull published content via the Public API v1 and SDK, verify webhooks, and drop in the analytics beacon.',
  ogTitle: 'Docs — Shoot SEO',
  ogDescription: 'Integration guide for the Shoot SEO headless Public API v1.',
  ogType: 'website',
})

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'api-key', label: 'Get your API key' },
  { id: 'quickstart', label: 'Install & quickstart' },
  { id: 'fetch', label: 'Fetch content' },
  { id: 'render', label: 'Render HTML safely' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'beacon', label: 'Analytics beacon' },
  { id: 'frameworks', label: 'Framework guides' },
  { id: 'errors', label: 'Errors & rate limits' },
]

const activeId = ref('overview')
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  for (const s of sections) {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => observer?.disconnect())

const installCode = `npm install @shoot-seo/sdk
# or: pnpm add @shoot-seo/sdk / yarn add @shoot-seo/sdk`

const quickstartCode = `import { createClient } from "@shoot-seo/sdk";

const shut = createClient({
  apiKey: process.env.SHOOT_SEO_API_KEY!,      // workspace API key (secret)
  baseUrl: "https://app.acme.com/api",          // API root that serves /v1/...
});`

const listCode = `// List published posts (newest first)
const { data, meta } = await shut.posts.list({ page: 1, perPage: 20 });
console.log(meta); // { page: 1, per_page: 20, total: 42 }

// Fetch one post by slug — resolves to null on 404
const post = await shut.posts.get("hello-world");
if (post) console.log(post.title);`

const shapeCode = `interface PublicPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;              // rendered HTML
  main_image_url: string | null;
  seo: {
    meta_title: string | null;
    meta_description: string | null;
    og_image_url: string | null;
    canonical_url: string | null;
  } | null;
  published_at: string | null;  // ISO-8601
  language: string;             // e.g. "pl", "de", "en"
  translations: { language: string; slug: string }[]; // for hreflang
}`

const renderVueCode = `<!-- Vue / Nuxt -->
<article v-html="post.content" />`

const renderReactCode = `// React — sanitize first; dangerouslySetInnerHTML bypasses escaping.
<article dangerouslySetInnerHTML={{ __html: post.content }} />`

const webhookCode = `import { verifyWebhookSignature, type WebhookEvent } from "@shoot-seo/sdk/webhooks";

// rawBody is the exact bytes/string you received, BEFORE JSON.parse.
const ok = await verifyWebhookSignature({
  payload: rawBody,
  signature: req.headers["x-shutseo-signature"],
  secret: process.env.SHOOT_SEO_WEBHOOK_SECRET!,
});

if (!ok) {
  // reject: 401
} else {
  const event = JSON.parse(rawBody) as WebhookEvent;
  // event.event -> "post.published" | "post.unpublished"
  // event.occurred_at, event.workspace_id, event.data (PublicPost)
}`

/* eslint-disable no-useless-escape -- required so the SFC compiler doesn't
   treat this as the closing tag of this file's own <script setup> block */
const beaconCode = `<script type="module">
  import { initBeacon } from "@shoot-seo/sdk/beacon";

  initBeacon({
    siteId: "WORKSPACE_UUID",             // public workspace id (not a secret)
    slug: "hello-world",                  // slug of the post on this page
    baseUrl: "https://app.acme.com/api",  // API root that serves /v1/...
  });
<\/script>`
/* eslint-enable no-useless-escape */

const nuxtCode = `// server/api/posts/[slug].get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug")!;
  const post = await useShutSeo().posts.get(slug);
  if (!post) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return post;
});`

const nextCode = `// app/blog/page.tsx (Server Component)
import { createClient } from "@shoot-seo/sdk";
const shut = createClient({ apiKey: process.env.SHOOT_SEO_API_KEY! });

export default async function BlogIndex() {
  const { data } = await shut.posts.list({ perPage: 20 });
  return (
    <ul>
      {data.map((p) => (
        <li key={p.id}><a href={\`/blog/\${p.slug}\`}>{p.title}</a></li>
      ))}
    </ul>
  );
}`

const expressCode = `import express from "express";
import { verifyWebhookSignature } from "@shoot-seo/sdk/webhooks";

const app = express();
app.post(
  "/webhooks/shoot-seo",
  express.raw({ type: "application/json" }),  // RAW body — not express.json()
  async (req, res) => {
    const ok = await verifyWebhookSignature({
      payload: req.body,
      signature: String(req.headers["x-shutseo-signature"] ?? ""),
      secret: process.env.SHOOT_SEO_WEBHOOK_SECRET!,
    });
    if (!ok) return res.status(401).send("invalid signature");
    res.status(204).end();
  },
);`

const errorsCode = `import { ShutSeoApiError } from "@shoot-seo/sdk";

try {
  await shut.posts.list();
} catch (err) {
  if (err instanceof ShutSeoApiError) {
    console.error(err.status, err.url, err.body);
    // 401 -> bad API key; 429 -> rate limited (see X-RateLimit-* headers)
  }
}`
</script>

<template>
  <div style="background: var(--canvas)">
    <header
      class="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-5 sm:px-8"
      style="background: color-mix(in srgb, var(--canvas) 82%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--hairline)"
    >
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="/logo.png" alt="" class="size-8 shrink-0 object-contain">
        <span class="tracking-tight" style="color: var(--ink); font-weight: 600">Shoot SEO</span>
        <span class="badge-pill ml-1">Docs</span>
      </NuxtLink>
      <div class="flex items-center gap-1.5">
        <UButton to="/" color="neutral" variant="ghost" size="sm" icon="i-lucide-arrow-left">Home</UButton>
        <UColorModeButton />
      </div>
    </header>

    <div class="mx-auto flex max-w-6xl gap-10 px-5 py-10 sm:px-8">
      <aside class="hidden w-56 shrink-0 lg:block">
        <nav aria-label="On this page" class="sticky top-24">
          <p class="eyebrow mb-3">On this page</p>
          <ul class="space-y-1">
            <li v-for="s in sections" :key="s.id">
              <a
                :href="`#${s.id}`"
                class="block rounded-md px-2 py-1 text-sm transition-colors"
                :style="activeId === s.id
                  ? 'color: var(--ink); background: var(--surface-strong); font-weight: 500'
                  : 'color: var(--muted)'"
              >{{ s.label }}</a>
            </li>
          </ul>
        </nav>
      </aside>

      <main class="min-w-0 flex-1">
        <h1 class="page-title">Integrate Shoot SEO</h1>
        <p class="lede mt-3 max-w-2xl">Pull your published content into any site or app through the headless <strong>Public API v1</strong> — with an official SDK, signed webhooks, and a cookieless analytics beacon.</p>

        <section id="overview" class="doc-section">
          <h2 class="doc-h2">Overview</h2>
          <p>The Public API v1 serves your workspace's published posts as JSON. Everything lives under an API <em>root</em> that serves <code>/v1/...</code> — e.g. <code>https://app.acme.com/api</code> means requests go to <code>https://app.acme.com/api/v1/posts</code>. The official <code>@shoot-seo/sdk</code> is a tiny, dependency-free TypeScript client for it (Node 18+, browsers, and edge runtimes).</p>
        </section>

        <section id="api-key" class="doc-section">
          <h2 class="doc-h2">Get your API key</h2>
          <p>In the app, open <strong>Settings → API keys</strong> and create a key for the workspace. It is sent as <code>Authorization: Bearer &lt;apiKey&gt;</code>. Treat it as a <strong>secret</strong>: keep it on your server or an edge function, and never ship it in a client-side bundle — proxy requests through your own backend route instead.</p>
        </section>

        <section id="quickstart" class="doc-section">
          <h2 class="doc-h2">Install &amp; quickstart</h2>
          <MarketingCodeBlock :code="installCode" lang="bash" />
          <MarketingCodeBlock :code="quickstartCode" lang="ts" />
          <p><code>baseUrl</code> must point at the API root that serves <code>/v1/...</code> (the SDK appends <code>/v1/posts</code> etc.).</p>
        </section>

        <section id="fetch" class="doc-section">
          <h2 class="doc-h2">Fetch content</h2>
          <p>List published posts (newest first) or fetch one by slug. <code>posts.get()</code> resolves to <code>null</code> on a 404 instead of throwing.</p>
          <MarketingCodeBlock :code="listCode" lang="ts" />
          <p>Each post has this shape. <code>content</code> is server-rendered HTML; map the <code>seo</code> fields into your <code>&lt;head&gt;</code>, and use <code>translations</code> to emit hreflang links. Page through with <code>meta.total</code> until you have them all.</p>
          <MarketingCodeBlock :code="shapeCode" lang="ts" />
        </section>

        <section id="render" class="doc-section">
          <h2 class="doc-h2">Render HTML safely</h2>
          <p><code>post.content</code> is trusted, server-authored HTML from your own workspace — but treat it like any injected HTML and sanitize on the boundary (e.g. <code>sanitize-html</code> on the server or DOMPurify in the browser), especially if editors are untrusted.</p>
          <MarketingCodeBlock :code="renderVueCode" lang="vue" />
          <MarketingCodeBlock :code="renderReactCode" lang="tsx" />
        </section>

        <section id="webhooks" class="doc-section">
          <h2 class="doc-h2">Webhooks</h2>
          <p>Shoot SEO signs each delivery with <strong>HMAC-SHA256 over the raw request body</strong>, sent in the <code>X-ShutSEO-Signature</code> header as <code>sha256=&lt;hex&gt;</code>. Verify against the <strong>raw</strong> bytes — never a re-serialized object. Events are <code>post.published</code> and <code>post.unpublished</code>.</p>
          <MarketingCodeBlock :code="webhookCode" lang="ts" />
        </section>

        <section id="beacon" class="doc-section">
          <h2 class="doc-h2">Analytics beacon</h2>
          <p>Drop the cookieless beacon onto pages that render your content. It sends one <code>view</code> on load and one <code>engagement</code> (scroll depth + active time) on unload, to <code>{baseUrl}/v1/analytics/collect</code>. <code>siteId</code> is your <strong>public</strong> workspace id (not a secret), safe to ship to the browser.</p>
          <MarketingCodeBlock :code="beaconCode" lang="html" />
        </section>

        <section id="frameworks" class="doc-section">
          <h2 class="doc-h2">Framework guides</h2>
          <p><strong>Nuxt</strong> — call the SDK from a server route via <code>@shoot-seo/sdk/nuxt</code>.</p>
          <MarketingCodeBlock :code="nuxtCode" lang="ts" />
          <p><strong>Next.js</strong> (App Router) — fetch in a Server Component.</p>
          <MarketingCodeBlock :code="nextCode" lang="tsx" />
          <p><strong>Express</strong> — capture the raw body to verify webhook signatures.</p>
          <MarketingCodeBlock :code="expressCode" lang="ts" />
        </section>

        <section id="errors" class="doc-section">
          <h2 class="doc-h2">Errors &amp; rate limits</h2>
          <p>Any non-2xx response throws a <code>ShutSeoApiError</code> with <code>.status</code>, <code>.url</code>, and <code>.body</code> (the exception is <code>posts.get()</code>, which returns <code>null</code> on 404). <code>401</code> means a bad API key; <code>429</code> means you are rate limited — see the <code>X-RateLimit-*</code> headers.</p>
          <MarketingCodeBlock :code="errorsCode" lang="ts" />
        </section>
      </main>
    </div>

    <MarketingFooter />
  </div>
</template>

<style scoped>
.doc-section {
  scroll-margin-top: 5rem;
  padding-top: 2.5rem;
}
.doc-h2 {
  font-family: var(--font-display);
  font-weight: 300;
  font-size: 1.6rem;
  letter-spacing: -0.01em;
  color: var(--ink);
  margin-bottom: 0.75rem;
}
.doc-section :deep(p) {
  color: var(--body);
  line-height: 1.6;
  margin: 0.85rem 0;
  max-width: 42rem;
}
.doc-section :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.85em;
  padding: 0.1rem 0.35rem;
  border-radius: 6px;
  background: var(--surface-strong);
  color: var(--ink);
}
.doc-section :deep(.code-block) {
  margin: 1rem 0;
  max-width: 42rem;
}
.doc-section :deep(.code-block code) {
  background: none;
  padding: 0;
}
</style>
