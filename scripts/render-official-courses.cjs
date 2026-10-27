const fs=require('node:fs'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const head=f=>execFileSync('git',['show','HEAD:'+f],{encoding:'utf8',maxBuffer:20*1024*1024});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function delivery(format){return /Virtual/i.test(format)?'Online-Teilnahme':'Durchführungsort auf Anfrage';}
const months={jan:1,feb:2,mär:3,märz:3,maerz:3,apr:4,mai:5,jun:6,juni:6,jul:7,juli:7,aug:8,sep:9,sept:9,okt:10,nov:11,dez:12};
function startDate(text){const year=text.match(/\b(20\d{2})\b/g)?.at(-1);const start=text.match(/^(\d{1,2})\.\s*([A-Za-zÄäÖöÜü]+)\.?/);if(!year||!start||!months[start[2].toLowerCase()])return null;let y=Number(year);const m=months[start[2].toLowerCase()];const end=text.match(/[-–]\s*\d{1,2}\.\s*([A-Za-zÄäÖöÜü]+)/);if(end&&months[end[1].toLowerCase()]<m)y--;const iso=`${y}-${String(m).padStart(2,'0')}-${start[1].padStart(2,'0')}`;return new Date(iso+'T12:00:00Z').toISOString().slice(0,10)===iso?iso:null;}
function money(s){const m=s?.match(/(\d[\d.]*,\d{2})\s*€/);return m?Math.round(Number(m[1].replace(/\./g,'').replace(',','.'))*100):null;}
const eur=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n/100);
function price(d){const net=money(d.price[0]),tax=/MwSt/i.test(d.price[1]||'')?money(d.price[1]):null;return net!==null&&tax!==null?`${eur(net+tax)} inkl. MwSt. (${eur(net)} netto + ${eur(tax)} MwSt.)`:'Preis auf Anfrage';}
const normalize=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function schedule(c){if(!c.upcoming.length)return '<p>Termine und Preise auf Anfrage. Wir klären das passende Angebot für Sie.</p>';return '<ul class="verified-starts">'+c.upcoming.slice(0,6).map(d=>`<li data-course-start="${d.start}"><strong><time datetime="${d.start}">${esc(d.date)}</time></strong><span>${esc(delivery(d.format))}${d.time?' · '+esc(d.time)+' Uhr (deutsche Ortszeit)':''}</span><span>${esc(price(d))}</span></li>`).join('')+'</ul>'+(c.upcoming.length>6?'<p>Weitere Termine können Sie persönlich anfragen.</p>':'');}
function section(c){return `<!-- official-course-start -->\n<section class="detail-block verified-course-dates" aria-label="Termine und Preise"><h2>Starttermine und Preise</h2>${schedule(c)}<p>Stand: ${esc(c.checkedAt)}. Termin und Teilnahme werden vor der Buchung bestätigt. <a href="${esc(c.source)}">Offizielle Kursangaben</a></p><a class="button primary" href="../kontakt.html?kurs=${encodeURIComponent(c.title)}">Angebot zu diesem Kurs anfragen</a></section>\n<!-- official-course-end -->`;}
async function main(){
 const source=JSON.parse(fs.readFileSync('.qa/official-courses.json','utf8'));
 if(source.errors.length||source.courses.length<200)throw Error('Incomplete source inventory: no release');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 const page=await browser.newPage();
 const files=execFileSync('git',['-c','core.quotepath=false','ls-files','kurse/*.html'],{encoding:'utf8'}).trim().split('\n');
 const local=await page.evaluate(items=>items.map(({file,html})=>{const d=new DOMParser().parseFromString(html,'text/html');return {file,title:d.querySelector('h1')?.textContent||''};}),files.map(file=>({file,html:head(file)})));
 const mapped=new Map();for(const l of local){const key=normalize(l.title);if(!mapped.has(key))mapped.set(key,[]);mapped.get(key).push(l.file);}
 const out={},invalid=[];
 // The owner confirmed on 2026-10-27 that these source tariffs and bookings apply.
 // Preserve the source internally; never relabel a physical venue as a local one.
 const courses=source.courses.map(c=>{const upcoming=c.dates.filter(d=>d.center==='HAM').flatMap(d=>{const start=startDate(d.date);if(!start){invalid.push({course:c.title,date:d.date});return [];}return start>source.checkedAt?[{...d,start}]:[];}).sort((a,b)=>a.start.localeCompare(b.start));const match=mapped.get(normalize(c.title));return {...c,checkedAt:source.checkedAt,upcoming:[...new Map(upcoming.map(d=>[JSON.stringify(d),d])).values()],local:match?.length===1?match[0]:null};}).sort((a,b)=>a.title.localeCompare(b.title,'de'));
 if(invalid.length){fs.writeFileSync('.qa/unparsed-course-dates.json',JSON.stringify(invalid,null,2));throw Error(`${invalid.length} unparsed dates; inspect before publishing`);}
 for(const c of courses.filter(c=>c.local)){
  let html=head(c.local);const block=section(c);
  if(html.includes('<!-- official-course-start -->'))html=html.replace(/<!-- official-course-start -->[\s\S]*?<!-- official-course-end -->/,block);
  else html=html.replace('<div class="detail-main">','<div class="detail-main">\n'+block);
  if(!html.includes('official-course-start'))continue;
  if(!html.includes('course-schedule.css'))html=html.replace('</head>','<link rel="stylesheet" href="../assets/course-schedule.css">\n  </head>');
  if(!html.includes('course-catalog.js'))html=html.replace('</body>','<script src="../assets/course-catalog.js" defer></script>\n</body>');
  out[c.local]=html;
 }
 const cards=courses.map((c,i)=>`<article class="verified-course" id="course-${esc(c.id||i)}" data-catalog-course data-title="${esc(c.title.toLowerCase())}" data-formats="${[...new Set(c.upcoming.map(d=>/Virtual/i.test(d.format)?'online':'venue'))].join(' ')||'request'}"><h2>${c.local?`<a href="${esc(c.local)}">${esc(c.title)}</a>`:esc(c.title)}</h2><p>${esc([c.duration,c.language,c.format].filter(Boolean).join(' · '))}</p><details><summary>Starttermine und Preise</summary>${schedule(c)}<p><a href="${esc(c.source)}">Offizielle Kursinformationen</a></p></details><a href="kontakt.html?kurs=${encodeURIComponent(c.title)}">Kurs anfragen</a></article>`).join('\n');
 let catalog=head('kurskatalog.html');
 catalog=catalog.replace(/<title>[\s\S]*?<\/title>/,'<title>Kursangebote, Starttermine und Preise | New Horizons</title>').replace(/<meta name="description"[^>]*>/,'<meta name="description" content="IT-Kurse vergleichen: aktuelle Starttermine und Preise für München, Nürnberg und Stuttgart. Microsoft, KI, Cloud, Security, Office und weitere Trainings.">').replace(/<link rel="canonical"[^>]*>/,'<link rel="canonical" href="https://nh-it-training.de/kursangebote.html">').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'').replace(/<meta (?:property="og:[^"]+"|name="twitter:[^"]+")[^>]*>/g,'');
 catalog=catalog.replace(/<main>[\s\S]*?<\/main>/,`<main id="main-content"><section class="page-hero catalog-hero"><div><p class="eyebrow">Kursangebote</p><h1>Ihr nächstes Training</h1><p>Vergleichen Sie Kurse, Starttermine und Preise. Wir beraten Sie persönlich zu Ihrer Weiterbildung oder zum passenden Training für Ihr Team.</p></div><img src="assets/hero-training-neutral.webp" alt="Gemeinsames Lernen im IT-Training" width="1200" height="800"></section><section class="section" id="kurse"><form class="catalog-controls" role="search"><label>Kurs oder Thema<input type="search" name="q" id="catalog-query" autocomplete="off" placeholder="z. B. Azure, Excel oder PL-300"></label><label>Durchführung<select name="format" id="catalog-format"><option value="">Alle Angebote</option><option value="online">Mit Online-Terminen</option><option value="venue">Präsenz: Ort auf Anfrage</option><option value="request">Termine auf Anfrage</option></select></label></form><p id="catalog-count" role="status">${courses.length} Kurse</p><p class="catalog-note">Preise gelten für den genannten Termin. Teilnahme und Durchführung bestätigen wir vor der Buchung. Stand: <time datetime="${source.checkedAt}">${source.checkedAt.split('-').reverse().join('.')}</time>.</p><div class="verified-catalog">${cards}</div><p><a href="kurskatalog.html">Zum Weiterbildungskatalog</a></p></section></main>`);
 catalog=catalog.replace('</head>','<link rel="stylesheet" href="assets/course-schedule.css">\n</head>').replace('</body>','<script src="assets/course-catalog.js" defer></script>\n</body>');
 const schema={"@context":"https://schema.org","@type":"CollectionPage","name":"Kursangebote, Starttermine und Preise","url":"https://nh-it-training.de/kursangebote.html","inLanguage":"de-DE","description":"IT-Kurse, aktuelle Starttermine und Preise mit persönlicher Beratung.","mainEntity":{"@type":"ItemList","numberOfItems":courses.length,"itemListElement":courses.map((c,i)=>({"@type":"ListItem","position":i+1,"name":c.title,"url":"https://nh-it-training.de/kursangebote.html#course-"+(c.id||i)}))}};
 catalog=catalog.replace('</head>',`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>\n</head>`);
 out['kursangebote.html']=catalog.replace(/^[ \t]+$/gm,'');
 // Use the existing catalogue and search entry points without removing their content.
 for(const file of ['kurskatalog.html','trainings/advanced-search.html']){
   let html=head(file);const href=file.includes('/')?'../kursangebote.html':'kursangebote.html';
   if(!html.includes('data-complete-catalog'))html=html.replace('<main>',`<main>\n<section class="section" data-complete-catalog><h2>Aktuelle Kurse, Termine und Preise</h2><p><a class="button primary" href="${href}">Alle ${courses.length} Kursangebote durchsuchen</a></p></section>`);
   out[file]=html;
 }
 let home=head('index.html');if(!home.includes('href="kursangebote.html"'))home=home.replace('<h3>Last-Minute-Kurse</h3>','<h3>Last-Minute-Kurse</h3>\n<p><a href="kursangebote.html">Alle Kursangebote, Starttermine und Preise</a></p>');out['index.html']=home;
 let sitemap=head('sitemap.xml');for(const file of Object.keys(out)){const url='https://nh-it-training.de/'+(file==='index.html'?'':encodeURI(file));const entry=`<url><loc>${url}</loc><lastmod>${source.checkedAt}</lastmod><priority>0.7</priority></url>`;if(sitemap.includes('<loc>'+url+'</loc>'))sitemap=sitemap.replace(/<url>[\s\S]*?<\/url>/g,b=>b.includes('<loc>'+url+'</loc>')?b.replace(/<lastmod>.*?<\/lastmod>/,`<lastmod>${source.checkedAt}</lastmod>`):b);else sitemap=sitemap.replace('</urlset>',entry+'\n</urlset>');}out['sitemap.xml']=sitemap;
 fs.writeFileSync('.qa/course-release.json',JSON.stringify(out));
 fs.writeFileSync('.qa/course-coverage.json',JSON.stringify({checkedAt:source.checkedAt,sourcePages:source.sourcePages,uniqueCourses:courses.length,matched:courses.filter(c=>c.local).length,notMatched:courses.filter(c=>!c.local).map(c=>({title:c.title,source:c.source})),withDates:courses.filter(c=>c.upcoming.length).length},null,2));
 console.log('Release prepared',JSON.stringify({courses:courses.length,matched:courses.filter(c=>c.local).length,files:Object.keys(out).length}));
 }finally{await browser.close();}
}
module.exports={startDate,price,normalize,delivery};if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
