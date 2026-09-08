"""Real HTTP/module/offline browser checks. Run against the built dist directory."""
import functools
import http.server
import json
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test-output"
OUT.mkdir(exist_ok=True)
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / "dist"))
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_port}/"
errors, cases = [], []
async_setup = """async ({tier,theme}) => {
 const {runtime:r} = await import('./src/state.js');
 const actions = await import('./src/actions.js');
 r.save.score=4000; r.save.tutorialLessonsCompleted=[1,2];
 r.save.ruleIntrosSeen=['cirak','deneyimli','usta','pro'];r.save.theme=theme;
 actions.startGame(tier);
}"""

def report(name):
    cases.append(name)

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={"width":390,"height":844}, device_scale_factor=1)
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(BASE); page.locator('[data-action="start"]').wait_for()
    assert page.locator('[data-action="continue"]').count() == 0
    page.locator('[data-action="start"]').click()
    assert page.locator('[data-action="skip-tutorial"]').count() == 1
    page.locator('[data-action="skip-tutorial"]').click()
    report("first launch and guided tutorial")
    for width,height in [(320,568),(360,640),(390,844),(768,1024)]:
        page.set_viewport_size({"width":width,"height":height})
        for tier in ['acemi','deneyimli','pro']:
            page.evaluate(async_setup, {"tier":tier,"theme":"shapes"})
            dimensions=page.evaluate("""()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,
              sh:document.documentElement.scrollHeight,b:document.querySelector('.tool-row').getBoundingClientRect().bottom})""")
            assert dimensions['sw'] <= width+1 and dimensions['sh'] <= height+1, dimensions
            assert dimensions['b'] <= height+1, dimensions
            assert page.locator('.board .shape-art').count() > 0
            report(f"shape layout {tier} {width}x{height}")
    page.set_viewport_size({"width":390,"height":844})
    page.evaluate(async_setup, {"tier":"acemi","theme":"shapes"})
    cell=page.evaluate("""async()=>{const {runtime:r}=await import('./src/state.js');return r.puzzle.givens.findIndex(v=>!v)}""")
    page.locator(f'[data-cell="{cell}"]').click();page.locator('[data-action="note"]').click()
    value=page.evaluate("""async cell=>{const {runtime:r}=await import('./src/state.js');return (await import('./src/game-core.js')).candidatesFor(r.save.activeGame.values,cell,r.puzzle)[0]}""",cell)
    page.locator(f'[data-token="{value}"]').click()
    assert page.locator('.note-art').count() == 1
    assert page.locator('[data-action="note"]').get_attribute('aria-pressed') == 'true'
    before=page.evaluate("""async()=>{const r=(await import('./src/state.js')).runtime;return {v:r.save.activeGame.values,n:r.save.activeGame.notes}}""")
    page.locator('[data-action="menu"]').click();page.locator('[data-theme="numbers"]').click()
    page.locator('[data-action="close-menu"]').first.click()
    after=page.evaluate("""async()=>{const r=(await import('./src/state.js')).runtime;return {v:r.save.activeGame.values,n:r.save.activeGame.notes}}""")
    assert before == after
    page.reload(); page.locator('[data-action="continue"]').click()
    after=page.evaluate("""async()=>{const r=(await import('./src/state.js')).runtime;return {v:r.save.activeGame.values,n:r.save.activeGame.notes}}""")
    assert before == after
    report("notes and theme preserved through reload")
    page.locator('[data-action="undo"]').click()
    assert page.evaluate("""async()=>Object.keys((await import('./src/state.js')).runtime.save.activeGame.notes).length""")==0
    report("undo after reload")
    page.locator('[data-action="menu"]').click();page.locator('[data-action="settings"]').click()
    page.locator('[data-setting="highContrast"]').focus();page.keyboard.press('Space')
    assert page.locator('[data-setting="highContrast"]').is_checked()
    assert page.locator('[data-setting="highContrast"]').evaluate('(e)=>e===document.activeElement')
    with page.expect_download() as info:
        page.locator('[data-action="export-backup"]').click()
    downloaded=OUT/'roundtrip.json';info.value.save_as(downloaded)
    page.once('dialog', lambda dialog:dialog.accept())
    page.locator('[data-backup-file]').set_input_files(str(downloaded))
    page.locator('[data-action="continue"]').wait_for()
    assert page.evaluate("""async()=> (await import('./src/state.js')).runtime.save.theme""") == 'numbers'
    report("backup download and validated import")
    page.locator('[data-action="settings"]').click()
    page.locator('a[href="./privacy.html"]').click();page.locator('h1').wait_for()
    assert 'Gizlilik' in page.locator('h1').inner_text()
    page.locator('#back').click();page.locator('[data-action="continue"]').wait_for()
    report("privacy and return navigation")
    page.evaluate("""async()=>{await navigator.serviceWorker.ready;}""")
    page.reload(); page.wait_for_function('navigator.serviceWorker.controller !== null')
    context.set_offline(True);page.reload();page.locator('[data-action="continue"]').click()
    assert page.locator('.board').is_visible()
    report("offline reload and continue")
    context.set_offline(False)
    # Actual game screens; demo progress is test-only fixture, never a production bypass.
    for name,tier,theme in [('01-birds','acemi','birds'),('02-shapes','deneyimli','shapes'),('03-classic','pro','numbers')]:
        ctx=browser.new_context(viewport={"width":360,"height":640},device_scale_factor=3)
        shot=ctx.new_page();shot.goto(BASE);shot.locator('[data-action="start"]').wait_for()
        shot.evaluate(async_setup,{"tier":tier,"theme":theme})
        shot.screenshot(path=str(OUT/f'{name}-1080x1920.png'));ctx.close()
    assert not errors, errors
    browser.close()
server.shutdown()
(OUT/'browser-report.json').write_text(json.dumps({"passed":len(cases),"cases":cases,"errors":errors},ensure_ascii=False,indent=2))
print(f"{len(cases)} real HTTP browser checks passed")
