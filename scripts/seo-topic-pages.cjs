// Course-choice guides for the topic pages, written from verified repo data (2026-11-18).
// Called by seo-course-enhance.cjs so the block survives the weekly render.
const fs = require('node:fs');
const path = require('node:path');

const SITE = 'https://nh-it-training.de/';
const DATA = path.join(__dirname, 'topic-guides.json');
const GUIDES = fs.existsSync(DATA) ? require(DATA) : {};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function courseTitle(slug) {
  const file = path.join(__dirname, '..', 'kurse', `${slug}.html`);
  const h1 = fs.readFileSync(file, 'utf8').match(/<h1>([^<]*)<\/h1>/);
  return h1 ? h1[1].trim() : slug;
}

function guideBlock(g) {
  const steps = g.steps.map((s) => `<article><span>${esc(s.label)}</span><p>${esc(s.text)}</p>${s.courses.length ? `<p>${s.courses.map((c) => `<a href="../kurse/${c}.html">${esc(courseTitle(c))}</a>`).join(', ')}</p>` : ''}</article>`).join('');
  const faq = g.faq.map((f, i) => `<details${i ? '' : ' open'}><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const sources = (g.sources || []).length
    ? `\n  <p>Quellen: ${g.sources.map((s) => `<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>`).join(', ')}.</p>`
    : '';
  return `<!-- topic-guide-start -->
<section class="detail-block">
  <h2>${esc(g.heading)}</h2>
  <p>${esc(g.intro)}</p>
  <div class="detail-info-grid">${steps}</div>${sources}
</section>
<section class="detail-block seo-course-faq">
  <p class="eyebrow dark">FAQ</p>
  <h2>Häufige Fragen zum Thema</h2>
  <div class="faq-list">${faq}</div>
</section>
<!-- topic-guide-end -->`;
}

function faqSchema(g, file) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}trainings/${file}#faq`,
    mainEntity: g.faq.map((f) => ({'@type': 'Question', name: f.q, acceptedAnswer: {'@type': 'Answer', text: f.a}})),
  };
  return `<script type="application/ld+json" id="topic-faq-schema">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function enhanceTopic(html, file) {
  const g = GUIDES[file.replace(/\.html$/, '')];
  if (!g) return html;
  // Replace earlier output in place so reruns leave the file unchanged.
  let out = html;
  const block = /<!-- topic-guide-start -->[\s\S]*?<!-- topic-guide-end -->/;
  const official = out.match(/<section class="detail-block" data-official-topics>[\s\S]*?<\/section>/);
  if (block.test(out)) out = out.replace(block, () => guideBlock(g));
  else if (official) out = out.replace(official[0], () => `${official[0]}\n${guideBlock(g)}`);
  else out = out.replace('<div class="choice-content">', () => `<div class="choice-content">\n${guideBlock(g)}`);
  const schema = /<script type="application\/ld\+json" id="topic-faq-schema">[\s\S]*?<\/script>/;
  if (schema.test(out)) return out.replace(schema, () => faqSchema(g, file));
  return out.replace('</head>', () => `  ${faqSchema(g, file)}\n  </head>`);
}

module.exports = {TOPIC_FILES: Object.keys(GUIDES).map((k) => `trainings/${k}.html`), enhanceTopic};
