import fs from 'node:fs'
import crypto from 'node:crypto'
const d=JSON.parse(fs.readFileSync('docs/workbook-extraction.json','utf8').replace(/^\uFEFF/,''))
const colNum=s=>[...s].reduce((v,c)=>v*26+c.charCodeAt(0)-64,0)
const colName=n=>{let s='';while(n){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s}
const pos=a=>{const m=a.match(/^([A-Z]+)(\d+)$/);return [colNum(m[1]),+m[2]]}
function translate(f,dc,dr){return f.split(/("(?:[^"]|"")*")/).map((part,i)=>i%2?part:part.replace(/(?<![A-Za-z0-9_])(?<ac>\$?)(?<col>[A-Z]{1,3})(?<ar>\$?)(?<row>\d+)(?![A-Za-z0-9_]|\s*\()/g,(all,ac,c,ar,r)=>`${ac}${colName(colNum(c)+(ac?0:dc))}${ar}${+r+(ar?0:dr)}`)).join('')}
const q=v=>'"'+String(v??'').replaceAll('"','""')+'"'
let csv=['sheet,cell,formula,cached_value,shared_master,formula_type'], summary=[], patternsMd=['# All workbook formula patterns','','Row references are generalized only for grouping; the example formula is exact. Full resolved formulas are in workbook-formulas.csv. Shared formulas have been expanded relative to their master cell. Cached values are saved workbook values, not a fresh Excel recalculation.','']
let total=0,expanded=0,unresolved=0;const errors={};let catalog=[]
for(const s of d.sheets){
 const masters=new Map(s.formulas.filter(f=>f.type==='shared'&&f.formula).map(f=>[f.shared,f]));const patterns=new Map()
 for(const f of s.formulas){if(!f.formula&&f.type==='shared'){const master=masters.get(f.shared);if(master){const [c,r]=pos(f.cell),[mc,mr]=pos(master.cell);f.formula=translate(master.formula,c-mc,r-mr);f.master=master.cell;expanded++}else unresolved++}total++;if(f.cached?.startsWith('#'))errors[f.cached]=(errors[f.cached]||0)+1;csv.push([s.name,f.cell,'='+f.formula,f.cached,f.master,f.type].map(q).join(','));const key=f.formula.replace(/(\$?[A-Z]{1,3}\$?)\d+/g,'$1{row}');if(!patterns.has(key))patterns.set(key,{count:0,example:f.cell,formula:f.formula,cached:f.cached});patterns.get(key).count++}
 summary.push({sheet:s.name,formulas:s.formulas.length,patterns:patterns.size,errors:s.formulas.filter(f=>f.cached?.startsWith('#')).length});patternsMd.push(`## ${s.name}`, '', `${s.formulas.length} formula cells; ${patterns.size} row-generalized patterns.`, '', '| Count | Example cell | Exact formula | Cached value |','| ---: | --- | --- | --- |',...[...patterns.values()].map(p=>`| ${p.count} | ${p.example} | \`=${p.formula.replaceAll('|','\\|')}\` | ${p.cached} |`),'');
 const materialCols={PP:'Q',CB:'Q',AB:'O',WF:'AA',RF:'N',PL:'N',SP:'Q',FB:'M',TB:'O'};const prefix=materialCols[s.name]
 if(prefix){let cellmap=new Map(s.cells.map(c=>[c.cell,c.value]));for(const f of s.formulas.filter(f=>f.cell.match(/^([A-Z]+)\d+$/)[1]===prefix&&+f.cell.replace(/\D/g,'')>=8)){let row=+f.cell.replace(/\D/g,'');catalog.push({sheet:s.name,row,usn:cellmap.get('B'+row),inputs:Object.fromEntries(s.cells.filter(c=>+c.cell.replace(/\D/g,'')===row && /^[C-I]\d+$/.test(c.cell)).map(c=>[c.cell,c.value])),formula:f.formula,cached:f.cached})}}
}
fs.writeFileSync('docs/workbook-formulas.csv','\uFEFF'+csv.join('\r\n'))
fs.writeFileSync('docs/workbook-formula-patterns.md',patternsMd.join('\n'))
fs.writeFileSync('docs/workbook-material-rows.json',JSON.stringify(catalog,null,2))
fs.writeFileSync('docs/workbook-audit-summary.json',JSON.stringify({sha256:crypto.createHash('sha256').update(fs.readFileSync('docs/NOV 2026 DAILY DELIVERY REPORT.xlsx')).digest('hex'),total,expanded,unresolved,errors,sheets:summary,definedNames:d.definedNames},null,2))
// Keep resolved extraction for evidence and subsequent analysis.
fs.writeFileSync('docs/workbook-extraction.json',JSON.stringify(d))
console.log(JSON.stringify({total,expanded,unresolved,errors,sheets:summary},null,2))
