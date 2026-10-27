const {test}=require('node:test'),assert=require('node:assert/strict');
const {startDate,price,normalize,delivery}=require('./render-official-courses.cjs');
test('Delivery never invents a local venue',()=>{
 assert.equal(delivery('Virtual'),'Online-Teilnahme');
 assert.equal(delivery('Physical And Virtual'),'Online-Teilnahme');
 assert.equal(delivery('Physical'),'Durchführungsort auf Anfrage');
});
test('German dates and year transition',()=>{
 assert.equal(startDate('02. Nov. - 04. Nov. 2026'),'2026-11-02');
 assert.equal(startDate('30. Dez. - 02. Jan. 2027'),'2026-12-30');
 assert.equal(startDate('7. März 2027'),'2027-03-07');
 assert.equal(startDate('31. Feb. 2027'),null);
 assert.equal(startDate('auf Anfrage'),null);
});
test('Tax explicit, no fabricated price',()=>{
 assert.match(price({price:['1.590,00 €','MwSt.: 302,10 €']}),/1\.892,10/);
 assert.equal(price({price:['Preis auf Anfrage']}),'Preis auf Anfrage');
 assert.equal(price({price:['1.590,00 €']}),'Preis auf Anfrage');
});
test('Exact title matching ignores punctuation, not course variants',()=>{
 assert.equal(normalize('PRINCE2® Foundation'),normalize('PRINCE2 Foundation'));
 assert.notEqual(normalize('PL-300'),normalize('PL-300 advanced'));
});
test('Reviewed aliases exclude different courses sharing a code',()=>{
 const aliases=require('./course-aliases.json');
 assert.equal(aliases['AI-3025 Work smarter with AI'],undefined);
 assert.equal(aliases['PL-900 Microsoft Power Platform Grundlagen'],'pl-900-power-platform-fundamentals.html');
 assert.equal(new Set(Object.values(aliases)).size,Object.values(aliases).length);
});
