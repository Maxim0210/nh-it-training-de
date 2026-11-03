// Adds fact-based answers and structured data to the existing pages. Safe to rerun after render-official-courses.cjs.
// Usage: node scripts/seo-course-enhance.cjs --date=YYYY-MM-DD
const fs = require('node:fs');
const path = require('node:path');
const {CITY_FILES, enhanceCity} = require('./seo-city-pages.cjs');
const COPY_TABLE = require('./course-copy-table.json');

const dateArg = process.argv.find((a) => a.startsWith('--date='))?.slice(7);
const today = dateArg || new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Berlin'}).format(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) throw new Error('Invalid --date');

const SITE = 'https://nh-it-training.de/';
const ORG = {'@type': 'EducationalOrganization', '@id': `${SITE}#organization`, name: 'New Horizons IT-Weiterbildung', url: SITE};
const LANG = {Deutsch: ['de'], Englisch: ['en'], 'Deutsch oder Englisch': ['de', 'en']};
const MONTHS = {jan: 1, feb: 2, mär: 3, mar: 3, apr: 4, mai: 5, jun: 6, jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dez: 12};
const GENERIC_TEACHES = /Kurs$|online$|Weiterbildung|Training|Firmenseminar/i;

// Verified on 2026-11-03 against the linked vendor pages. Recheck when a vendor updates an exam.
const EXAMS = {
  'az-104-microsoft-azure-administrator.html': {
    code: 'AZ-104',
    replaceAgenda: true,
    wording: [
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'Der Kurs bereitet auf die Prüfung AZ-104 vor. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
      ['Bereitet der Kurs auf eine Prüfung oder Zertifizierung vor, klären wir den passenden Prüfungsweg in der Beratung.', 'Der Kurs bereitet auf die Prüfung AZ-104 vor. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
    ],
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
  'az-900-microsoft-azure-grundlagen.html': {
    code: 'AZ-900',
    replaceAgenda: true,
    source: 'https://learn.microsoft.com/de-de/credentials/certifications/resources/study-guides/az-900',
    asOf: '20.07.2026',
    skills: [
      ['Cloudkonzepte beschreiben', '25–30 %'],
      ['Azure-Architektur und -Dienste beschreiben', '35–40 %'],
      ['Azure-Verwaltung und -Governance beschreiben', '30–35 %'],
    ],
    closing: 'Zum Bestehen sind mindestens 700 Punkte nötig, die Prüfung dauert 45 Minuten und wird auch auf Deutsch angeboten. Die Zertifizierung Azure Fundamentals läuft nicht ab. Microsoft setzt keine andere Prüfung voraus, erwartet aber Erfahrung in einem IT-Bereich wie Infrastruktur, Datenbanken oder Softwareentwicklung.',
    wording: [
      ['Normale PC- und Internetkenntnisse. Konkrete Vorkenntnisse werden vor der Anmeldung kurz geprüft.', 'Für den Kurs reichen normale PC- und Internetkenntnisse. Für die Prüfung erwartet Microsoft Erfahrung in einem IT-Bereich. Konkrete Vorkenntnisse werden vor der Anmeldung kurz geprüft.'],
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'AZ-900 gehört zur Zertifizierung Azure Fundamentals. Der Kursbesuch allein ist kein Zertifizierungsabschluss. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
      ['Online-Training, Agenda und Beratung anfragen.', 'Online-Training, Prüfungsinhalte und Beratung anfragen.'],
    ],
  },
  'az-305-azure-solutions-architect-expert.html': {
    code: 'AZ-305',
    replaceAgenda: true,
    source: 'https://learn.microsoft.com/de-de/credentials/certifications/resources/study-guides/az-305',
    asOf: '17.04.2026',
    skills: [
      ['Identitäts-, Governance- und Überwachungslösungen entwerfen', '25–30 %'],
      ['Datenspeicherlösungen entwerfen', '20–25 %'],
      ['Lösungen für die Geschäftskontinuität entwerfen', '15–20 %'],
      ['Infrastrukturlösungen entwerfen', '30–35 %'],
    ],
    closing: 'Zum Bestehen sind mindestens 700 Punkte nötig. Für den Titel Azure Solutions Architect Expert verlangt Microsoft neben AZ-305 die Zertifizierung Azure Administrator Associate. Die Zertifizierung gilt jeweils ein Jahr und lässt sich über eine kostenlose Online-Prüfung bei Microsoft Learn verlängern.',
    wording: [
      ['Administratoren, Cloud-Einsteiger, IT-Teams, Consultants und technische Rollen, die Cloud-Services sicher planen oder betreiben möchten.', 'Azure-Administratoren, Entwickler und Consultants mit Azure-Erfahrung, die Lösungen entwerfen möchten.'],
      ['Normale PC- und Internetkenntnisse. Konkrete Vorkenntnisse werden vor der Anmeldung kurz geprüft.', 'Erfahrung beim Bereitstellen oder Verwalten von Azure-Ressourcen. Microsoft stuft den offiziellen Kurs als fortgeschritten ein. Konkrete Vorkenntnisse werden vor der Anmeldung kurz geprüft.'],
      ['Fachkräfte, Arbeitssuchende, Unternehmen und Teams', 'erfahrene Fachkräfte, Unternehmen und Teams'],
      ['Fachkräfte, Arbeitssuchende, Unternehmen und IT-Teams', 'Erfahrene Fachkräfte, Unternehmen und IT-Teams'],
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'AZ-305 gehört zur Zertifizierung Azure Solutions Architect Expert. Der Kursbesuch allein ist kein Zertifizierungsabschluss. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
      ['Online-Training, Agenda und Beratung anfragen.', 'Online-Training, Prüfungsinhalte und Beratung anfragen.'],
    ],
  },
  'az-500-azure-security-engineer-associate.html': {
    code: 'AZ-500',
    heading: 'Was folgt auf AZ-500?',
    intro: 'Als Nachfolger nennt Microsoft die Zertifizierung Cloud and AI Security Engineer Associate mit der Prüfung SC-500, verfügbar seit dem 21.07.2026. Die folgenden Angaben beschreiben diese Prüfung, nicht die Inhalte dieses Kurses. Ob der Kurs dafür ausreicht, klären wir vor der Anmeldung. SC-500 gewichtet die Themen so:',
    skills: [
      ['Identität, Zugriff und Governance', '20–25 %'],
      ['Speicher, Datenbanken und Netzwerke', '25–30 %'],
      ['Compute', '20–25 %'],
      ['Sicherheitsstatus verwalten und überwachen', '20–25 %'],
    ],
    closing: 'Zum Bestehen von SC-500 sind mindestens 700 Punkte nötig, die Prüfung dauert 120 Minuten und wird auch auf Deutsch angeboten. Microsoft erwartet praktische Erfahrung in der Azure- und Hybridadministration, sehr gute Kenntnisse in Microsoft Entra ID und Vertrautheit mit der Microsoft-365-Administration.',
    source: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500',
    sourceLabel: 'offizieller Microsoft-Studienleitfaden SC-500',
  },
  'ms-102-microsoft-365-administrator.html': {
    code: 'MS-102',
    replaceAgenda: true,
    until: '2026-11-30',
    after: {
      heading: 'Was prüfte MS-102?',
      intro: 'Der Kurs orientiert sich an der Microsoft-Prüfung MS-102, die bis zum 30.11.2026 abgelegt werden konnte. Microsoft prüfte diese Bereiche:',
      closing: 'Zum Bestehen waren mindestens 700 Punkte nötig. Das Prüfungsprofil setzte praktische Erfahrung mit den Microsoft-365-Workloads und Microsoft Entra ID sowie Kenntnisse in Netzwerk, AD DS, DNS und PowerShell voraus.',
    },
    intro: 'Der Kurs orientiert sich an der Microsoft-Prüfung MS-102, die nur noch bis zum 30.11.2026 abgelegt werden kann. Microsoft prüft diese Bereiche (Stand der Prüfungsinhalte: 28.04.2026):',
    skills: [
      ['Microsoft-365-Mandanten bereitstellen und verwalten'],
      ['Identität und Zugriff mit Microsoft Entra implementieren und verwalten'],
      ['Sicherheit und Bedrohungen mit Microsoft Defender XDR verwalten'],
      ['Compliance mit Microsoft Purview verwalten'],
    ],
    closing: 'Zum Bestehen sind mindestens 700 Punkte nötig. Für den Titel Administrator Expert verlangt Microsoft zusätzlich eine passende Associate-Zertifizierung. Das Prüfungsprofil setzt praktische Erfahrung mit den Microsoft-365-Workloads und Microsoft Entra ID sowie Kenntnisse in Netzwerk, AD DS, DNS und PowerShell voraus.',
    source: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/ms-102',
    wording: [
      ['Administratoren, Cloud-Einsteiger, IT-Teams, Consultants und technische Rollen, die Cloud-Services sicher planen oder betreiben möchten.', 'Microsoft-365-Administratoren und IT-Teams mit praktischer Erfahrung, die Mandanten, Identitäten, Sicherheit und Compliance verwalten.'],
      ['Grundkenntnisse zu Netzwerken, Identitäten, Betriebssystemen und Cloud-Konzepten sind sinnvoll.', 'Praktische Erfahrung mit Microsoft 365 und Microsoft Entra ID sowie Kenntnisse in Netzwerk, AD DS, DNS und PowerShell sind sinnvoll.'],
      ['Fachkräfte, Arbeitssuchende, Unternehmen und Teams', 'erfahrene Fachkräfte, Unternehmen und Teams'],
      ['Fachkräfte, Arbeitssuchende, Unternehmen und IT-Teams', 'Erfahrene Fachkräfte, Unternehmen und IT-Teams'],
    ],
  },
  'sc-200-security-operations-analyst-associate.html': {
    code: 'SC-200',
    source: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-200',
    asOf: '21.10.2026',
    skills: [
      ['Sicherheitsbetriebsumgebung verwalten', '40–45 %'],
      ['Auf Sicherheitsvorfälle reagieren', '35–40 %'],
      ['Bedrohungssuche durchführen', '20–25 %'],
    ],
    closing: 'Zum Bestehen sind mindestens 700 Punkte nötig, die Prüfung dauert 100 Minuten. Lokalisierte Fassungen aktualisiert Microsoft laut Studienleitfaden etwa acht Wochen nach der englischen. Die Zertifizierung gilt jeweils ein Jahr und lässt sich über eine kostenlose Online-Prüfung bei Microsoft Learn verlängern.',
    wording: [
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'SC-200 gehört zur Zertifizierung Security Operations Analyst Associate. Der Kursbesuch allein ist kein Zertifizierungsabschluss. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
    ],
  },
  'ai-900-microsoft-azure-ai-fundamentals.html': {
    code: 'AI-900',
    heading: 'Was prüft die Nachfolgeprüfung AI-901?',
    intro: 'Die Zertifizierung Azure AI Fundamentals bleibt bestehen und wird heute über AI-901 erworben. Die folgenden Angaben beschreiben diese Prüfung, nicht die Inhalte dieses Kurses. Ob der Kurs dafür ausreicht, klären wir vor der Anmeldung. Microsoft gewichtet die Themen so (Stand der Prüfungsinhalte: 15.04.2026):',
    skills: [
      ['KI-Konzepte und -Funktionen', '40–45 %'],
      ['Umsetzung mit Microsoft Foundry', '55–60 %'],
    ],
    closing: 'Zum Bestehen sind mindestens 700 Punkte nötig. Für AI-901 nennt Microsoft Kenntnisse der Python-Syntax und von Programmiertechniken sowie Vertrautheit mit Azure-Ressourcen. Grundlagenzertifizierungen laufen nicht ab.',
    source: 'https://learn.microsoft.com/de-de/credentials/certifications/resources/study-guides/ai-901',
    sourceLabel: 'offizieller Microsoft-Studienleitfaden AI-901',
    wording: [
      ['Normale PC- und Internetkenntnisse. Konkrete Vorkenntnisse werden vor der Anmeldung kurz geprüft.', 'Normale PC- und Internetkenntnisse. Für die Nachfolgeprüfung AI-901 nennt Microsoft zusätzlich Python-Grundlagen und Vertrautheit mit Azure-Ressourcen. Konkrete Vorkenntnisse werden vor der Anmeldung kurz geprüft.'],
    ],
  },
  'itil-4-foundation.html': {
    code: 'ITIL 4 Foundation',
    heading: 'Wie läuft die Prüfung ITIL 4 Foundation ab?',
    intro: 'PeopleCert nennt für die Prüfung diese Eckdaten:',
    skills: [
      ['40 Multiple-Choice-Fragen in 60 Minuten'],
      ['ohne Unterlagen (Closed Book)'],
      ['Bestehensgrenze: 65 %'],
      ['Sprachen: 12, darunter Deutsch'],
      ['Erneuerung alle 3 Jahre: 60 CPD-Punkte über eine PeopleCert-Plus-Mitgliedschaft oder eine weitere Prüfung derselben Product Suite'],
    ],
    closing: 'ITIL 4 und ITIL (Version 5) laufen zeitweise parallel. PeopleCert plant derzeit, alle ITIL-4-Module am 31.12.2027 einzustellen. Wer das Zertifikat ITIL 4 Foundation besitzt, muss für höhere Module der Version 5 nicht zusätzlich Foundation (Version 5) ablegen. Zu Version 5 und zur Einstellung: <a href="https://www.peoplecert.org/help-and-support/faq-itil" rel="noopener">PeopleCert-FAQ zu ITIL</a>.',
    source: 'https://www.peoplecert.org/browse-certifications/it-governance-and-service-management/ITIL-1/itil-4-foundation-2565',
    sourceLabel: 'PeopleCert-Seite zu ITIL 4 Foundation',
    wording: [
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'Der Kurs bereitet auf die Prüfung ITIL 4 Foundation vor. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
    ],
  },
  'comptia-security-plus.html': {
    code: 'CompTIA Security+',
    intro: 'CompTIA gewichtet die Themen der Version V7 (SY0-701) so:',
    skills: [
      ['Allgemeine Sicherheitskonzepte', '12 %'],
      ['Bedrohungen, Schwachstellen und Gegenmaßnahmen', '22 %'],
      ['Sicherheitsarchitektur', '18 %'],
      ['Sicherheitsbetrieb', '28 %'],
      ['Management und Aufsicht des Sicherheitsprogramms', '20 %'],
    ],
    closing: 'Die Prüfung umfasst bis zu 90 Fragen in 90 Minuten, zum Bestehen sind 750 Punkte auf einer Skala von 100 bis 900 nötig. Sie wird nicht auf Deutsch angeboten. CompTIA empfiehlt Network+ und zwei Jahre Erfahrung als Security- oder Systemadministrator. Die englische SY0-701 endet am 11.06.2027, die <a href="https://www.comptia.org/en-us/certifications/security/v8/" rel="noopener">Nachfolgeversion V8 (SY0-801)</a> soll laut CompTIA um den 17.11.2026 starten. Auf welche Version ein Termin ausgerichtet ist, klären wir vor der Anmeldung.',
    source: 'https://www.comptia.org/en-us/certifications/security/v7/',
    sourceLabel: 'CompTIA-Seite zu Security+ V7',
    wording: [
      ['Grundwissen zu IT, Netzwerken und Betriebssystemen hilft. Für fortgeschrittene Zertifizierungen sollte praktische IT-Erfahrung vorhanden sein.', 'Grundwissen zu IT, Netzwerken und Betriebssystemen hilft. Für die Prüfung empfiehlt CompTIA Network+ und zwei Jahre Erfahrung als Security- oder Systemadministrator. Ob der Kurs für Ihren Einstieg passt, klären wir vor der Anmeldung.'],
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'SY0-701 gehört zur Zertifizierung CompTIA Security+. Der Kursbesuch allein ist kein Zertifizierungsabschluss. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
    ],
  },
  'tableau-desktop-i-fundamentals.html': {
    code: 'Tableau Desktop I',
    heading: 'Welche Prüfung passt zu Tableau Desktop I?',
    intro: 'Salesforce empfiehlt Desktop I: Fundamentals als Vorbereitung auf die Prüfung Salesforce Certified Tableau Desktop Foundations. Die Prüfung gewichtet die Themen so:',
    skills: [
      ['Daten verbinden und vorbereiten', '23 %'],
      ['Daten erkunden und analysieren', '37 %'],
      ['Erkenntnisse teilen', '25 %'],
      ['Tableau-Konzepte verstehen', '15 %'],
    ],
    closing: 'Die Prüfung umfasst 40 gewertete Fragen und bis zu fünf ungewertete in 70 Minuten. Es gibt keine Voraussetzungen und derzeit keine Pflicht zur Auffrischung. Der Leitfaden nennt eine englische und eine japanische Fassung, keine deutsche. Die Bestehensgrenze liegt für die englische Fassung bei 48 %. Die Anmeldung kostet 75 US-Dollar zuzüglich Steuern, eine Wiederholung ist laut Leitfaden kostenlos. Als getestete Produktversion nennt er Tableau 2022.3.',
    source: 'https://help.salesforce.com/s/articleView?id=005298988&language=en_US&type=1',
    sourceLabel: 'offizieller Salesforce-Prüfungsleitfaden',
    wording: [
      ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'Die Prüfung Tableau Desktop Foundations gehört zur Zertifizierung Salesforce Certified Tableau Desktop Foundations. Der Kursbesuch allein ist kein Zertifizierungsabschluss. Prüfungsbuchung und enthaltene Leistungen klären wir im Angebot.'],
    ],
  },
};

// Read on 2026-11-03 from Microsoft's exam and certification pages. `listed` dates appear only on the credential retirement list.
const RETIRED = {
  'ai-102': {kind: 'cert', date: '2026-06-30', listed: true},
  'ai-900': {kind: 'exam', date: '2026-06-30', successor: 'Microsoft ersetzt sie durch AI-901.'},
  'az-204': {kind: 'cert', date: '2026-07-31', listed: true},
  'az-220': {kind: 'exam', date: '2023-07-31'},
  'az-500': {kind: 'exam', date: '2026-08-31', successor: 'Auch die Zertifizierung Azure Security Engineer Associate ist eingestellt.'},
  'az-600': {kind: 'exam', date: '2023-07-31'},
  'az-720': {kind: 'exam', date: '2023-07-31'},
  'dp-100': {kind: 'cert', date: '2026-06-01', listed: true},
  'dp-203': {kind: 'cert', date: '2025-03-31'},
  'dp-500': {kind: 'cert', date: '2024-04-30'},
  'ms-102': {kind: 'exam', date: '2026-11-30', successor: 'Als Ersatz empfiehlt Microsoft die Zertifizierung Microsoft 365 and AI Services Administrator Associate mit der Prüfung AB-650, die laut Prüfungsseite derzeit nur auf Englisch verfügbar ist.'},
  'ms-203': {kind: 'exam', date: '2023-12-31'},
  'ms-220': {kind: 'exam', date: '2023-07-31', successor: 'Microsoft führte sie unter dem Namen Troubleshooting Microsoft Exchange Online.'},
  'ms-500': {kind: 'exam', date: '2023-06-30'},
  'ms-600': {kind: 'exam', date: '2023-12-31'},
  'ms-900': {kind: 'cert', date: '2026-03-31', listed: true, noRenewal: true},
  'pl-100': {kind: 'cert', date: '2024-06-30'},
  'pl-200': {kind: 'exam', date: '2026-08-31', successor: 'Auch die Zertifizierung Power Platform Functional Consultant Associate ist eingestellt.'},
  'pl-400': {kind: 'exam', date: '2026-10-30', successor: 'Die Zertifizierung Power Platform Developer Associate führt Microsoft nun mit der Prüfung AB-400, die laut Prüfungsseite derzeit nur auf Englisch verfügbar ist.'},
  'pl-500': {kind: 'cert', date: '2026-06-30', listed: true},
  'pl-600': {kind: 'exam', date: '2026-06-30', successor: 'Auch die Zertifizierung Power Platform Solution Architect Expert ist eingestellt.'},
  'sc-400': {kind: 'cert', date: '2025-05-30'},
};
const RETIRED_WORDING = [
  [' oder eine passende Zertifizierung vorbereiten möchten', ' möchten'],
  ['Praxis und Prüfungsvorbereitung', 'Praxis und Anwendung'],
  ['nächste Zertifizierungsschritte', 'sinnvolle nächste Lernschritte'],
  ['Prüfung und Praxisbezug', 'Praxisbezug'],
  ['Prüfungsdomänen und typische Fragen', 'Themenbereiche und typische Fragen'],
  ['die passende Zertifizierung oder Vertiefung planen', 'die passende Vertiefung planen'],
  ['Beratung zu Zertifizierung oder Förderung', 'Beratung zu Anschlusskursen oder Förderung'],
  ['passende Folgekurse oder Zertifizierungsschritte auswählen', 'passende Folgekurse auswählen'],
  ['Für fortgeschrittene Zertifizierungen sollte praktische IT-Erfahrung vorhanden sein.', 'Für diesen Kurs sollte praktische IT-Erfahrung vorhanden sein.'],
  ['Falls der Kurs eine Prüfung oder Zertifizierung vorbereitet, wird der passende Prüfungsweg in der Beratung mitgeprüft.', 'Den Stand der Prüfung finden Sie oben auf dieser Seite. Mögliche Alternativen klären wir in der Beratung.'],
];

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
  if (exam.until && exam.until < today) exam = {...exam, ...exam.after};
  const intro = exam.intro || `Der Kurs ist auf die Microsoft-Prüfung ${exam.code} ausgerichtet. Microsoft gewichtet die Themen so (Stand der Prüfungsinhalte: ${exam.asOf}):`;
  const closing = exam.closing || 'Zum Bestehen sind mindestens 700 Punkte nötig. Die Zertifizierung gilt jeweils ein Jahr und lässt sich über eine kostenlose Online-Prüfung bei Microsoft Learn verlängern.';
  const list = exam.skills?.length ? `\n            <ul>${exam.skills.map(([skill, share]) => `<li>${share ? `${skill}: ${share}` : skill}</li>`).join('')}</ul>` : '';
  return `<!-- course-exam-start -->
          <section class="detail-block">
            <h2>${exam.heading || `Was prüft ${exam.code}?`}</h2>
            <p>${intro}</p>${list}
            <p>${closing} Quelle: <a href="${exam.source}" rel="noopener">${exam.sourceLabel || `offizieller Microsoft-Studienleitfaden ${exam.code}`}</a>.</p>
          </section>
<!-- course-exam-end -->`;
}

function retiredCode(file) {
  const code = file.match(/^[a-z]+-\d+/)?.[0];
  return code && RETIRED[code] ? code : null;
}

function statusNote(code) {
  const {kind, date, successor, listed, noRenewal} = RETIRED[code];
  const label = code.toUpperCase();
  const day = german(date);
  let fact;
  if (date >= today) fact = `Microsoft stellt die Prüfung ${label} und die zugehörige Zertifizierung am ${day} ein. Danach kann die Prüfung nicht mehr abgelegt und die Zertifizierung weder erworben noch verlängert werden.`;
  else if (kind === 'exam') fact = `Microsoft hat die Prüfung ${label} am ${day} eingestellt. Sie kann nicht mehr abgelegt werden.`;
  else fact = `Microsoft hat die Zertifizierung zu ${label} am ${day} eingestellt. Sie lässt sich nicht mehr neu erwerben${noRenewal ? '' : ' oder verlängern'}.`;
  const next = successor ? ` ${successor}` : '';
  const list = listed ? ' und <a href="https://learn.microsoft.com/en-us/credentials/support/credential-retirement" rel="noopener">Microsoft-Liste eingestellter Zertifizierungen</a>' : '';
  return `<!-- course-status-start -->
            <p><strong>Wichtig zur Prüfung:</strong> ${fact}${next} Ob es heute einen passenden Prüfungsweg gibt und ob dieser Kurs dafür geeignet ist, klären wir vor der Anmeldung. Quelle: <a href="https://learn.microsoft.com/en-us/credentials/certifications/exams/${code}/" rel="noopener">Microsoft-Seite zu ${label}</a>${list}.</p>
<!-- course-status-end -->`;
}

function statusDescription(code) {
  const {kind, date} = RETIRED[code];
  const label = code.toUpperCase();
  const past = kind === 'exam' ? `Microsoft hat die Prüfung ${label} eingestellt.` : `Microsoft hat die Zertifizierung zu ${label} eingestellt.`;
  return {past, future: `Microsoft stellt die Prüfung ${label} am ${german(date)} ein.`};
}

function trimMeta(html) {
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
  let out = html;
  if (title && title.length > 60) {
    let next = title.replace(' online | New Horizons', ' | New Horizons');
    if (next.length > 60) next = next.replace(' | New Horizons', '');
    out = out.split(title).join(next);
  }
  if (desc && desc.length > 160) {
    let next = desc.replace(/ (Online-Training, )?(Agenda|Inhalte|Prüfungsinhalte) und Beratung anfragen\.$/, '');
    if (next.length > 160) next = next.replace('Online Live, Connected Classroom oder Firmenseminar', 'online oder als Firmenseminar');
    out = out.split(desc).join(next);
  }
  return out;
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

  out = out.replace(/\s*<!-- course-status-start -->[\s\S]*?<!-- course-status-end -->/, '');
  const retired = retiredCode(file);
  if (retired) {
    out = out.replace('<!-- course-summary-end -->', () => `<!-- course-summary-end -->\n            ${statusNote(retired)}`);
    for (const [from, to] of RETIRED_WORDING) out = out.split(from).join(to);
    const {past, future} = statusDescription(retired);
    const isOver = RETIRED[retired].date < today;
    out = out.split('Online-Training, Agenda und Beratung anfragen.').join(`${isOver ? past : future} Inhalte und Beratung anfragen.`);
    if (isOver) out = out.split(future).join(past);
  }
  for (const [from, to] of exam?.wording || []) out = out.split(from).join(to);

  out = out
    .replace('Was du nach dem Kurs besser kannst', 'Was Sie nach dem Kurs besser können')
    .replace(/<h2>[^<]*richtig einordnen<\/h2>/, '<h2>Verwandte Kurse und Themen</h2>')
    .replace(/\s*<p>[^<]*Interessenten können den Kurs über[^<]*<\/p>/, '');
  // Runs after the retired and exam wording above, because those match the original template sentences.
  for (const [from, to] of COPY_TABLE) out = out.split(from).join(to);
  // The source files Adobe under DevOps; the topic link keeps its real name.
  if (file.startsWith('adobe-')) out = out.replace(/DevOps, Testing und Collaboration(?!<\/a>)/g, 'Grafik, Layout, PDF und Web');
  out = out.replace(/Stand: (\d{4}-\d{2}-\d{2})\./g, (m, iso) => `Stand: ${german(iso)}.`);
  return updateSchema(trimMeta(out), page, file);
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
for (const name of CITY_FILES) apply(name, (html) => enhanceCity(html, name, today));

if (changed.length) {
  apply('sitemap.xml', (xml) => changed.reduce((acc, file) => {
    const loc = SITE + (file === 'index.html' ? '' : encodeURI(file));
    return acc.split(`<loc>${loc}</loc>`).length > 1
      ? acc.replace(new RegExp(`(<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc><lastmod>)[^<]+`), `$1${today}`)
      : acc;
  }, xml));
}
console.log(`Date ${today}. Changed ${changed.length} files.`);
