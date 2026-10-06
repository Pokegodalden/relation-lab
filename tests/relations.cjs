const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').resolve(__dirname,'../index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const context=vm.createContext({});vm.runInContext(script.split('window.RelationMath')[0],context);let graphs=0,checks=0;
for(let n=0;n<=3;n++)for(let mask=0;mask<2**(n*n);mask++){
 const indices=Array.from({length:n},(_,i)=>i),labels=indices.map(i=>String.fromCharCode(97+i));
 const edges=[];for(let a=0;a<n;a++)for(let b=0;b<n;b++)if(mask&(1<<(a*n+b)))edges.push([a,b]);
 const r=(a,b)=>Boolean(mask&(1<<(a*n+b))),P=(a,b)=>r(a,b)&&!r(b,a),I=(a,b)=>!r(a,b)&&!r(b,a);
 const every1=f=>indices.every(f),every2=f=>every1(a=>every1(b=>f(a,b))),every3=f=>every2((a,b)=>every1(c=>f(a,b,c))),some1=f=>indices.some(f);
 const expected={
 reflexive:every1(a=>r(a,a)),irreflexive:every1(a=>!r(a,a)),coreflexive:every2((a,b)=>!r(a,b)||a===b),symmetric:every2((a,b)=>!r(a,b)||r(b,a)),antisymmetric:every2((a,b)=>!(r(a,b)&&r(b,a))||a===b),asymmetric:every2((a,b)=>!r(a,b)||!r(b,a)),transitive:every3((a,b,c)=>!(r(a,b)&&r(b,c))||r(a,c)),antitransitive:every3((a,b,c)=>!(r(a,b)&&r(b,c))||!r(a,c)),dense:every2((a,c)=>!r(a,c)||some1(b=>r(a,b)&&r(b,c))),cotransitive:every3((a,b,c)=>!r(a,c)||r(a,b)||r(b,c)),negative:every3((a,b,c)=>r(a,b)||r(b,c)||!r(a,c)),quasitransitive:every3((a,b,c)=>!(P(a,b)&&P(b,c))||P(a,c)),incomparability:every3((a,b,c)=>!(I(a,b)&&I(b,c))||I(a,c)),
 'right-euclidean':every3((a,b,c)=>!(r(a,b)&&r(a,c))||r(b,c)), 'left-euclidean':every3((a,b,c)=>!(r(b,a)&&r(c,a))||r(b,c)),connex:every2((a,b)=>a===b||r(a,b)||r(b,a)), 'strong-connex':every2((a,b)=>r(a,b)||r(b,a)),trichotomous:every2((a,b)=>[r(a,b),a===b,r(b,a)].filter(Boolean).length===1),modulo:every2((a,b)=>[r(a,b),I(a,b),r(b,a)].filter(Boolean).length===1)&&every1(a=>I(a,a))&&every3((a,b,c)=>!(I(a,b)&&I(b,c))||I(a,c)),serial:every1(a=>some1(b=>r(a,b))), 'right-total':every1(b=>some1(a=>r(a,b))),functional:every3((a,b,c)=>!(r(a,b)&&r(a,c))||b===c),injective:every3((a,b,c)=>!(r(a,c)&&r(b,c))||a===b)
 };
 // Independent reachability check for acyclicity.
 const reach=indices.map(a=>indices.map(b=>r(a,b)));for(let k=0;k<n;k++)for(let a=0;a<n;a++)for(let b=0;b<n;b++)reach[a][b]=reach[a][b]||(reach[a][k]&&reach[k][b]);expected.acyclic=every1(a=>!reach[a][a]);
 const all=context.analyzeRelation(labels,edges);assert.equal(all.length,34);
 for(const row of all){if(row.requires)expected[row.id]=row.requires.every(k=>expected[k]);assert.equal(row.ok,expected[row.id],`${row.id}: n=${n}, mask=${mask}`);assert.ok(row.reason);checks++;}
 assert.equal(expected.cotransitive,expected.negative);if(expected.reflexive)assert.ok(expected.dense);if(expected.transitive)assert.ok(expected.quasitransitive);assert.equal(expected.trichotomous,expected.asymmetric&&expected.connex);if(expected['strict-weak'])assert.ok(expected.modulo);graphs++;
}
process.stdout.write(`PASS: ${graphs} exhaustive graphs, ${checks} property checks. Inline script parses successfully.\n`);

