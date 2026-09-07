import { continueGame, elapsedSeconds, eraseSelected, finishRuleIntro, finishTutorialCard, formatTime, goHome, restartGame, selectCell, selectToken, setActionHooks, setTheme, showHint, skipTutorial, startGame, toggleNotesMode, undo } from "./actions.js";
import { releaseWakeLock, requestWakeLock, softFeedback } from "./feedback.js";
import { gameMarkup } from "./game-view.js";
import { homeMarkup } from "./home-view.js";
import { resultShellMarkup } from "./modals.js";
import { persist, runtime } from "./state.js";

const app=document.querySelector("#app");
let toastTimer=null,tickTimer=null;

function showToast(message,duration=3500){const toast=document.querySelector("#toast");if(!toast)return;clearTimeout(toastTimer);toast.textContent=message;toast.classList.add("show");toastTimer=setTimeout(()=>toast.classList.remove("show"),duration);}
function stopTimerTick(){if(tickTimer)clearInterval(tickTimer);tickTimer=null;}
function startTimerTick(){stopTimerTick();if(!runtime.settings.showTimer||!runtime.save.activeGame)return;tickTimer=setInterval(()=>{const timer=document.querySelector("[data-timer]");if(timer)timer.textContent=formatTime(elapsedSeconds());},1000);}

function bindCommon(){
  app.querySelectorAll("[data-action='settings']").forEach((button)=>button.addEventListener("click",()=>{runtime.menuOpen=false;runtime.settingsOpen=true;render();}));
  app.querySelectorAll("[data-action='close-settings']").forEach((button)=>button.addEventListener("click",(event)=>{if(event.currentTarget!==event.target&&event.currentTarget.classList.contains("modal-layer"))return;runtime.settingsOpen=false;render();}));
  app.querySelectorAll("[data-action='home']").forEach((button)=>button.addEventListener("click",goHome));
  app.querySelectorAll("[data-action='menu']").forEach((button)=>button.addEventListener("click",()=>{runtime.menuOpen=true;renderGame();}));
  app.querySelectorAll("[data-action='close-menu']").forEach((button)=>button.addEventListener("click",()=>{runtime.menuOpen=false;renderGame();}));
  app.querySelectorAll("[data-action='start']").forEach((button)=>button.addEventListener("click",()=>startGame()));
  app.querySelectorAll("[data-action='continue']").forEach((button)=>button.addEventListener("click",continueGame));
  app.querySelectorAll("[data-action='next-puzzle']").forEach((button)=>button.addEventListener("click",()=>{const next=runtime.result.unlockedNewTier||{id:runtime.result.tierId};runtime.result=null;runtime.save.selectedTier=next.id;persist();startGame(next.id);}));
  app.querySelectorAll("[data-action='restart']").forEach((button)=>button.addEventListener("click",restartGame));
  app.querySelectorAll("[data-theme]").forEach((button)=>button.addEventListener("click",()=>setTheme(button.dataset.theme)));
  app.querySelectorAll("[data-setting]").forEach((input)=>input.addEventListener("change",()=>{runtime.settings[input.dataset.setting]=input.checked;persist();if(input.dataset.setting==="keepAwake")input.checked?requestWakeLock():releaseWakeLock();softFeedback("select");render();}));
}

export function renderHome(){stopTimerTick();releaseWakeLock();app.innerHTML=homeMarkup();bindCommon();app.querySelectorAll("[data-tier]").forEach((button)=>button.addEventListener("click",()=>{runtime.save.selectedTier=button.dataset.tier;persist();softFeedback("select");renderHome();}));}

export function renderGame(){if(!runtime.save.activeGame)return renderHome();app.innerHTML=gameMarkup(formatTime(elapsedSeconds()));bindCommon();app.querySelectorAll("[data-cell]").forEach((cell)=>cell.addEventListener("click",()=>selectCell(Number(cell.dataset.cell))));app.querySelectorAll("[data-token]").forEach((token)=>token.addEventListener("click",()=>selectToken(Number(token.dataset.token))));app.querySelector("[data-action='note']")?.addEventListener("click",toggleNotesMode);app.querySelector("[data-action='undo']")?.addEventListener("click",undo);app.querySelector("[data-action='erase']")?.addEventListener("click",eraseSelected);app.querySelector("[data-action='hint']")?.addEventListener("click",showHint);app.querySelector("[data-action='skip-tutorial']")?.addEventListener("click",skipTutorial);app.querySelector("[data-action='finish-tutorial']")?.addEventListener("click",finishTutorialCard);app.querySelector("[data-action='finish-rule-intro']")?.addEventListener("click",finishRuleIntro);startTimerTick();}

export function renderResult(){stopTimerTick();app.innerHTML=resultShellMarkup();bindCommon();}
function render(){if(runtime.screen==="game"&&runtime.save.activeGame)renderGame();else renderHome();}
setActionHooks({render,renderHome,renderGame,renderResult,toast:showToast,stopTimer:stopTimerTick});

document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")requestWakeLock();});
window.addEventListener("beforeunload",()=>{if(runtime.save.activeGame){runtime.save.activeGame.elapsedBefore+=Date.now()-runtime.save.activeGame.startedAt;runtime.save.activeGame.startedAt=Date.now();persist();}});
if("serviceWorker" in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();
