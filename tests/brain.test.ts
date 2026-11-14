import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { loadBrain } from '../lib/brain.ts';

test('synthetic corpus loads immutable client ownership and rejects mislabeled fixture routing',()=>{
 const docs=loadBrain(join(process.cwd(),'brain'));
 assert.equal(docs.length,12);assert.equal(docs.filter(d=>d.classification===3).length,2);
 assert.equal(new Set(docs.map(d=>d.id)).size,12);assert.ok(docs.every(d=>d.bodyHash?.length===64));
 const dir=mkdtempSync(join(tmpdir(),'clearance-brain-'));mkdirSync(join(dir,'beacon'));mkdirSync(join(dir,'crest'));
 writeFileSync(join(dir,'beacon','bad.md'),'---\nid: crest-bad\ntitle: Bad\nengagement: crest\nclassification: 2\nversion: 1\n---\nWrong room');
 assert.throws(()=>loadBrain(dir),/ownership/);
});
test('synthetic loader refuses symlinks instead of reading outside the brain root',()=>{
 const dir=mkdtempSync(join(tmpdir(),'clearance-brain-links-'));mkdirSync(join(dir,'beacon'));mkdirSync(join(dir,'crest'));
 const outside=join(mkdtempSync(join(tmpdir(),'clearance-outside-')),'fixture.md');writeFileSync(outside,'synthetic fixture');
 symlinkSync(outside,join(dir,'beacon','linked.md'));
 assert.throws(()=>loadBrain(dir),/symbolic/);
});
