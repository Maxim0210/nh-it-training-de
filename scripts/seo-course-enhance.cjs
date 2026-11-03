// Adds fact-based answers and structured data to the existing pages. Safe to rerun after render-official-courses.cjs.
// Usage: node scripts/seo-course-enhance.cjs --date=YYYY-MM-DD
const fs = require('node:fs');
const path = require('node:path');

const dateArg = process.argv.find((a) => a.startsWith('--date='))?.slice(7);
const today = dateArg || new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Berlin'}).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Invalid --date');

const SITE = 'https://nh-it-training.de/';
const ORG = {'@type': 'EducationalOrganization', '@id': `${SITE}#organization`, name: 'New Horizons IT-Weiterbildung', url: SITE};
const LANG = {Deutsch: ['de'], Englisch: ['en'], 'Deutsch oder Englisch': ['de', 'en']};
const MONTHS = {jan: 1, feb: 2, mär: 3, mar: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dez: 12};
const GENERIC_TEACHES = /Kurs$|online$|Weiterbildung|Training|Firmenseminar/i;

// Verified on 2026-11-03 against the linked Microsoft study guides. Recheck when Microsoft updates an exam.
const EXAMS = {
  'az-104-microsoft-azure-administrator.html': {
    code: 'AZ-104',
    replaceAgenda: true,
    source: 'https://learn.microsoft.com/de-de/credentials/certifications/resources/study-guides/az-104',
    asOf: '26.10.2023',
    skills: [
      ['Azure-Identitäten und Governance verwalten', '20–25 %'],
      ['Speicher implementieren und verwalten', '15–20 %'],
      ['Azure-Compute-Ressourcen bereitstellen und verwalten', '20–25 %'],
      ['Virtuelle Netzwerke implementieren und verwalten', '15–20 %'],
      ['Azure-Ressourcen überwachen und warten', '10–15 %'],
    ],
  },
  'pl-300-power-bi-data-analyst.html': {
    code: 'PL-300',
    source: 'https://learn.microsoft.com/de-de/credentials/certifications/resources/study-guides/pl-300',
    asOf: '20.04.2026',
    skills: [
      ['Daten vorbereiten', '25–30 %'],
      ['Daten modellieren', '25–30 %'],
      ['Daten visualisieren und analysieren', '25–30 %'],
      ['Power BI verwalten und absichern', '15–20 %'],
    ],
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const text = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().replace(/ ([.,;:?!])/g, '$1');
const german = (iso) => iso.split('-').reverse().join('.');
const ld = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

function rowEnd(start, label) {
  const year = label.match(/\b20\d{2}\b/g)?.at(-1);
  const parts = [...label.matchAll(/(\d{1,2})\.\s*([A-Za-zÄäÖöÜü]{3})/g)];
  const month = parts.length ? MONTHS[parts.at(-1)[2].toLowerCase()] : null;
  if (!year || !month) return null;
  const end = `${year}-${String(month).padStart(2, '0')}-${parts.at(-1)[1].padStart(2, '0')}`;
  return end >= start ? end : null;
}

function upcoming(html) {
  const rows = [];
  for (const [, start, body] of html.matchAll(/<li data-course-start="(\d{4}-\d{2}-\d{2})"[^>]*>([\s\S]*?)<\/li>/g)) {
    // Same policy as the catalogue: a date-only start expires at the beginning of its day.
    if (start <= today) continue;
    const gross = body.match(/([\d.]+,\d{2})\s*€\s*inkl\.\s*MwSt/)?.[1];
    rows.push({
      start,
      end: rowEnd(start, text(body.match(/<time[\s\S]*?<\/time>/)?.[0] || '')),
      online: /Online-Teilnahme/.test(body),
      gross,
      price: gross ? gross.replace(/\./g, '').replace(',', '.') : null,
    });
  }
  return rows;
}

function summary(page) {
  const facts = [];
  if (page.duration && page.duration !== 'Dauer auf Anfrage') facts.push(`Dauer: ${page.duration}`);
  if (page.language) facts.push(`Sprache: ${page.language}`);
  if (page.form) facts.push(`Durchführung: ${page.form}`);
  const next = page.rows[0];
  if (next) {
    facts.push(`Nächster Start: ${german(next.start)}${next.online ? ', online' : ''}`);
    facts.push(next.gross ? `Preis: ${next.gross} € inkl. MwSt.` : 'Preis: auf Anfrage');
  } else {
    facts.push('Termine und Preise: auf Anfrage');
  }
  const area = page.theme ? ` aus dem Bereich ${esc(page.theme)}` : '';
  return `<!-- course-summary-start -->
            <h2>${esc(page.title)} in Kürze</h2>
            <p><strong>${esc(page.title)}</strong> ist ein Training${area}. Schwerpunkte: ${page.hero}</p>
            <ul class="course-facts">${facts.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
<!-- course-summary-end -->`;
}

function examBlock(exam) {
  return `<!-- course-exam-start -->
          <section class="detail-block">
            <h2>Was prüft ${exam.code}?</h2>
            <p>Der Kurs ist auf die Microsoft-Prüfung ${exam.code} ausgerichtet. Microsoft gewichtet die Themen so (Stand der Prüfungsinhalte: ${exam.asOf}):</p>
            <ul>${exam.skills.map(([skill, share]) => `<li>${skill}: ${share}</li>`).join('')}</ul>
            <p>Zum Bestehen sind mindestens 700 Punkte nötig. Die Zertifizierung läuft jährlich aus und lässt sich über eine kostenlose Online-Prüfung bei Microsoft Learn verlängern. Quelle: <a href="${exam.source}" rel="noopener">offizieller Microsoft-Studienleitfaden ${exam.code}</a>.</p>
          </section>
<!-- course-exam-end -->`;
}

function updateSchema(html, page, file) {
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (all, open, json, close) => {
    const data = JSON.parse(json);
    const course = (data['@graph'] || [data]).find((node) => node['@type'] === 'Course');
    if (!course) { console.warn(`No Course schema: ${file}`); return all; }
    const languages = LANG[page.language] || (typeof course.inLanguage === 'string' ? [course.inLanguage] : course.inLanguage);
    course.inLanguage = languages.length === 1 ? languages[0] : languages;
    course.provider = ORG;
    if (Array.isArray(course.teaches)) {
      course.teaches = course.teaches.filter((t) => !t.startsWith(page.title) && !GENERIC_TEACHES.test(t));
      if (!course.teaches.length) delete course.teaches;
    }
    const days = page.duration?.match(/^(\d+) Tage?$/)?.[1];
    if (page.rows.length) {
      course.hasCourseInstance = page.rows.map((row) => ({
        '@type': 'CourseInstance',
        ...(row.online ? {courseMode: 'online'} : {}),
        startDate: row.start,
        ...(row.end ? {endDate: row.end} : {}),
        inLanguage: course.inLanguage,
        ...(days ? {courseWorkload: `P${days}D`} : {}),
        ...(row.price ? {offers: {'@type': 'Offer', category: 'Paid', price: row.price, priceCurrency: 'EUR', url: course.url}} : {}),
      }));
    } else {
      delete course.hasCourseInstance;
    }
    return open + ld(data) + close;
  });
}

function enhanceCourse(html, file) {
  const metaBlock = html.match(/<div class="course-hero-meta">([\s\S]*?)<\/div>/)?.[1];
  const title = text(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] || '');
  const hero = html.match(/<p class="hero-text">([\s\S]*?)<\/p>/)?.[1].trim();
  if (!metaBlock || !title || !hero) { console.warn(`Skipped: ${file}`); return html; }
  const [duration, language, form] = [...metaBlock.matchAll(/<span>([\s\S]*?)<\/span>/g)].map((m) => text(m[1]));
  const theme = text(html.match(/<p class="eyebrow">([\s\S]*?)<\/p>/)?.[1] || '').split('|')[1]?.trim();
  const page = {title, hero, duration, language, form, theme, rows: upcoming(html)};

  let out = html.replace(/\s*<!-- course-summary-start -->[\s\S]*?<!-- course-summary-end -->/, '');
  out = out.replace(/(<section class="detail-block compact-intro">)/, () => `<section class="detail-block compact-intro">\n            ${summary(page)}`);

  const exam = EXAMS[file];
  if (exam) {
    const existing = /<!-- course-exam-start -->[\s\S]*?<!-- course-exam-end -->/;
    const agenda = /<section class="detail-block">\s*<h2>Kursinhalte und Agenda<\/h2>[\s\S]*?<\/section>/;
    if (existing.test(out)) out = out.replace(existing, () => examBlock(exam));
    else if (agenda.test(out)) out = out.replace(agenda, (m) => (exam.replaceAgenda ? examBlock(exam) : `${examBlock(exam)}\n\n          ${m}`));
    else out = out.replace(/<h2>Worum geht es in diesem Kurs\?<\/h2>[\s\S]*?<\/section>/, (m) => `${m}\n\n          ${examBlock(exam)}`);
  }

  out = out
    .replace('Was du nach dem Kurs besser kannst', 'Was Sie nach dem Kurs besser können')
    .replace(/<h2>[^<]*richtig einordnen<\/h2>/, '<h2>Verwandte Kurse und Themen</h2>')
    .replace(/\s*<p>[^<]*Interessenten können den Kurs über[^<]*<\/p>/, '');
  return updateSchema(out, page, file);
}

function enhanceHome(html) {
  const faq = html.match(/<section class="section faq">([\s\S]*?)<\/section>/)?.[1];
  if (!faq) throw new Error('Homepage FAQ not found');
  const items = [...faq.matchAll(/<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g)];
  if (!items.length) throw new Error('Homepage FAQ is empty');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}#faq`,
    mainEntity: items.map(([, q, a]) => ({'@type': 'Question', name: text(q), acceptedAnswer: {'@type': 'Answer', text: text(a)}})),
  };
  const tag = `<script type="application/ld+json" id="home-faq-schema">${ld(schema)}</script>`;
  const existing = /<script type="application\/ld\+json" id="home-faq-schema">[\s\S]*?<\/script>/;
  return existing.test(html) ? html.replace(existing, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function enhanceCatalog(html) {
  if (html.includes('property="og:image"')) return html;
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/)[1]);
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  const image = `${SITE}assets/hero-training-neutral.webp`;
  const url = `${SITE}kursangebote.html`;
  const tags = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:locale" content="de_DE">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].join('\n    ');
  return html.replace('</head>', `    ${tags}\n  </head>`);
}

const changed = [];
function apply(file, transform) {
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after !== before) { fs.writeFileSync(file, after); changed.push(file); }
}

for (const name of fs.readdirSync('kurse').filter((f) => f.endsWith('.html'))) {
  apply(path.posix.join('kurse', name), (html) => enhanceCourse(html, name));
}
apply('index.html', enhanceHome);
apply('kursangebote.html', enhanceCatalog);

if (changed.length) {
  apply('sitemap.xml', (xml) => changed.reduce((acc, file) => {
    const loc = SITE + (file === 'index.html' ? '' : encodeURI(file));
    return acc.split(`<loc>${loc}</loc>`).length > 1
      ? acc.replace(new RegExp(`(<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc><lastmod>)[^<]+`), `$1${today}`)
      : acc;
  }, xml));
}
console.log(`Date ${today}. Changed ${changed.length} files.`);
