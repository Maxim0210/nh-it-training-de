// City page content. Called by seo-course-enhance.cjs so the listed dates stay current.
// Sources checked on 2026-11-03: centre data from newhorizons.de/standorte, funding from the linked public bodies.
const fs = require('node:fs');

const SITE = 'https://nh-it-training.de/';
// Contacts named by the owner on 2026-11-04.
const B2B = {name: 'Max Dilewski', phone: '089 997 409 352', phoneIntl: '+4989997409352', email: 'max.dilewski@nhacademy.de'};
const link = (url, label) => `<a href="${url}" rel="noopener">${label}</a>`;
const BA_GUTSCHEIN = 'https://www.arbeitsagentur.de/karriere-und-weiterbildung/bildungsgutschein';
const BA_FIRMEN = 'https://www.arbeitsagentur.de/unternehmen/finanziell/foerderung-von-weiterbildung/individuelle-foerderung';
const ESF_BY = 'https://www.esf.bayern.de/esf-foerderung/foerderaktion/fp2021-2027/betrieblicheweiterbildung.php';

const firmen = (agency) => `<li><strong>Beschäftigte und Unternehmen:</strong> Bei Weiterbildungen mit mehr als 120 Stunden kann die ${agency} Lehrgangskosten übernehmen. Bei unter 50 Beschäftigten sollen sie zu 100 %, bei unter 500 zu 50 % und ab 500 zu 25 % übernommen werden. Kurs und Träger müssen zugelassen sein. Den Arbeitgeber-Service erreichen Sie unter 0800 4 5555-20, montags bis freitags von 8 bis 18 Uhr (${link(BA_FIRMEN, 'Bundesagentur für Arbeit')}).</li>`;
const gutschein = (agency, address) => `<li><strong>Bildungsgutschein:</strong> Darüber entscheidet die ${agency} (${address}), seit dem 01.01.2025 auch für Kundinnen und Kunden des Jobcenters. Beratung und Gutschein müssen vor Kursbeginn vorliegen (${link(BA_GUTSCHEIN, 'Bundesagentur für Arbeit')}).</li>`;
const esfBayern = `<li><strong>Förderung in Bayern:</strong> Über die ESF+-Aktion 1.3 Betriebliche Weiterbildung können Unternehmen die Qualifizierung eigener Beschäftigter beantragen. Das Programm nennt 50 % der Kosten externer Dienstleister ab fünf Teilnehmenden. Ob derzeit Mittel verfügbar sind, klärt die Antragsstelle (${link(ESF_BY, 'ESF in Bayern')}).</li>`;

const CITIES = {
  'it-weiterbildung-online-münchen.html': {
    city: 'München',
    slug: 'm%C3%BCnchen',
    title: 'IT-Schulungen München: Kurse & Förderung | New Horizons',
    description: 'IT-Schulungen in München: New Horizons am Stahlgruberring, Online-Live-Kurse mit Terminen und Preisen, Firmenseminare und Beratung zur Förderung.',
    hero: 'Azure, Microsoft 365, Security, KI und Projektmanagement: im New Horizons Center am Stahlgruberring, online live oder als Firmenseminar.',
    street: 'Stahlgruberring 11-11a', zip: '81829', phone: '089 997 409 350', phoneIntl: '+4989997409350', email: 'muenchen@newhorizons.de',
    walkin: 'Montag bis Freitag, 9:00 bis 17:00 Uhr',
    source: 'https://www.newhorizons.de/standorte/muenchen',
    region: 'Freising, Dachau, Erding, Fürstenfeldbruck, Starnberg und Ebersberg',
    azav: {name: 'Petra Kaufmann', phone: '089 997 409 355', phoneIntl: '+4989997409355', email: 'petra.kaufmann@newhorizons-muenchen.de'},
    agency: 'Agentur für Arbeit München', agencyAddress: 'Kapuzinerstraße 26',
    funding: () => [
      gutschein('Agentur für Arbeit München', 'Kapuzinerstraße 26'),
      firmen('Agentur für Arbeit München'),
      esfBayern,
      `<li><strong>Neutrale Beratung:</strong> Die ${link('https://stadt.muenchen.de/service/info/weiterbildungsberatung/10313312/', 'Bildungsberatung der Landeshauptstadt München')} in der Goethestraße 12 berät kostenlos zu Weiterbildung und Förderung (089 233-83300). Auch die ${link('https://www.ihk-muenchen.de/ausbildung-fortbildung/fortbildung/foerderprogramme/', 'IHK für München und Oberbayern')} nennt eine trägerunabhängige Beratung für Beschäftigte und Betriebe.</li>`,
    ],
    picks: ['az-900-microsoft-azure-grundlagen', 'az-104-microsoft-azure-administrator', 'pl-300-power-bi-data-analyst', 'comptia-security-plus', 'itil-4-foundation', 'tableau-desktop-i-fundamentals'],
    swap: ['ms-102-microsoft-365-administrator', 'tableau-desktop-i-fundamentals', 'Tableau Desktop · Tableau'],
  },
  'it-weiterbildung-online-nürnberg.html': {
    city: 'Nürnberg',
    slug: 'n%C3%BCrnberg',
    title: 'IT-Schulungen Nürnberg: Kurse & Förderung | New Horizons',
    description: 'IT-Schulungen in Nürnberg: New Horizons in der Königstraße, Online-Live-Kurse mit Terminen und Preisen, Firmenseminare und Beratung zur Förderung.',
    hero: 'Cloud, Netzwerk, Security und Microsoft: im New Horizons Center in der Königstraße, online live oder als Firmenseminar.',
    street: 'Königstraße 73', zip: '90402', phone: '0911 51 77 80 70', phoneIntl: '+4991151778070', email: 'nuernberg@newhorizons.de',
    walkin: 'Montag bis Freitag, 9:00 bis 12:30 Uhr und 13:00 bis 16:30 Uhr',
    source: 'https://www.newhorizons.de/standorte/nuernberg',
    region: 'Fürth, Erlangen, Schwabach, Ansbach und Forchheim',
    azav: {name: 'Sandra Stich', phone: '0911 51 77 80 71', phoneIntl: '+4991151778071', email: 'sandra.stich@newhorizons-nuernberg.de'},
    agency: 'Agentur für Arbeit Nürnberg', agencyAddress: 'Richard-Wagner-Platz 5',
    funding: () => [
      gutschein('Agentur für Arbeit Nürnberg', 'Richard-Wagner-Platz 5'),
      firmen('Agentur für Arbeit Nürnberg'),
      esfBayern,
      `<li><strong>Neutrale Beratung:</strong> Die ${link('https://www.ihk-nuernberg.de/weiterbildung/traegerneutrale-weiterbildungsberatung', 'IHK Nürnberg für Mittelfranken')} bietet eine kostenlose, trägerneutrale Weiterbildungsberatung für Einzelpersonen und Unternehmen. ${link('https://weiterbildung.jetzt/', 'WeiterbildungJETZT!')}, eine Initiative unter anderem von IHK, Stadt Nürnberg und Agentur für Arbeit, listet weitere neutrale Beratungsstellen.</li>`,
    ],
    picks: ['az-104-microsoft-azure-administrator', 'md-102-endpoint-administrator-associate', 'comptia-security-plus', 'comptia-cysa-plus', 'itil-4-foundation'],
    swap: ['ms-102-microsoft-365-administrator', 'md-102-endpoint-administrator-associate', 'Endpoint Administrator · Microsoft'],
  },
  'it-weiterbildung-online-stuttgart.html': {
    city: 'Stuttgart',
    slug: 'stuttgart',
    partner: true,
    title: 'IT-Schulungen Stuttgart: Kurse & Förderung | New Horizons',
    description: 'IT-Schulungen in Stuttgart: New Horizons in der Pragstraße, Online-Live-Kurse mit Terminen und Preisen, Firmenseminare und Beratung zur Förderung.',
    hero: 'Microsoft, KI, Security, Daten und Projektmanagement: im New Horizons Center in der Pragstraße, online live oder als Firmenseminar.',
    street: 'Pragstraße 10', zip: '70376', phone: '0711 97 57 57 21', phoneIntl: '+4971197575721', email: 'stuttgart@newhorizons.de',
    source: 'https://www.newhorizons.de/standorte/stuttgart',
    region: 'Esslingen, Ludwigsburg, Böblingen, Sindelfingen und Waiblingen',
    azav: {name: 'Luka Valjan', phone: '0711 97 57 57 22', phoneIntl: '+4971197575722', email: 'luka.valjan@newhorizons-stuttgart.de'},
    agency: 'Agentur für Arbeit Stuttgart', agencyAddress: 'Nordbahnhofstraße 30-34',
    funding: () => [
      gutschein('Agentur für Arbeit Stuttgart', 'Nordbahnhofstraße 30-34'),
      firmen('Agentur für Arbeit Stuttgart'),
      `<li><strong>ESF-Plus-Fachkurse in Baden-Württemberg:</strong> Für Kursbeginne ab dem 01.09.2026 nennt das Land 45 % Zuschuss auf Kurse mit 8 bis 160 Unterrichtseinheiten und höchstens 6.000 Euro ohne Mehrwertsteuer. Fernlehrgänge sind ausgeschlossen, und Träger bieten das Programm freiwillig an (${link('https://www.esf-bw.de/vom-esf-profitieren/berufliche-weiterbildung/esf-foerderprogramm-fachkurse', 'ESF Baden-Württemberg')}).</li>`,
      `<li><strong>Bildungszeit:</strong> Beschäftigte in Baden-Württemberg haben nach zwölf Monaten Anspruch auf fünf bezahlte Arbeitstage Freistellung pro Kalenderjahr. Der Antrag muss spätestens neun Wochen vor Beginn gestellt werden, und der Anbieter muss anerkannt sein. Die Kursgebühr tragen in der Regel die Beschäftigten (${link('https://rp.baden-wuerttemberg.de/themen/bildung/seiten/bildungszeit/', 'Regierungspräsidien Baden-Württemberg')}).</li>`,
      `<li><strong>Neutrale Beratung:</strong> Das ${link('https://vhs-stuttgart.de/beratung-foerderung/beratung', 'vhs Beratungszentrum Stuttgart')} berät kostenlos zu Weiterbildung und Förderung. Die ${link('https://www.ihk.de/stuttgart/bildung-schulung-pruefung/weiterbildung/rund-um-weiterbildung-4173856', 'IHK Region Stuttgart')} führt eine Weiterbildungsberatung unter 0711 2005-1132.</li>`,
    ],
    picks: ['az-900-microsoft-azure-grundlagen', 'az-104-microsoft-azure-administrator', 'pl-300-power-bi-data-analyst', 'comptia-security-plus', 'itil-4-foundation'],
  },
};

function coursePage(slug) {
  const html = fs.readFileSync(`kurse/${slug}.html`, 'utf8');
  const clean = (s) => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const title = clean(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1] || slug);
  const hero = clean(html.match(/<p class="hero-text">([\s\S]*?)<\/p>/)?.[1] || '');
  const meta = html.match(/<div class="course-hero-meta">([\s\S]*?)<\/div>/)?.[1] || '';
  const [duration, language, form] = [...meta.matchAll(/<span>([\s\S]*?)<\/span>/g)].map((m) => clean(m[1]));
  const theme = clean(html.match(/<p class="eyebrow">([\s\S]*?)<\/p>/)?.[1] || '').split('|')[1]?.trim() || '';
  const rows = [...html.matchAll(/<li data-course-start="(\d{4}-\d{2}-\d{2})"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => ({
    start: m[1],
    label: clean(m[2].match(/<time[^>]*>([\s\S]*?)<\/time>/)?.[1] || m[1]),
    place: clean(m[2].match(/<span>([\s\S]*?)<\/span>/)?.[1] || '').split('·')[0].trim(),
    gross: m[2].match(/([\d.]+,\d{2})\s*€\s*inkl\.\s*MwSt/)?.[1],
  }));
  return {slug, title, hero, duration, language, form, theme, rows};
}

function nextDates(c, today) {
  const items = c.picks.map(coursePage).flatMap((p) => {
    // Same policy as the catalogue: a date-only start expires at the beginning of its day.
    const row = p.rows.filter((r) => r.start > today && r.place === 'Online-Teilnahme').sort((a, b) => a.start.localeCompare(b.start))[0];
    return row ? [{p, row}] : [];
  }).sort((a, b) => a.row.start.localeCompare(b.row.start));
  if (!items.length) return '';
  const li = items.map(({p, row}) => `<li><a href="kurse/${p.slug}.html">${p.title}</a>: ${row.label}, ${row.place}, ${row.gross ? `${row.gross} € inkl. MwSt.` : 'Preis auf Anfrage'}</li>`).join('');
  return `
          <section class="detail-block">
            <h2>Nächste Termine für ausgewählte Kurse</h2>
            <p>Die veröffentlichten Termine dieser Kurse sind Termine mit Online-Teilnahme, sodass Sie aus ${c.city} ohne Anreise teilnehmen können. Weitere Termine und alle Preise stehen in den ${'<a href="kursangebote.html">Kursangeboten</a>'}.</p>
            <ul class="course-facts">${li}</ul>
          </section>`;
}

const contact = (p) => `${p.name}, <a href="tel:${p.phoneIntl}">${p.phone}</a>, <a href="mailto:${p.email}">${p.email}</a>`;

function faqItems(c) {
  return [
    [`Wo finde ich New Horizons in ${c.city}?`, `New Horizons ${c.city} sitzt ${c.street.startsWith('Stahlgruberring') ? 'am' : 'in der'} ${c.street}, ${c.zip} ${c.city}.${c.partner ? ' Das Center wird von unserem Partner betrieben.' : ''} Es ist montags bis freitags von 8:30 bis 17:00 Uhr geöffnet und unter ${c.phone} erreichbar.`],
    [`Kann ich aus ${c.city} online an einer IT-Schulung teilnehmen?`, `Ja. Für viele Kurse sind Termine mit Online-Teilnahme veröffentlicht, in der Regel von 9:00 bis 17:00 Uhr. Welche Form für Ihren Kurs möglich ist, steht auf der jeweiligen Kursseite oder wird vor der Anmeldung geklärt.`],
    [`Wer entscheidet in ${c.city} über einen Bildungsgutschein?`, `Über den Bildungsgutschein entscheidet die ${c.agency}. Beratung und Gutschein müssen vor Kursbeginn vorliegen. Alle Kurse auf dieser Website sind für den Bildungsgutschein zugelassen. Ihr Kontakt bei uns: ${c.azav.name}, ${c.azav.phone}, ${c.azav.email}.`],
    [`Gibt es Firmenseminare für Unternehmen in ${c.city}?`, `Ja. Firmenseminare und Teamschulungen werden nach Rollen, Gruppengröße, Lernziel, Sprache und Termin abgestimmt, online oder vor Ort. Ihr Kontakt: ${B2B.name}, ${B2B.phone}, ${B2B.email}.`],
  ];
}

function cityBlock(c, today) {
  const walkin = c.walkin ? `<li>WalkIn-Trainingszeiten: ${c.walkin}</li>` : '';
  return `<!-- city-content-start -->
          <section class="detail-block compact-intro">
            <h2>New Horizons in ${c.city}</h2>
            <p>New Horizons ${c.city} bietet IT-Schulungen und berät zu Kursen, Zertifizierung und Förderung.${c.partner ? ' Das Center betreibt unser Partner New Horizons Stuttgart. Beratung erhalten Sie dort oder bei uns.' : ''} Je nach Kurs nehmen Sie im Center, online live oder gemeinsam mit Ihrem Team im Firmenseminar teil.</p>
            <ul class="course-facts"><li>Adresse: ${c.street}, ${c.zip} ${c.city}</li><li>Telefon: <a href="tel:${c.phoneIntl}">${c.phone}</a></li><li>E-Mail: <a href="mailto:${c.email}">${c.email}</a></li><li>Öffnungszeiten: Montag bis Freitag, 8:30 bis 17:00 Uhr</li>${walkin}</ul>
            <p>WalkIn bedeutet: flexibel im eigenen Tempo lernen, mit persönlicher Unterstützung. Wir beraten auch Unternehmen und Teilnehmende aus ${c.region}. Quelle der Standortdaten: ${link(c.source, `New Horizons ${c.city}`)}.</p>
          </section>${nextDates(c, today)}
          <section class="detail-block">
            <h2>Förderung für Weiterbildung in ${c.city}</h2>
            <p><strong>Fördermöglichkeiten für Arbeitsuchende:</strong> ${contact(c.azav)}</p>
            <p><strong>QCG und Firmenseminare:</strong> ${contact(B2B)}</p>
            <ul>${c.funding().join('')}</ul>
            <p>Alle Kurse auf dieser Website sind für den Bildungsgutschein zugelassen. Ob Sie die Voraussetzungen erfüllen, entscheidet die Förderstelle.</p>
          </section>
<!-- city-content-end -->`;
}

function cityFaq(c) {
  const faq = faqItems(c).map(([q, a], i) => `<details${i ? '' : ' open'}><summary>${q}</summary><p>${a}</p></details>`).join('');
  return `<!-- city-faq-start -->
          <section class="detail-block seo-course-faq">
            <p class="eyebrow dark">FAQ</p>
            <h2>Häufige Fragen zu IT-Schulungen in ${c.city}</h2>
            <div class="faq-list">${faq}</div>
          </section>
<!-- city-faq-end -->`;
}

function card(c) {
  if (!c.swap) return null;
  const [from, to, label] = c.swap;
  const p = coursePage(to);
  return {from, to, title: p.title, html: `<article class="course-card" data-category="data">
    <span>${label}</span>
    <h3>${p.title}</h3>
    <p>${p.theme}: ${p.duration}, ${p.language}, ${p.form}. ${p.hero}</p>
    <strong>Beratung anfragen</strong>
    <a href="kurse/${p.slug}.html">Kursdetails ansehen</a>
  </article>`};
}

function schema(html, c) {
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (all, open, json, close) => {
    const data = JSON.parse(json);
    const url = `${SITE}it-weiterbildung-online-${c.slug}.html`;
    const page = data['@graph'].find((n) => n['@type'] === 'WebPage');
    page.name = c.title;
    page.description = c.description;
    const place = {
      '@type': 'Place',
      name: `New Horizons ${c.city}`,
      telephone: c.phoneIntl,
      address: {'@type': 'PostalAddress', streetAddress: c.street, postalCode: c.zip, addressLocality: c.city, addressCountry: 'DE'},
      openingHoursSpecification: {'@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '08:30', closes: '17:00'},
    };
    // A partner's centre is not a location of the Scheurer GmbH organisation.
    if (c.partner) {
      delete page.mainEntity.location;
      page.contentLocation = place;
    } else {
      page.mainEntity.location = place;
    }
    const list = data['@graph'].find((n) => n['@type'] === 'ItemList');
    if (list) {
      list.name = `IT-Kurse für ${c.city}`;
      const swap = card(c);
      if (swap) for (const item of list.itemListElement) if (item.url.endsWith(`${swap.from}.html`)) { item.name = swap.title; item.url = `${SITE}kurse/${swap.to}.html`; }
    }
    data['@graph'] = data['@graph'].filter((n) => n['@type'] !== 'FAQPage');
    data['@graph'].push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqItems(c).map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}})),
    });
    return open + JSON.stringify(data).replace(/</g, '\\u003c') + close;
  });
}

function enhanceCity(html, file, today) {
  const c = CITIES[file];
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${c.title.replace(/&/g, '&amp;')}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${c.description}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${c.title.replace(/&/g, '&amp;')}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${c.description}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${c.title.replace(/&/g, '&amp;')}"`)
    .replace(/(<meta name="twitter:description" content=")[^"]*"/, `$1${c.description}"`)
    .replace(/<section class="page-hero directory-hero">[\s\S]*?<\/section>/, () => `<section class="page-hero directory-hero">
        <p class="eyebrow">Standort ${c.city}</p>
        <h1>IT-Schulungen und Weiterbildung in ${c.city}</h1>
        <p class="hero-text">${c.hero}</p>
      </section>`);

  // Template sections with unsupported demand claims, replaced by the sourced block.
  out = out
    .replace(/\s*<section class="detail-block compact-intro">\s*<h2>Warum dieser Einstieg[\s\S]*?<\/section>/, '')
    .replace(/\s*<section class="detail-block regional-focus-block">[\s\S]*?<\/section>/, '')
    .replace(/\s*<section class="detail-block">\s*<h2>Typische Kursrichtungen[\s\S]*?<\/section>/, '')
    .replace(/<h2>Priorisierte Kurse für [^<]*<\/h2>/, `<h2>Kursauswahl für ${c.city}</h2>`)
    .replace(/\s*<!-- city-content-start -->[\s\S]*?<!-- city-content-end -->/, '')
    .replace(/\s*<!-- city-faq-start -->[\s\S]*?<!-- city-faq-end -->/, '')
    .replace(/(<section class="section regional-layout">\s*<div class="detail-main">)/, (m) => `${m}\n          ${cityBlock(c, today)}`);

  const swap = card(c);
  if (swap) out = out.replace(new RegExp(`<article class="course-card"[^>]*>(?:(?!</article>)[\\s\\S])*?kurse/${swap.from}\\.html[\\s\\S]*?</article>`), () => swap.html);

  const heading = out.indexOf('<h2>Weitere Standorte</h2>');
  const end = out.indexOf('</section>', heading) + '</section>'.length;
  out = `${out.slice(0, end)}\n          ${cityFaq(c)}${out.slice(end)}`;
  return schema(out, c);
}

module.exports = {CITY_FILES: Object.keys(CITIES), enhanceCity};
