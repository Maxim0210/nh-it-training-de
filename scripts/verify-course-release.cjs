const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
async function main() {
  const release = JSON.parse(fs.readFileSync('.qa/course-release.json', 'utf8'));
  const cache = new Map();
  const local = new Set(['app.js', 'assets/course-catalog.js', 'assets/course-schedule.css']);
  const server = http.createServer((req, res) => {
    const file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    if (file.split('/').includes('..')) { res.writeHead(403).end(); return; }
    try {
      let data = release[file];
      if (data === undefined) {
        if (!cache.has(file)) cache.set(file, local.has(file) ? fs.readFileSync(file) : execFileSync('git', ['show', 'HEAD:' + file], {maxBuffer: 30 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore']}));
        data = cache.get(file);
      }
      const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png','.jpg':'image/jpeg'};
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream'); res.end(data);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    const page = await browser.newPage();
    const validation = await page.evaluate(files => Object.entries(files).filter(([f])=>f.endsWith('.html')).map(([file, html])=>{
      const d = new DOMParser().parseFromString(html,'text/html');
      const errors=[];
      if(d.querySelectorAll('h1').length!==1)errors.push('H1');
      if(!d.title.trim())errors.push('title');
      if(!d.querySelector('meta[name="description"]')?.content)errors.push('description');
      if(!d.querySelector('link[rel="canonical"]')?.href)errors.push('canonical');
      for(const s of d.querySelectorAll('script[type="application/ld+json"]'))try{JSON.parse(s.textContent);}catch{errors.push('JSON-LD');}
      return {file,errors};
    }), release);
    assert.deepEqual(validation.filter(v=>v.errors.length), []);
    const failures=[];
    page.on('response',r=>{if(r.url().startsWith(root)&&r.status()>=400)failures.push(r.url());});
    await page.goto(root+'/kursangebote.html', {waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Nur notwendige',exact:true}).click();
    assert.equal(await page.locator('[data-catalog-course]').count(),454);
    assert.equal(await page.locator('main').innerText().then(t=>/Hamburg/i.test(t)),false);
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});
      await page.locator('#catalog-query').fill('PL-300');
      assert.ok(await page.locator('[data-catalog-course]:visible').count()>0);
      await page.locator('[data-catalog-course]:visible summary').first().click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`overflow ${width}`);
      await page.screenshot({path:`.qa/course-catalog-${width}.png`,fullPage:false});
      await page.locator('#catalog-query').fill('zzzznonexistent');
      assert.equal(await page.locator('[data-catalog-course]:visible').count(),0);
      await page.locator('#catalog-query').fill('');
    }
    for(const value of ['online','venue','request']){
      await page.locator('#catalog-format').selectOption(value);
      const visible = await page.locator('[data-catalog-course]:visible').count();
      assert.ok(visible>0, value);
    }
    assert.deepEqual(failures, []);
    const detailFile = Object.keys(release).find(f=>f.startsWith('kurse/'));
    await page.goto(root+'/'+detailFile,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.verified-course-dates').count(),1);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'detail overflow');
    await page.locator('header input[name="q"]').first().fill('Excel');
    await page.locator('header input[name="q"]').first().press('Enter');
    await page.waitForURL('**/kursangebote.html?q=Excel*');
    assert.ok(await page.locator('[data-catalog-course]:visible').count()>0);
    await page.goto(root+'/kontakt.html?kurs=PL-300', {waitUntil:'networkidle'});
    assert.match(await page.locator('textarea[name="nachricht"]').inputValue(),/PL-300/);
    console.log(JSON.stringify({htmlPages:validation.length,catalogueCourses:454,viewports:[1440,768,390],missingAssets:failures},null,2));
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
