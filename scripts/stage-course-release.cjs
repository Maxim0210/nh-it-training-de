const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const git = (args, options = {}) => execFileSync('git', args, {encoding:'utf8',maxBuffer:30*1024*1024,...options});
if (!process.argv.includes('--apply')) throw Error('Review and test the release first; pass --apply to stage it.');
if (git(['diff','--cached','--name-only']).trim()) throw Error('Existing staged changes: stop rather than combine releases.');
const release = JSON.parse(fs.readFileSync('.qa/course-release.json','utf8'));
const extras = ['app.js','assets/course-catalog.js','assets/course-schedule.css','scripts/collect-official-courses.cjs','scripts/render-official-courses.cjs','scripts/course-sync.test.cjs','scripts/verify-course-release.cjs','scripts/stage-course-release.cjs','docs/course-sync.md'];
const index = path.resolve('.qa/course-release-index');
if(fs.existsSync(index))fs.unlinkSync(index);
const env = {...process.env,GIT_INDEX_FILE:index};
git(['read-tree','HEAD'],{env});
const entries = [];
for(const [file,content] of Object.entries(release)) {
  const hash = git(['hash-object','-w','--stdin'],{input:content.replace(/\r\n/g,'\n')}).trim();
  git(['update-index','--add','--cacheinfo',`100644,${hash},${file}`],{env});
  entries.push([file,hash]);
}
const patch = git(['diff','--cached','--binary','--unified=0','HEAD'],{env});
fs.writeFileSync('.qa/course-release.patch',patch);
// Check the entire generated delta before touching any existing working files.
git(['apply','--unidiff-zero','--check','.qa/course-release.patch']);
git(['apply','--unidiff-zero','.qa/course-release.patch']);
for(const [file,hash] of entries)git(['update-index','--add','--cacheinfo',`100644,${hash},${file}`]);
git(['add','--',...extras]);
console.log(git(['diff','--cached','--stat']));
