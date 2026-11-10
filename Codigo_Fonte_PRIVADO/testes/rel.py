import os
from playwright.sync_api import sync_playwright
F='file://CAMINHO_DA_PASTA/Kayzen_Ryuu.html';O='shots/r'
HOOK="""window.__n=0;const _AC=window.AudioContext;window.AudioContext=function(){const c=new _AC();const o=c.createOscillator.bind(c);c.createOscillator=function(){window.__n++;return o();};const b=c.createBufferSource.bind(c);c.createBufferSource=function(){window.__n++;return b();};return c;};"""
with sync_playwright() as p:
    b=p.chromium.launch()
    for mob in (False,True):
        ctx=b.new_context(**p.devices['Pixel 7 landscape']) if mob else b.new_context(viewport={'width':1280,'height':720},device_scale_factor=2)
        ctx.add_init_script(HOOK);pg=ctx.new_page();msgs=[]
        pg.on('pageerror',lambda e:msgs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:msgs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
        pg.goto(F);pg.wait_for_timeout(1500)
        box=pg.locator('#c').bounding_box()
        def tap(x,y):
            X,Y=box['x']+x*box['width']/960,box['y']+y*box['height']/540
            pg.touchscreen.tap(X,Y) if mob else pg.mouse.click(X,Y)
        tag='mob' if mob else 'pc'
        pg.screenshot(path=f'{O}_{tag}_0gate.png')
        tap(480,300);pg.wait_for_timeout(300)
        shots=[(1.0,'1old'),(3.5,'1old_b')]
        pg.wait_for_timeout(3000);pg.screenshot(path=f'{O}_{tag}_1old.png')
        for i,name in enumerate(['2quake','3eruption','4winter','5neon','6virus','7hero','8map']):
            tap(480,300);pg.wait_for_timeout(150);tap(480,300);pg.wait_for_timeout(2600 if i<3 else 1600)
            pg.screenshot(path=f'{O}_{tag}_{name}.png')
        tap(480,300);pg.wait_for_timeout(150);tap(480,300);pg.wait_for_timeout(2200);pg.screenshot(path=f'{O}_{tag}_9title.png')
        print(tag,'audio nodes in intro:',pg.evaluate('()=>window.__n'))
        tap(480,446);pg.wait_for_timeout(600);tap(480,300);pg.wait_for_timeout(1200)
        pg.screenshot(path=f'{O}_{tag}_10play.png')
        print(tag,'console access:',pg.evaluate('()=>[typeof window.__game,typeof window.P,typeof window.CFG,typeof window.enemies]'))
        # salvar progresso falso no localStorage deve ser ignorado
        pg.evaluate("()=>{localStorage.setItem('kz_save_v2','eyJ1IjozfQ==.abc');localStorage.setItem('kayzen_unlocked','3');}")
        pg.reload();pg.wait_for_timeout(1200);tap(480,300);pg.wait_for_timeout(300)
        pg.keyboard.press('Escape') if not mob else None
        if mob: tap(900,55)
        pg.wait_for_timeout(1600);pg.screenshot(path=f'{O}_{tag}_11tamper.png')
        print(tag,'messages:',msgs[:10]);ctx.close()
    b.close()
