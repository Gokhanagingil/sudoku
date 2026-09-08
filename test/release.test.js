import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createPuzzle, candidatesFor } from "../src/game-core.js";
import { SHAPE_NAMES, shapeSvg } from "../src/shapes.js";
import { elapsedMillis, pauseClock, resumeClock } from "../src/clock.js";
import { parseBackup, stringifyBackup, validateSave } from "../src/backup.js";
import { clone, defaultSave, defaultSettings, runtime, persist } from "../src/state.js";
import { syncNativeContext } from "../src/native.js";

function sample() {
  const s = clone(defaultSave), p = createPuzzle("acemi", 1);
  const cell = p.givens.findIndex(n => !n);
  s.activeGame = { tierId:"acemi", ordinal:1, values:[...p.givens], notes:{[cell]:candidatesFor(p.givens, cell, p)}, history:[], elapsedBefore:42000, startedAt:1000, tutorial:null };
  return s;
}
test("nine stable shape identities are distinct vector drawings", () => {
  assert.equal(SHAPE_NAMES.length, 9);
  assert.equal(new Set(Array.from({length:9},(_,i)=>shapeSvg(i+1))).size, 9);
  assert.match(shapeSvg(1), /circle/); assert.match(shapeSvg(3), /rect/);
  assert.equal(shapeSvg(0), ""); assert.equal(shapeSvg(10), "");
});
test("shape notes use the same vector mapping, not font fallback glyphs", () => {
  for (let i=1;i<=9;i++) assert.equal(shapeSvg(i, true).replace(" note-art", ""), shapeSvg(i));
});
test("timer excludes home, settings, background and off-device hours", () => {
  const g = {elapsedBefore:1000, startedAt:0, clockRunning:false};
  assert.equal(elapsedMillis(g, 90000), 1000);
  resumeClock(g, 100); pauseClock(g, 1100); assert.equal(g.elapsedBefore, 2000);
  pauseClock(g, 99000); assert.equal(g.elapsedBefore, 2000);
  resumeClock(g, 100000); resumeClock(g, 100500); assert.equal(elapsedMillis(g, 101000), 3000);
});
test("backup roundtrip preserves tokens, notes, score and theme; resumes paused", () => {
  const s=sample(); s.theme="shapes"; s.score=250;
  const restored=parseBackup(stringifyBackup(s, defaultSettings));
  assert.equal(restored.save.theme,"shapes"); assert.equal(restored.save.score,250);
  assert.deepEqual(restored.save.activeGame.values,s.activeGame.values);
  assert.deepEqual(restored.save.activeGame.notes,s.activeGame.notes);
  assert.equal(restored.save.activeGame.clockRunning,false);
});
test("corrupt, oversized or unknown-version backup is rejected", () => {
  for(const text of ["not json", JSON.stringify({format:"kus-koyu-denge-backup",version:2}), "x".repeat(2097153)]) assert.throws(()=>parseBackup(text));
});
test("backup cannot modify locked givens or inject markup into game values", () => {
  const s=sample(); const i=s.activeGame.values.findIndex(Boolean); s.activeGame.values[i]=0;
  assert.throws(()=>validateSave(s)); s.activeGame.values[i]="<img onerror=alert(1)>"; assert.throws(()=>validateSave(s));
});
test("malformed notes, tier and undo snapshots are rejected", () => {
  let s=sample();s.activeGame.notes={999:[1]};assert.throws(()=>validateSave(s));
  s=sample();s.selectedTier="unknown";assert.throws(()=>validateSave(s));
  s=sample();s.activeGame.history=[{values:[],notes:{}}];assert.throws(()=>validateSave(s));
});
test("storage exceptions do not crash the game or fake a successful save", () => {
  globalThis.localStorage={getItem:()=>null,setItem:()=>{throw new Error("quota");}};
  assert.equal(persist(), false);assert.match(runtime.storageWarning,/yedek/);
});
test("persistent snapshot is paused and includes elapsed foreground time", () => {
  const data=new Map();globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  runtime.save=sample();resumeClock(runtime.save.activeGame,Date.now()-3000);
  assert.equal(persist(),true);
  const disk=JSON.parse(data.get("kus-koyu-denge-save-v3"));
  assert.equal(disk.activeGame.clockRunning,false);assert.ok(disk.activeGame.elapsedBefore>=45000);
  assert.ok(data.get("kus-koyu-denge-recovery-v1"));
});
test("native ad context: no ads on first launch, game, tutorial, result or settings", async () => {
  const calls=[];globalThis.window={Capacitor:{nativePromise:(_p,_m,options)=>{calls.push(options);return Promise.resolve({});}}};
  globalThis.document={visibilityState:"visible"};
  const r={save:clone(defaultSave),settings:clone(defaultSettings),screen:"home",settingsOpen:false,menuOpen:false};
  await syncNativeContext(r);assert.equal(calls.at(-1).home,false);
  r.save.completed=["acemi-1"];await syncNativeContext(r);assert.equal(calls.at(-1).home,true);
  for(const screen of ["game","result"]) {r.screen=screen;await syncNativeContext(r);assert.equal(calls.at(-1).home,false);}
  r.screen="home";r.settingsOpen=true;await syncNativeContext(r);assert.equal(calls.at(-1).home,false);
  r.settingsOpen=false;document.visibilityState="hidden";await syncNativeContext(r);assert.equal(calls.at(-1).home,false);
});
test("no ad request on browser without native bridge", async () => {
  globalThis.window={};assert.deepEqual(await syncNativeContext({save:clone(defaultSave),settings:defaultSettings,screen:"home"}),{available:false});
});
test("native release gate forbids sample ad IDs and missing permanent owner key", () => {
  const g=readFileSync("android/app/build.gradle","utf8");
  assert.match(g,/releaseRequested && !validation/);assert.match(g,/signingReady/);assert.match(g,/3940256099942544/);
  assert.match(g,/versionCode 2/);assert.match(g,/versionName '1.1.0'/);
});
test("only home banners: consent-gated, non-personalized, isolated native space", () => {
  const c=readFileSync("android/app/src/main/java/com/gokhanagingil/kuskoyusudoku/HomeBanner.java","utf8");
  assert.match(c,/canRequestAds\(\)/);assert.match(c,/eligible\(\)/);assert.match(c,/extras.putString\("npa", "1"\)/);
  assert.match(c,/pageParams.bottomMargin/);assert.doesNotMatch(c,/InterstitialAd|RewardedAd|AppOpenAd/);
});
test("advertising ID and invasive permissions are not requested", () => {
  const m=readFileSync("android/app/src/main/AndroidManifest.xml","utf8");
  assert.match(m,/permission.AD_ID" tools:node="remove"/);
  assert.doesNotMatch(m,/READ_CONTACTS|ACCESS_FINE_LOCATION|READ_EXTERNAL_STORAGE|POST_NOTIFICATIONS/);
});
