import { tierForId, unlockedTier } from "./content.js";
import { candidatesFor, createPuzzle, isComplete, logicalHint } from "./game-core.js";
import { releaseWakeLock, requestWakeLock, softFeedback } from "./feedback.js";
import { clone, persist, runtime } from "./state.js";
import { buildTutorial, currentTutorial, markTutorialLessonComplete, normalizeActiveTutorial, tutorialLessonFor } from "./tutorial.js";
import { tokenName } from "./ui.js";

let hooks = {};
export function setActionHooks(value) { hooks = value; }

export function ensurePuzzle() {
  if (!runtime.save.activeGame) return null;
  const expectedId = `${runtime.save.activeGame.tierId}-${runtime.save.activeGame.ordinal}`;
  if (!runtime.puzzle || runtime.puzzle.id !== expectedId) runtime.puzzle = createPuzzle(runtime.save.activeGame.tierId, runtime.save.activeGame.ordinal);
  normalizeActiveTutorial();
  return runtime.puzzle;
}

export function elapsedSeconds() {
  const game = runtime.save.activeGame;
  if (!game) return 0;
  return Math.floor((game.elapsedBefore + Date.now() - game.startedAt) / 1000);
}

export function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;
}

export function setTheme(theme) {
  if (!["birds","shapes","numbers"].includes(theme)) return;
  runtime.save.theme = theme; persist(); softFeedback("select"); hooks.render();
}

export function startGame(tierId = runtime.save.selectedTier) {
  const tier = tierForId(tierId);
  if (runtime.save.score < tier.unlockScore) return;
  const ordinal = runtime.save.nextOrdinal[tierId] || 1;
  runtime.puzzle = createPuzzle(tierId, ordinal);
  runtime.save.activeGame = { tierId, ordinal, values:[...runtime.puzzle.givens], notes:{}, history:[], startedAt:Date.now(), elapsedBefore:0, tutorial:null };
  normalizeActiveTutorial();
  runtime.save.selectedTier = tierId;
  runtime.selectedCell = null; runtime.selectedToken = null; runtime.notesMode = false; runtime.hintFocus = null; runtime.screen = "game";
  persist(); requestWakeLock(); softFeedback("select"); hooks.renderGame();
}

export function continueGame() {
  if (!runtime.save.activeGame) return startGame();
  ensurePuzzle(); runtime.screen = "game"; runtime.selectedCell = null; runtime.selectedToken = null; runtime.hintFocus = null; requestWakeLock(); hooks.renderGame();
}

function tutorialRedirect(message) { softFeedback("nudge"); hooks.toast(message,2600); }

export function selectCell(index) {
  const t = currentTutorial();
  if (t) {
    if (t.lesson===1 && t.stage===0 && index!==t.targetCell) return tutorialRedirect("Bu kez parlayan yuvadan başlayalım.");
    if (t.lesson===2 && t.stage===0) return tutorialRedirect("Önce alttaki Not düğmesine dokun.");
    if (t.lesson===2 && t.stage===1 && index!==t.targetCell) return tutorialRedirect("Notu parlayan yuvada deneyelim.");
    if (t.lesson===2 && t.stage===2 && index!==t.targetCell) return tutorialRedirect("Aday ekleyeceğimiz yuva hâlâ parlıyor.");
  }
  runtime.selectedCell = index; runtime.hintFocus = null;
  if (t?.lesson===1 && t.stage===0 && index===t.targetCell) t.stage=1;
  if (t?.lesson===2 && t.stage===1 && index===t.targetCell) t.stage=2;
  persist();
  if (runtime.selectedToken && !runtime.puzzle.givens[index]) applyValue(index,runtime.selectedToken); else { softFeedback("select"); hooks.renderGame(); }
}

export function selectToken(value) {
  const t=currentTutorial();
  if (t?.lesson===1) { if(t.stage===0)return tutorialRedirect("Önce parlayan yuvayı seç."); if(t.stage===1&&value!==t.targetValue)return tutorialRedirect("Bu adımda tek olasılığı seçiyoruz. Parlayan taşı kullan."); }
  if (t?.lesson===2) { if(t.stage===0)return tutorialRedirect("Önce Not'u aç."); if(t.stage===1)return tutorialRedirect("Önce parlayan yuvayı seç."); if(t.stage===2&&value!==t.noteValue)return tutorialRedirect("Örnekte parlayan adayı küçük not olarak ekleyelim."); }
  runtime.selectedToken=value; runtime.hintFocus=null;
  if(runtime.selectedCell!==null&&!runtime.puzzle.givens[runtime.selectedCell]) applyValue(runtime.selectedCell,value); else {softFeedback("select");hooks.renderGame();}
}

function snapshot(){return{values:[...runtime.save.activeGame.values],notes:clone(runtime.save.activeGame.notes)}}
function pushHistory(){runtime.save.activeGame.history.push(snapshot());if(runtime.save.activeGame.history.length>100)runtime.save.activeGame.history.shift();}

function pruneAllNotes(){const game=runtime.save.activeGame;for(const key of Object.keys(game.notes)){const cell=Number(key);if(game.values[cell]){delete game.notes[cell];continue;}const allowed=new Set(candidatesFor(game.values,cell,runtime.puzzle));const filtered=(game.notes[cell]||[]).filter((value)=>allowed.has(value));if(filtered.length)game.notes[cell]=filtered;else delete game.notes[cell];}}

export function applyValue(index,value){
  const game=runtime.save.activeGame,t=currentTutorial(); if(runtime.puzzle.givens[index])return;
  if(runtime.notesMode&&game.values[index])return tutorialRedirect("Notlar yalnızca boş yuvalara eklenir.");
  pushHistory();
  if(runtime.notesMode){const allowed=candidatesFor(game.values,index,runtime.puzzle);if(!allowed.includes(value)){game.history.pop();return tutorialRedirect("Bu aday mevcut kurallarla bu yuvaya uymaz.");}const current=new Set(game.notes[index]||[]);if(current.has(value))current.delete(value);else current.add(value);if(current.size)game.notes[index]=[...current].sort((a,b)=>a-b);else delete game.notes[index];runtime.save.stats.notes+=1;if(t?.lesson===2&&t.stage===2&&value===t.noteValue)t.stage=3;softFeedback("note");}
  else{game.values[index]=value;delete game.notes[index];pruneAllNotes();runtime.save.stats.placements+=1;if(t?.lesson===1&&t.stage===1&&value===t.targetValue)t.stage=2;softFeedback(value===runtime.puzzle.solution[index]?"place":"nudge");}
  runtime.selectedToken=null;persist();if(isComplete(game.values,runtime.puzzle))finishPuzzle();else hooks.renderGame();
}

export function toggleNotesMode(){const t=currentTutorial();if(t?.lesson===1&&t.stage<2)return tutorialRedirect("Notları ikinci kısa derste göstereceğim.");runtime.notesMode=!runtime.notesMode;if(t?.lesson===2&&t.stage===0&&runtime.notesMode)t.stage=1;runtime.selectedToken=null;persist();softFeedback("select");hooks.renderGame();}

export function undo(){const previous=runtime.save.activeGame.history.pop();if(!previous)return;runtime.save.activeGame.values=previous.values;runtime.save.activeGame.notes=previous.notes;runtime.save.stats.undos+=1;runtime.selectedToken=null;runtime.hintFocus=null;persist();softFeedback("undo");hooks.renderGame();}

export function eraseSelected(){const index=runtime.selectedCell;if(index===null||runtime.puzzle.givens[index])return;const game=runtime.save.activeGame;if(!game.values[index]&&!game.notes[index]?.length)return;pushHistory();game.values[index]=0;delete game.notes[index];runtime.selectedToken=null;runtime.hintFocus=null;persist();softFeedback("erase");hooks.renderGame();}

export function showHint(){const hint=logicalHint(runtime.save.activeGame.values,runtime.puzzle);if(!hint)return hooks.toast("Bu bahçe zaten tamamlanmış görünüyor.");runtime.save.stats.hints+=1;runtime.selectedCell=hint.index;runtime.selectedToken=null;runtime.hintFocus=hint;persist();softFeedback("hint");hooks.renderGame();if(hint.type==="review")hooks.toast(`${hint.reason} Cevabı değiştirmek sana kalıyor.`,6500);else hooks.toast(`${hint.reason} Burada ${tokenName(hint.value)} güçlü aday. Cevabı sen yerleştir.`,6500);}

export function skipTutorial(){const t=currentTutorial();if(!t)return;markTutorialLessonComplete(t.lesson);hooks.renderGame();}
export function finishTutorialCard(){const t=currentTutorial();if(!t)return;markTutorialLessonComplete(t.lesson);softFeedback("complete");hooks.renderGame();}
export function finishRuleIntro(){const id=runtime.save.activeGame?.tierId;if(id&&!runtime.save.ruleIntrosSeen.includes(id))runtime.save.ruleIntrosSeen.push(id);persist();softFeedback("select");hooks.renderGame();}

function finishPuzzle(){const game=runtime.save.activeGame,tier=tierForId(game.tierId),id=`${game.tierId}-${game.ordinal}`,already=runtime.save.completed.includes(id),previous=unlockedTier(runtime.save.score).id,timeText=formatTime(elapsedSeconds());if(!already){runtime.save.completed.push(id);runtime.save.score+=tier.reward;runtime.save.stats.completed+=1;}runtime.save.nextOrdinal[game.tierId]=Math.max(runtime.save.nextOrdinal[game.tierId]||1,game.ordinal+1);const newer=unlockedTier(runtime.save.score).id;runtime.result={tierId:game.tierId,ordinal:game.ordinal,reward:already?0:tier.reward,unlockedNewTier:previous!==newer?tierForId(newer):null,timeText};runtime.save.activeGame=null;persist();releaseWakeLock();softFeedback("complete");hooks.renderResult();}

export function restartGame(){if(!runtime.save.activeGame)return;if(!window.confirm("Bu bahçedeki yerleştirmeleri ve notları temizleyip baştan başlamak istiyor musun?"))return;ensurePuzzle();const game=runtime.save.activeGame;game.values=[...runtime.puzzle.givens];game.notes={};game.history=[];game.startedAt=Date.now();game.elapsedBefore=0;game.tutorial=buildTutorial(tutorialLessonFor(game.tierId,game.ordinal));runtime.selectedCell=null;runtime.selectedToken=null;runtime.hintFocus=null;runtime.notesMode=false;runtime.menuOpen=false;persist();hooks.renderGame();}

export function goHome(){if(runtime.save.activeGame){runtime.save.activeGame.elapsedBefore+=Date.now()-runtime.save.activeGame.startedAt;runtime.save.activeGame.startedAt=Date.now();persist();}runtime.screen="home";runtime.menuOpen=false;runtime.settingsOpen=false;runtime.result=null;runtime.selectedCell=null;runtime.selectedToken=null;runtime.hintFocus=null;hooks.stopTimer();hooks.renderHome();}
