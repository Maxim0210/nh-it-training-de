// "Prüfung und Kosten" block for the indexable course pages, from vendor facts checked on the date
// in exam-facts.json. Called by seo-course-enhance.cjs; replaces its own block in place on reruns.
const fs = require('node:fs');
const path = require('node:path');

const DATA = path.join(__dirname, 'exam-facts.json');
const FACTS = fs.existsSync(DATA) ? require(DATA) : {asOf: '', courses: {}};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const START = '<!-- exam-facts-start -->';
const END = '<!-- exam-facts-end -->';

function block(c) {
  const exams = c.exams.map((e) => {
    const heading = e.code ? `Prüfung ${esc(e.code)}${e.name && e.name !== e.code ? `: ${esc(e.name)}` : ''}` : `Prüfung: ${esc(e.name)}`;
    const rows = e.rows.map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('');
    return `  <h3>${heading}</h3>\n  <ul>${rows}</ul>`;
  }).join('\n');
  const withSource = c.exams.filter((e, i) => e.source && c.exams.findIndex((x) => x.source === e.source) === i);
  const sources = withSource.map((e) => `<a href="${esc(e.source)}" rel="noopener">${withSource.length > 1 && e.code ? `Herstellerseite ${esc(e.code)}` : 'Herstellerseite'}</a>`);
  for (const s of c.extraSources || []) sources.push(`<a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a>`);
  const intro = `Der Kurs bereitet auf die Zertifizierung ${esc(c.certification)} vor.${c.note ? ` ${esc(c.note)}` : ''}`;
  return `${START}
<section class="detail-block" data-exam-facts>
  <h2>Prüfung und Kosten</h2>
  <p>${intro}</p>
${exams}
${c.renewal ? `  <p>${esc(c.renewal)}</p>\n` : ''}  <p>Herstellerangaben, Stand ${esc(FACTS.asOf)}: ${sources.join(', ')}. Preise und Bedingungen können sich ändern; maßgeblich ist die Angabe des Herstellers bei der Buchung.</p>
</section>
${END}`;
}

function applyExamFacts(html, file) {
  const c = FACTS.courses[file.replace(/\.html$/, '')];
  const existing = new RegExp(`${START}[\\s\\S]*?${END}`);
  if (!c) return html.replace(existing, '').replace(/\n{3,}/g, '\n\n');
  if (existing.test(html)) return html.replace(existing, () => block(c));
  if (!html.includes('<!-- course-content-end -->')) return html;
  return html.replace('<!-- course-content-end -->', () => `<!-- course-content-end -->\n${block(c)}`);
}

module.exports = {applyExamFacts};
