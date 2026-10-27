const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const dir=path.resolve('.qa/official-courses');fs.mkdirSync(dir,{recursive:true});
const runDate=process.argv.find(a=>a.startsWith('--date='))?.slice(7);
if(!/^\d{4}-\d{2}-\d{2}$/.test(runDate||''))throw Error('Pass the verified audit date as --date=YYYY-MM-DD');
async function fetchText(url){const u=new URL(url);if(!['www.newhorizons.de','newhorizons.de'].includes(u.hostname))throw Error('Unexpected source');const r=await fetch(u,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error('HTTP '+r.status);return r.text();}
(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const page=await browser.newPage();
 const xml=await fetchText('https://newhorizons.de/?type=1533906435&sitemap=pages');
 const urls=await page.evaluate(xml=>[...new DOMParser().parseFromString(xml,'application/xml').querySelectorAll('loc')].map(e=>e.textContent).filter(u=>new URL(u).pathname.startsWith('/trainings/topics/')),xml);
 const records=[],errors=[];
 for(const [i,url]of [...new Set(urls)].entries()){
  const file=path.join(dir,crypto.createHash('sha256').update(url).digest('hex').slice(0,16)+'.json');
  try{
   if(fs.existsSync(file)){const cached=JSON.parse(fs.readFileSync(file));if(cached.checkedAt===runDate&&cached.sourceVersion===2){if(cached.course)records.push(cached.course);continue;}}
   const html=await fetchText(url);
   const course=await page.evaluate(({html,url})=>{
    const d=new DOMParser().parseFromString(html,'text/html');
    if(!d.querySelector('#course_price,#course_no_price'))return null;
    const clean=s=>(s||'').replace(/\s+/g,' ').trim();
    const labels={};d.querySelectorAll('.labelw').forEach(e=>labels[clean(e.textContent)]=clean(e.parentElement.textContent).replace(clean(e.textContent),'').trim());
    const dates=[...d.querySelectorAll('.class-card[data-location]')].filter(e=>['HAM','MUN','NUM','STU'].includes(e.dataset.location)).map(e=>({center:e.dataset.location,date:clean(e.querySelector('.display-date')?.textContent),time:clean(e.querySelector('.date-info')?.textContent).replace(clean(e.querySelector('.display-date')?.textContent),'').trim(),price:[...e.querySelectorAll('.register-price .usd')].map(x=>clean(x.textContent)),format:clean(e.querySelector('.session-mod')?.textContent).replace('Garantiert durchgeführt','').trim()}));
    return {id:d.querySelector('#favourite')?.dataset.uid||null,title:clean(d.querySelector('h1')?.textContent),source:url,canonical:d.querySelector('link[rel="canonical"]')?.href||url,duration:labels.Dauer||null,language:labels.Kurssprache||null,format:labels.Trainingslösungen||null,dates};
   },{html,url});
   fs.writeFileSync(file,JSON.stringify({checkedAt:runDate,sourceVersion:2,course}));if(course)records.push(course);
   if(i%25===0)console.log(`${i+1}/${urls.length} source pages; ${records.length} course records`);
   await new Promise(r=>setTimeout(r,250));
  }catch(e){errors.push({url,error:e.message});console.log('SOURCE ERROR',url,e.message);}
 }
 const unique=new Map();for(const record of records){const key=record.id||record.canonical;if(!unique.has(key))unique.set(key,record);else {const a=unique.get(key);a.dates=[...new Map([...a.dates,...record.dates].map(d=>[JSON.stringify(d),d])).values()];}}
 const result={checkedAt:runDate,sourcePages:urls.length,courses:[...unique.values()],errors};
 fs.writeFileSync('.qa/official-courses.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({sourcePages:urls.length,courses:result.courses.length,errors:errors.length}));
 if(errors.length)process.exitCode=2;
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
